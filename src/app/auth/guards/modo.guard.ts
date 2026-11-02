import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService, Modo } from '../services/auth.service';

export const modoGuard = (requerido: Modo): CanActivateFn => async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.authStatus() === 'checking') await firstValueFrom(auth.checkStatus());

  if (auth.authStatus() !== 'authenticated') return router.createUrlTree(['/auth/login']);
  if (auth.rolesDisponibles().length === 0)  return router.createUrlTree(['/sin-acceso']); // estudiantes
  if (auth.necesitaElegirModo())             return router.createUrlTree(['/elegir-modo']);

  return auth.modo() === requerido
    ? true
    : router.createUrlTree([auth.modo() === 'admin' ? '/admin' : '/profesor']);
};