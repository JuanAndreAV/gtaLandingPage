import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal,  } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserResponse } from '../interfaces/auth-response';
import { AuthResponse } from '../interfaces/auth-response';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';
const baseUrl = environment.baseUrl;


@Injectable({
  providedIn: 'root'
})
export class AuthService {
private _authStatus = signal<AuthStatus>('checking');
private _token = signal<string | null>(localStorage.getItem('token'));
private _user = signal<UserResponse | null>(null); //crear interfaz usuario

private http = inject(HttpClient);

// checkStatusResource = rxResource({
  
//   loader: ()=> this.checkStatus()
// });//no pude implementar 

authStatus = computed<AuthStatus>(()=> {
  if(this._authStatus() === 'checking')return 'checking';
  if(this._user())return 'authenticated';
  return 'unauthenticated';
} );
 user = computed<UserResponse | null>(()=> this._user());
 token = computed<string | null>(()=> this._token());
 isAdmin = computed<boolean>(()=> this._user()?.user_metadata.role.includes('admin') ?true : false);


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
  checkStatus(): Observable<boolean>{
    const token =localStorage.getItem('token');
    if(!token){
      //this._authStatus.set('unauthenticated');
      this.logout()
      return of(false);
    }
    return this.http.get<AuthResponse>(`${baseUrl}/auth/profile`,{
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).pipe(
    tap(response => this.handleAuthSuccess(response)),
    map(()=> true),//al usar el map devolvemos un booleano
    catchError((error: any) => this.handleAuthError(error))
  );
  }
  logout(){
    this._authStatus.set('unauthenticated');
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem('token');
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


