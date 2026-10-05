import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserResponse, AuthResponse } from '../interfaces/auth-response';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { Router } from '@angular/router';

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';
export type Modo = 'admin' | 'profesor';
const baseUrl = environment.baseUrl;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Estados
  private _authStatus = signal<AuthStatus>('checking');
  private _user = signal<UserResponse | null>(null);
  private _token = signal<string | null>(localStorage.getItem('token'));
  private _modo = signal<Modo | null>(sessionStorage.getItem('modo') as Modo | null);

  // Signals públicos
  public authStatus = computed(() => this._authStatus());
  public user = computed(() => this._user());
  public token = computed(() => this._token());

  // Roles que realmente tiene el usuario
  public rolesDisponibles = computed<Modo[]>(() => {
    const roles = this._user()?.roles ?? [];
    const r: Modo[] = [];
    if (roles.includes('admin')) r.push('admin');
    if (roles.includes('docente') || roles.includes('profesor')) r.push('profesor');
    return r;
  });

  // Modo activo: el elegido (si sigue siendo válido) o el único disponible
  public modo = computed<Modo | null>(() => {
    const disp = this.rolesDisponibles();
    const m = this._modo();
    if (m && disp.includes(m)) return m;
    return disp.length === 1 ? disp[0] : null;
  });

  public necesitaElegirModo = computed(
    () => this.rolesDisponibles().length > 1 && this.modo() === null
  );

  // Ahora depende del modo, no solo del rol
  public isAdmin = computed(() => this.modo() === 'admin');

  elegirModo(m: Modo) {
    sessionStorage.setItem('modo', m);
    this._modo.set(m);
  }

  cambiarModo() {
    sessionStorage.removeItem('modo');
    this._modo.set(null);
    this.router.navigateByUrl('/elegir-modo');
  }

  checkStatus(): Observable<boolean> {
    const token = this.token();
    if (!token) { this.clearSession(); return of(false); }

    this._authStatus.set('checking');

    return this.http.get<UserResponse>(`${baseUrl}/auth/profile`).pipe(
      tap(user => this.handleAuthSuccess({ access_token: token, user })),
      map(() => true),
      catchError(() => { this.clearSession(); return of(false); })
    );
  }

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${baseUrl}/auth/login`, { email, password }).pipe(
      tap(response => {
        // Nuevo login = nueva elección de modo
        sessionStorage.removeItem('modo');
        this._modo.set(null);
        this.handleAuthSuccess(response);
      }),
      map(() => true),
      catchError(() => this.handleAuthError())
    );
  }

  logout() {
    this.clearSession();
    this.router.navigateByUrl('');
  }

  // Limpia estado sin navegar (lo usan los guards vía checkStatus)
  private clearSession() {
    this._authStatus.set('unauthenticated');
    this._token.set(null);
    this._user.set(null);
    this._modo.set(null);
    localStorage.removeItem('token');
    sessionStorage.removeItem('modo');
  }

  private handleAuthSuccess(response: AuthResponse) {
    this._authStatus.set('authenticated');
    this._token.set(response.access_token);
    this._user.set(response.user);
    localStorage.setItem('token', response.access_token);
  }

  private handleAuthError() {
    this.clearSession();
    return of(false);
  }
}