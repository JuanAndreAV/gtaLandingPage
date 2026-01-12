import { inject } from "@angular/core";
import { CanMatchFn, Route, UrlSegment, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { firstValueFrom } from "rxjs";

export const isAdminGuard: CanMatchFn = async(route: Route, segments: UrlSegment[]) => {
  const authService = inject(AuthService);
  const router = inject(Router);
    //const user = authService.user();
    // console.log(user?.user_metadata.role);
    // if (user?.user_metadata.role !== 'admin') {
    //     router.navigateByUrl('/');
    //     return false;
    // }
    // return true;
    const isAuthenticated = await authService.isAdmin()
    if (!isAuthenticated) {
        router.navigateByUrl('/');
        return false;
    }
    return true;
   


    
};