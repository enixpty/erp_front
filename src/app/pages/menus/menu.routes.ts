import { Routes } from '@angular/router';   
import { CreateMenu } from './create-menu/create-menu';
import { ListMenu } from './list-menu/list-menu';
import { MenuRoles } from './menu-roles/menu-roles';

export const menuRoutes: Routes = [
    {
        path:'menu-list',
        component: ListMenu
    },
    {
        path: 'menu-create',
        component: CreateMenu
    },
    {
        path: 'menu-role',
        component: MenuRoles
    }
];
