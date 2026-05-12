import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Customtable } from '@src/app/components/customTable/customtable';
import { AccountPayableService } from '@src/app/services/account-payable.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { RouterLink } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PaymentFormComponent } from './payment-form.component';

@Component({
  selector: 'app-list-payables',
  standalone: true,
  imports: [CommonModule, Customtable, ButtonModule, CardModule, RouterLink, PaymentFormComponent, ToastModule],
  providers: [MessageService],
  templateUrl: './list-payables.html'
})
export class ListPayablesComponent {
  private payablesService = inject(AccountPayableService);
  
  @ViewChild(PaymentFormComponent) paymentForm!: PaymentFormComponent;

  cols = [
    { field: 'id', header: 'ID' },
    { field: 'invoice', header: 'ID Factura' },
    { field: 'total_amount', header: 'Total' },
    { field: 'amount_paid', header: 'Pagado' },
    { field: 'due_date', header: 'Fecha Vencimiento' },
    { field: 'aging', header: 'Antigüedad' },
    { field: 'status', header: 'Estado' },
    { field: 'action', header: 'Acciones' }
  ];

  loadPayables = (params: any) => this.payablesService.getAccountsPayable(params);

  calculateAging(dueDate: string): string {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Vencida (' + Math.abs(diffDays) + ' días)';
    if (diffDays === 0) return 'Vence hoy';
    return 'En ' + diffDays + ' días';
  }

  openPaymentModal(item: any) {
    this.paymentForm.open(item);
  }
}
