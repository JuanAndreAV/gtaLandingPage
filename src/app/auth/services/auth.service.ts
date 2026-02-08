import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal,  } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserResponse } from '../interfaces/auth-response';
import { AuthResponse } from '../interfaces/auth-response';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';
const baseUrl = environment.baseUrl;


@Injectable({
  providedIn: 'root'
})
export class AuthService {
private http = inject(HttpClient);
  private router = inject(Router);

  // Estados
  private _authStatus = signal<AuthStatus>('checking');
  private _user = signal<UserResponse | null>(null);
  private _token = signal<string | null>(localStorage.getItem('token'));

  // Signals Públicos
  public authStatus = computed(() => this._authStatus());
  public user = computed(() => this._user());
  public isAdmin = computed(() => 
    !!this._user()?.user_metadata.role.includes('admin')
  );
  public token = computed(() => this._token());

  // constructor() {
  //   // Al iniciar el servicio, verificamos el estado automáticamente
  //   this.checkStatus().subscribe();
  // }

  checkStatus(): Observable<boolean> {
    //const token = localStorage.getItem('token');
    const token = this.token();
    if (!token) {
      this.logout();
      return of(false);
    }

    this._authStatus.set('checking');

    return this.http.get<AuthResponse>(`${baseUrl}/auth/profile`/*, {
      headers: { 'Authorization': `Bearer ${token}` }
    }*/).pipe(
      tap(response => this.handleAuthSuccess(response)),
      map(() => true),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }



 login(email: string, password: string): Observable<boolean>{ // para el manejo de excepciones
  return this.http.post<AuthResponse>(`${baseUrl}/auth/login`, {email, password}).pipe(
    tap(response => this.handleAuthSuccess(response)
    //   {
    //   this._authStatus.set('authenticated');
    //   this._token.set(response.access_token);
    //   this._user.set(response.user);

    //   localStorage.setItem('token', response.access_token);
    // }
  ),
    map(()=> true),//al usar el map devolvemos un booleano
    catchError((error: any) => this.handleAuthError(error)
    //    {
    //   this._authStatus.set('unauthenticated');
    //   this._token.set(null);
    //   this._user.set(null);
    //   localStorage.removeItem('token');
    //   return of(false);
    // }
  )
  );
 }
  
  logout(){
    this._authStatus.set('unauthenticated');
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem('token');
    this.router.navigateByUrl('');
    
   }

   private handleAuthSuccess(response: AuthResponse){
    this._authStatus.set('authenticated');
      this._token.set(response.access_token);
      this._user.set(response.user);

      localStorage.setItem('token', response.access_token);
   }
   private handleAuthError(error: any){
    this.logout();
    return of(false)
   }
}


