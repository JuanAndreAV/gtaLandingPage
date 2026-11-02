import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap, map, catchError, of, throwError, finalize, shareReplay } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { UserResponse } from '../interfaces/auth-response';

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';
export type Modo = 'admin' | 'profesor';
const baseUrl = environment.baseUrl;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _authStatus = signal<AuthStatus>('checking');
  private _user = signal<UserResponse | null>(null);
  private _modo = signal<Modo | null>(sessionStorage.getItem('modo') as Modo | null);
  private refresh$?: Observable<boolean>;

  constructor() { localStorage.removeItem('token'); } // limpia el token viejo

  public authStatus = computed(() => this._authStatus());
  public user = computed(() => this._user());

  public rolesDisponibles = computed<Modo[]>(() => {
    const roles = this._user()?.roles ?? [];
    const r: Modo[] = [];
    if (roles.includes('admin')) r.push('admin');
    if (roles.includes('docente') || roles.includes('profesor')) r.push('profesor');
    return r;
  });

  public modo = computed<Modo | null>(() => {
    const disp = this.rolesDisponibles();
    const m = this._modo();
    if (m && disp.includes(m)) return m;
    return disp.length === 1 ? disp[0] : null;
  });

  public necesitaElegirModo = computed(() => this.rolesDisponibles().length > 1 && this.modo() === null);
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

  // Ya no hay token en el front: la cookie viaja sola
  checkStatus(): Observable<boolean> {
    this._authStatus.set('checking');
    return this.http.get<UserResponse>(`${baseUrl}/auth/profile`).pipe(
      tap(user => this.setUser(user)),
      map(() => true),
      catchError(() => { this.clearSession(); return of(false); }),
    );
  }

  // acepta correo o documento
  login(identificador: string, password: string): Observable<boolean> {
    const body = identificador.includes('@')
      ? { email: identificador.trim(), password }
      : { documento: identificador.trim(), password };

    return this.http.post<{ user: UserResponse }>(`${baseUrl}/auth/login`, body).pipe(
      tap(res => {
        sessionStorage.removeItem('modo');
        this._modo.set(null);
        this.setUser(res.user);
      }),
      map(() => true),
      catchError(() => { this.clearSession(); return of(false); }),
    );
  }

  refresh(): Observable<boolean> {
    this.refresh$ ??= this.http.post(`${baseUrl}/auth/refresh`, {}).pipe(
      map(() => true),
      finalize(() => (this.refresh$ = undefined)),
      shareReplay(1),
    );
    return this.refresh$.pipe(
      catchError(e => { this.clearSession(); return throwError(() => e); }),
    );
  }

  logout() {
    this.http.post(`${baseUrl}/auth/logout`, {}).subscribe({ complete: () => this.finLogout(), error: () => this.finLogout() });
  }
  private finLogout() { this.clearSession(); this.router.navigateByUrl(''); }

  private setUser(user: UserResponse) {
    this._user.set(user);
    this._authStatus.set('authenticated');
  }

  private clearSession() {
    this._authStatus.set('unauthenticated');
    this._user.set(null);
    this._modo.set(null);
    sessionStorage.removeItem('modo');
  }
}