import { Routes } from '@angular/router';
import { AgingReportComponent } from './aging-report/aging-report';
import { ListAuthorizationsComponent } from './authorizations/list-authorizations';
import { PaymentApplicationComponent } from './payment-form/payment-application';

export const cxcRoutes: Routes = [
    {
        path: 'aging-report',
        component: AgingReportComponent
    },
    {
        path: 'authorizations',
        component: ListAuthorizationsComponent
    },
    {
        path: 'payment-application',
        component: PaymentApplicationComponent
    }
];
