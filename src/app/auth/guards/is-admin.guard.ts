import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// is-admin.guard.ts
export const isAdminGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) return true;
  if (auth.necesitaElegirModo()) return router.createUrlTree(['/elegir-modo']);
  return router.createUrlTree(['/profesor']);
};