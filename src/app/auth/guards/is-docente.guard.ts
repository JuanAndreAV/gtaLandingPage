// is-profesor.guard.ts (nuevo)

import { inject } from "@angular/core";
import { CanMatchFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const isDocenteGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.necesitaElegirModo()) return router.createUrlTree(['/elegir-modo']);
  if (auth.modo() === 'profesor') return true;
  return router.createUrlTree(['/admin']);
};