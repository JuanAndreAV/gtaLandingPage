import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal,  } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserResponse } from '../interfaces/auth-response';
import { AuthResponse } from '../interfaces/auth-response';
import { Observable, tap, map, catchError, of} from 'rxjs';

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';
const baseUrl = environment.baseUrl;


@Injectable({
  providedIn: 'root'
})
export class AuthService {
private _authStatus = signal<AuthStatus>('checking');
private _token = signal<string | null>(null);
private _user = signal<UserResponse | null>(null); //crear interfaz usuario

private http = inject(HttpClient);
authStatus = computed<AuthStatus>(()=> {
  if(this._authStatus() === 'checking')return 'checking';
  if(this._user())return 'authenticated';
  return 'unauthenticated';
} );
 user = computed<UserResponse | null>(()=> this._user());
 token = computed<string | null>(()=> this._token());

 login(email: string, password: string): Observable<boolean>{
  return this.http.post<AuthResponse>(`${baseUrl}/auth/login`, {email, password}).pipe(
    tap(response => {
      this._authStatus.set('authenticated');
      this._token.set(response.access_token);
      this._user.set(response.user);

      localStorage.setItem('token', response.access_token);
    }),
    map(()=> true),//al usar el map devolvemos un booleano
    catchError((error: any) => {
      this._authStatus.set('unauthenticated');
      this._token.set(null);
      this._user.set(null);
      localStorage.removeItem('token');
      return of(false);
    })
  );
 }
}
