import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
// import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { GoodsReceiptService } from '@src/app/services/goods-receipt.service';
import { VendorInvoiceService } from '@src/app/services/vendor-invoice.service';

@Component({
  selector: 'app-bill-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, DatePickerModule, InputNumberModule, ToastModule, RouterLink],
  providers: [MessageService],
  templateUrl: './bill-form.html'
})
export class BillFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private receiptService = inject(GoodsReceiptService);
  private invoiceService = inject(VendorInvoiceService);
  private msg = inject(MessageService);

  form: FormGroup;
  receipt = signal<any>(null);

  constructor() {
    this.form = this.fb.group({
      order: [null, Validators.required],
      receipt: [null, Validators.required],
      supplier: [null, Validators.required],
      invoice_number: ['', Validators.required],
      invoice_date: [new Date(), Validators.required],
      total_amount: [0, Validators.required],
      tax_amount: [0, Validators.required]
    });
  }

  ngOnInit() {
    const receiptId = this.route.snapshot.queryParamMap.get('receiptId');
    if (receiptId) {
      this.receiptService.getReceiptById(receiptId).subscribe(r => {
        this.receipt.set(r);
        this.form.patchValue({
          order: r.order,
          receipt: r.id,
          supplier: r.order_supplier_id, // Asegurar que este campo exista en la respuesta
          total_amount: r.total,
          tax_amount: r.total * 0.07 // Ajustar según lógica real si es necesario
        });
      });
    }
  }

  save() {
    if (this.form.valid) {
      this.invoiceService.createInvoice(this.form.value).subscribe({
        next: () => {
          this.msg.add({ severity: 'success', summary: 'Factura registrada' });
          this.router.navigate(['/purchases/list-bill']);
        },
        error: () => this.msg.add({ severity: 'error', summary: 'Error al registrar' })
      });
    }
  }
}
