import { Routes } from '@angular/router'; 
import { ListUser } from './list-user/list-user';
import { CreateUser } from './create-user/create-user';

export const usersRoutes: Routes = [
    {
        path:'user-list',
        component: ListUser
    },
    {
        path: 'user-create',
        component: CreateUser
    }
];
