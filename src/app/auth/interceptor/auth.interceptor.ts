import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.baseUrl)) return next(req);

  const auth = inject(AuthService);
  const peticion = req.clone({ withCredentials: true });

  return next(peticion).pipe(
    catchError(err => {
      const esLoginORefresh = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');
      if (err.status !== 401 || esLoginORefresh) return throwError(() => err);
      // Access token vencido: renueva una vez y reintenta
      return auth.refresh().pipe(switchMap(() => next(peticion)));
    }),
  );
};