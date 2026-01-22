import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const isAuthenticatedGuard: CanMatchFn = async (route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Si está verificando (F5), esperamos a que termine
  if (authService.authStatus() === 'checking') {
    await firstValueFrom(authService.checkStatus());
  }

  // 2. Si después de verificar está autenticado, pasa
  if (authService.authStatus() === 'authenticated') return true;

  // 3. Si no, al login
  router.navigateByUrl('/login');
  return false;
};