import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { VendorPaymentService } from '@src/app/services/vendor-payment.service';
import { MessageService } from 'primeng/api';
import { AccountingService } from '@src/app/services/accounting.service';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputNumberModule],
  templateUrl: './payment-form.html'
})
export class PaymentFormComponent {
  private fb = inject(FormBuilder);
  private paymentService = inject(VendorPaymentService);
  private accountingService = inject(AccountingService);
  private msg = inject(MessageService);
  
  visible = false;
  accountPayable: any;
  form: FormGroup;
  mappingValid = true;

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
    
    // Validar contabilidad
    this.accountingService.validateSetup('PAYMENT_OUT').subscribe(res => {
      this.mappingValid = res.is_valid;
      if (!res.is_valid) {
        this.msg.add({
          severity: 'error',
          summary: 'Configuración Incompleta',
          detail: 'Falta configuración contable para pagos a proveedores.',
          sticky: true
        });
      }
    });

    this.visible = true;
  }

  save() {
    if (this.form.valid && this.mappingValid) {
      this.paymentService.createPayment(this.form.value).subscribe(() => {
        this.msg.add({ severity: 'success', summary: 'Pago registrado' });
        this.visible = false;
      });
    }
  }
}
