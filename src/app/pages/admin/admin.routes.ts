import { Routes } from '@angular/router';
import { AuditListComponent } from './audit/audit-list';

export const adminRoutes: Routes = [
    {
        path: 'list-audit',
        component: AuditListComponent
    }
];
