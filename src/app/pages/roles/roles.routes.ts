import { Routes } from '@angular/router';  
import { ListRoles } from './list-roles/list-roles';
import { CreateRole } from './create-role/create-role';

export const rolesRoutes: Routes = [
    {
        path:'roles-list',
        component: ListRoles
    },
    {
        path: 'roles-create',
        component: CreateRole
    }
];
