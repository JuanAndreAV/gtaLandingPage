import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const notAuthenticatedGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si ya está autenticado, lo sacamos del login
  if (authService.authStatus() === 'authenticated') {
    const dashboard = authService.isAdmin() ? '/admin' : '/profesor';
    router.navigateByUrl(dashboard);
    return false;
  }

  // Si está 'checking' o 'unauthenticated', permitimos ver el login
  return true;
};