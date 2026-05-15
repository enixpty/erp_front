import { Routes } from '@angular/router';
import { ListClientComponent } from '@page/sales/clients/list-client';
import { ClientFormComponent } from '@page/sales/clients/client-form';
import { ListQuotationComponent } from '@page/sales/quotations/list-quotation';
import { QuotationFormComponent } from '@page/sales/quotations/quotation-form';

export const salesRoutes: Routes = [
    {
        path: 'clients',
        component: ListClientComponent
    },
    {
        path: 'clients/new',
        component: ClientFormComponent
    },
    {
        path: 'clients/edit/:id',
        component: ClientFormComponent
    },
    {
        path: 'quotations',
        component: ListQuotationComponent
    },
    {
        path: 'quotations/new',
        component: QuotationFormComponent
    },
    {
        path: 'quotations/edit/:id',
        component: QuotationFormComponent
    }
];
