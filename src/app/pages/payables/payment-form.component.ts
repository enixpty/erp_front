import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { VendorPaymentService } from '@src/app/services/vendor-payment.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputNumberModule],
  templateUrl: './payment-form.html'
})
export class PaymentFormComponent {
  private fb = inject(FormBuilder);
  private paymentService = inject(VendorPaymentService);
  private msg = inject(MessageService);
  
  visible = false;
  accountPayable: any;
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      account_payable: [null, Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      payment_date: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  open(ap: any) {
    this.accountPayable = ap;
    this.form.patchValue({ account_payable: ap.id });
    this.visible = true;
  }

  save() {
    if (this.form.valid) {
      this.paymentService.createPayment(this.form.value).subscribe(() => {
        this.msg.add({ severity: 'success', summary: 'Pago registrado' });
        this.visible = false;
      });
    }
  }
}
