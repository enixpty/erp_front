import { Routes } from '@angular/router'; 
import { ListPurchaseOrderComponent } from './list-purchase-order';
import { OrderFormComponent } from './order-form';
import { OrderNewComponent } from './order-new/order-new';
import { ReceiptFormComponent } from './receipt/receipt-form';
import { ListReceiptsComponent } from './list-receipts/list-receipts';
import { ReceiptDetailComponent } from './receipt-detail';
import { ListBillComponent } from './bill/list-bill.component';
import { BillFormComponent } from './bill/bill-form.component';
import { ListReturnComponent } from './return/list-return.component';
import { ReturnFormComponent } from './return/return-form.component';
import { ListDebitNoteComponent } from './debit-note/list-debit-note';
import { DebitNoteFormComponent } from './debit-note/debit-note-form';

import { SmartPurchaseComponent } from './smart-purchase/smart-purchase';

export const purchasesRoutes: Routes = [
    {
        path: 'smart-purchase',
        component: SmartPurchaseComponent
    },
    {
        path: 'debit-notes',
        component: ListDebitNoteComponent
    },
    {
        path: 'debit-notes/new',
        component: DebitNoteFormComponent
    },
    {
        path: 'orders',
        component: ListPurchaseOrderComponent
    },
    {
        path: 'order/:id',
        component: OrderFormComponent
    },
    {
        path: 'order-new',
        component: OrderNewComponent
    },
    {
        path: 'receipt/:id',
        component: ReceiptFormComponent
    },
    {
        path: 'receipts',
        component: ListReceiptsComponent
    },
    {
        path: 'receipt-detail/:id',
        component: ReceiptDetailComponent
    },
    {
        path: 'bill/new',
        component: BillFormComponent
    },
    {
        path: 'list-bill',
        component: ListBillComponent
    },
    {
        path: 'return',
        component: ListReturnComponent
    },
    {
        path: 'return/new',
        component: ReturnFormComponent
    }
];
