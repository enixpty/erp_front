import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { AccountReceivableService } from '@src/app/services/account-receivable.service';
import { ClientService } from '@src/app/services/client.service';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-payment-application',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CardModule, ButtonModule, InputTextModule, InputNumberModule, DatePickerModule, Select, TableModule, ToastModule],
  providers: [MessageService],
  templateUrl: './payment-application.html'
})
export class PaymentApplicationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private arService = inject(AccountReceivableService);
  private clientService = inject(ClientService);
  private msg = inject(MessageService);
  private cd = inject(ChangeDetectorRef);

  clients: any[] = [];
  invoices: any[] = [];
  
  form: FormGroup = this.fb.group({
    client_id: [null, Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    payment_date: [new Date(), Validators.required],
    reference: ['']
  });

  ngOnInit() {
    this.clientService.getClients({}).subscribe(data => {
        const allClients = data.results || data;
        this.clients = allClients.filter((c: any) => c.payment_term === 'CREDIT');
        this.cd.detectChanges();
    });
  }

  onClientSelect() {
    const clientId = this.form.get('client_id')?.value;
    if (clientId) {
      this.arService.getPendingByClient(clientId).subscribe(invoices => {
        this.invoices = invoices.map(inv => ({ ...inv, amount_applied: 0 }));
      });
    }
  }

  sortInvoices = (a: any, b: any) => {
    return new Date(a.value.due_date).getTime() - new Date(b.value.due_date).getTime();
  };

  get remainingAmount() {
    const totalPayment = this.form.get('amount')?.value || 0;
    const sumApplied = this.invoices.reduce((sum, i) => sum + (i.amount_applied || 0), 0);
    return totalPayment - sumApplied;
  }

  validateAmount(inv: any) {
    // Redondear a 2 decimales inmediatamente
    inv.amount_applied = Math.round(Number(inv.amount_applied) * 100) / 100;
    
    const pending = inv.total_amount - inv.amount_paid;
    const totalReceived = this.form.get('amount')?.value || 0;
    
    // 1. Validar contra saldo pendiente de la factura
    if (inv.amount_applied > pending) {
      this.msg.add({ severity: 'error', summary: 'Monto Inválido', detail: `El monto (${inv.amount_applied}) no puede superar el saldo pendiente de la factura (${pending})` });
      inv.amount_applied = 0;
      return;
    }

    // 2. Validar contra el monto total recibido
    const sumApplied = this.invoices.reduce((sum, i) => sum + (i.amount_applied || 0), 0);
    if (sumApplied > totalReceived) {
      this.msg.add({ severity: 'error', summary: 'Monto Inválido', detail: `La suma aplicada (${sumApplied}) supera el monto total recibido (${totalReceived})` });
      inv.amount_applied = 0;
    }
  }

  apply() {
    const totalPayment = this.form.get('amount')?.value;
    const applications = this.invoices
      .filter(i => i.amount_applied > 0)
      .map(i => ({ 
          ar_id: i.id, 
          amount_applied: Math.min(i.amount_applied, (i.total_amount - i.amount_paid)) 
      }));

    const sumApplications = applications.reduce((sum, app) => sum + app.amount_applied, 0);

    if (sumApplications === 0) {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'No hay montos aplicados' });
      return;
    }

    if (sumApplications > totalPayment) {
        this.msg.add({ severity: 'error', summary: 'Error', detail: `La suma aplicada (${sumApplications}) supera el monto recibido (${totalPayment})` });
        return;
    }

    const payload = {
      payment_data: {
        amount: totalPayment,
        payment_date: this.form.get('payment_date')?.value,
        reference: this.form.get('reference')?.value
      },
      applications
    };

    this.arService.applyMultiplePayments(payload).subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'Éxito', detail: 'Pago aplicado correctamente' });
        this.invoices = [];
        this.form.reset({ payment_date: new Date() });
      },
      error: (err) => this.msg.add({ severity: 'error', summary: 'Error', detail: err.error.error })
    });
  }
}
