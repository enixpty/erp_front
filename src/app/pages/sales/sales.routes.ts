import { Routes } from '@angular/router';
import { ListClientComponent } from '@page/sales/clients/list-client';
import { ClientFormComponent } from '@page/sales/clients/client-form';
import { ListQuotationComponent } from '@page/sales/quotations/list-quotation';
import { QuotationFormComponent } from '@page/sales/quotations/quotation-form';
import { ListSalesOrderComponent } from '@page/sales/sales-orders/list-sales-order';
import { SalesOrderDetailComponent } from '@page/sales/sales-orders/sales-order-detail';
import { ListSalesInvoiceComponent } from '@page/sales/invoices/list-sales-invoice';
import { SalesInvoiceFormComponent } from '@page/sales/invoices/sales-invoice-form';
import { SalesInvoiceDetailComponent } from '@page/sales/invoices/sales-invoice-detail';
import { CreditNoteFormComponent } from '@page/sales/credit-notes/credit-note-form';
import { ListCreditNoteComponent } from '@page/sales/credit-notes/list-credit-note/list-credit-note';
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
    },
    {
        path: 'sales-orders',
        component: ListSalesOrderComponent
    },
    {
        path: 'sales-orders/:id',
        component: SalesOrderDetailComponent
    },
    {
        path: 'invoices',
        component: ListSalesInvoiceComponent
    },
    {
        path: 'invoices/new',
        component: SalesInvoiceFormComponent
    },
    {
        path: 'invoices/:id',
        component: SalesInvoiceDetailComponent
    },
    {
        path: 'credit-notes',
        component: ListCreditNoteComponent
    },
    {
        path: 'credit-notes/new',
        component: CreditNoteFormComponent
    },
    {
        path: 'payment-types',
        loadComponent: () => import('./payment-types/list-payment-type').then(c => c.ListPaymentTypeComponent)
    }
];
