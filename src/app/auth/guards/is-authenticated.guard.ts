import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

// is-authenticated.guard.ts
export const isAuthenticatedGuard: CanMatchFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.authStatus() === 'checking') {
    await firstValueFrom(auth.checkStatus());
  }
  return auth.authStatus() === 'authenticated'
    ? true
    : router.createUrlTree(['/auth/login']);
};