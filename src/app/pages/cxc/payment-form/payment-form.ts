import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountReceivableService } from '@src/app/services/account-receivable.service';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, DatePickerModule, ToastModule],
  templateUrl: './payment-form.html'
})
export class PaymentFormComponent {
  private fb = inject(FormBuilder);
  private arService = inject(AccountReceivableService);
  private msg = inject(MessageService);

  @Input() arId!: number;
  @Input() pendingAmount: number = 0;
  @Output() paymentSuccess = new EventEmitter<void>();

  form: FormGroup = this.fb.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    payment_date: [new Date(), Validators.required],
    reference: ['']
  });

  save() {
    if (this.form.invalid) return;
    
    if (this.form.value.amount > this.pendingAmount) {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'El monto excede el saldo pendiente' });
        return;
    }

    const payload = {
        payment_data: {
            amount: this.form.value.amount,
            payment_date: this.form.value.payment_date,
            reference: this.form.value.reference
        },
        applications: [{ ar_id: this.arId, amount_applied: this.form.value.amount }]
    };

    this.arService.applyMultiplePayments(payload).subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'Éxito', detail: 'Pago registrado' });
        this.paymentSuccess.emit();
      },
      error: (err) => this.msg.add({ severity: 'error', summary: 'Error', detail: err.error.error || 'Error al registrar pago' })
    });
  }
}
