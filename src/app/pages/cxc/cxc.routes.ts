import { Routes } from '@angular/router';
import { AgingMonitorComponent } from './aging-monitor/aging-monitor';
import { AgingReportComponent } from './aging-report/aging-report';
import { ListAuthorizationsComponent } from './authorizations/list-authorizations';
import { PaymentApplicationComponent } from './payment-form/payment-application';
import { AccountStatementCutComponent } from './account-statement-cut/account-statement-cut';

export const cxcRoutes: Routes = [
    {
        path: 'aging-monitor',
        component: AgingMonitorComponent
    },
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
    },
    {
        path: 'account-statement-cut',
        component: AccountStatementCutComponent
    }
];
