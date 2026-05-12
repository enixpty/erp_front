import { inject } from "@angular/core";
import { CanActivateFn, CanMatchFn, Route, Router, UrlSegment } from "@angular/router";
import { AuthService } from "@auth/services/auth.services";
import { firstValueFrom } from "rxjs";

export const AuthenticatedGuard: CanMatchFn =  async (
    route: Route,
    segments: UrlSegment[]
) => {
    
    const authService = inject(AuthService);
    const router = inject(Router);

    const isAuthenticated = await firstValueFrom(authService.checkStatus())
    if(isAuthenticated){ 
        return true
    }
    router.navigateByUrl('/auth/login')
    return false 
}

export const publicGuard: CanMatchFn = async () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const isAuthenticated = await firstValueFrom(authService.checkStatus())
    
    if (isAuthenticated) {
        router.navigateByUrl('/home');
        return false;
    }

    return true;
};