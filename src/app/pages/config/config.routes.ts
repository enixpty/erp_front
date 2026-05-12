import { Routes } from '@angular/router';
import { ListLvalComponent } from './lval/list-lval/list-lval';
import { CompanyComponent } from './company/company';

export const configRoutes: Routes = [
    {
        path: 'lval',
        component: ListLvalComponent
    },
    {
        path: 'company',
        component: CompanyComponent
    }
];
