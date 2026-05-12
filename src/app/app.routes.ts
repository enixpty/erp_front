import { Routes } from '@angular/router';
import { AuthenticatedGuard, publicGuard } from '@auth/guards/not-authenticated.guard';
import { Home } from '@page/home/home';

export const routes: Routes = [
    {
        path:'home',
        component: Home,
        canMatch: [AuthenticatedGuard] ,
        
    },
    {
        path: 'auth',
        loadChildren: () => import('@auth/auth.routes').then(m => m.authRoutes), 
        canMatch: [publicGuard] 
    },
        {
        path: 'menu',
        loadChildren: () => import('./pages/menus/menu.routes').then(m =>m.menuRoutes),
        canMatch: [AuthenticatedGuard] ,

    },
    {
        path: 'users',
        loadChildren: () => import('./pages/users/users.routes').then(m =>m.usersRoutes),
        canMatch: [AuthenticatedGuard] ,

    },
    
    {
        path: 'roles',
        loadChildren: () => import('./pages/roles/roles.routes').then(m =>m.rolesRoutes),
        canMatch: [AuthenticatedGuard] ,

    },
    {
        path: 'config',
        loadChildren: () => import('./pages/config/config.routes').then(m => m.configRoutes),
        canMatch: [AuthenticatedGuard],
    },
    {
        path: 'inventory',
        loadChildren: () => import('./pages/inventory/inventory.routes').then(m => m.inventoryRoutes),
        canMatch: [AuthenticatedGuard],
    },
    {
        path: 'purchases',
         loadChildren: () => import('./pages/purchases/purchases.routes').then(m => m.purchasesRoutes),
        canMatch: [AuthenticatedGuard],
    },
    {
        path: 'payables',
        loadChildren: () => import('./pages/payables/payables.routes').then(m => m.PAYABLES_ROUTES),
        canMatch: [AuthenticatedGuard],
    },
    {
        path: '**',
        redirectTo: 'home'
    }
];
