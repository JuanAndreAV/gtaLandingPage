import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const isAdminGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificamos el rol usando el computed del service
  if (authService.isAdmin()) return true;

  // Si es autenticado pero NO es admin (es profesor), lo mandamos a su panel
  if (authService.authStatus() === 'authenticated') {
    router.navigateByUrl('/profesor');
    return false;
  }

  router.navigateByUrl('/login');
  return false;
};