import { Component, inject, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { Toast } from 'primeng/toast';
import { SalesOrderService } from '@src/app/services/sales-order.service';
import { SalesInvoiceService } from '@src/app/services/sales-invoice.service';
import { PaymentTypeService } from '@src/app/services/payment-type.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-sales-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    DividerModule,
    RouterLink,
    ConfirmDialogModule,
    ToastModule,
    DialogModule,
    Select,
    Toast,
    InputTextModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './sales-order-detail.html'
})
export class SalesOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private salesOrderService = inject(SalesOrderService);
  private salesInvoiceService = inject(SalesInvoiceService);
  private paymentTypeService = inject(PaymentTypeService);
  private confirmationService = inject(ConfirmationService);
  private msg = inject(MessageService);
  private cd = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  order: any;
  showInvoiceDialog = signal<boolean>(false);
  documentTypes: any[] = [];
  paymentTypes: any[] = [];
  invoiceDialogForm!: FormGroup;

  ngOnInit() {
    this.invoiceDialogForm = this.fb.group({
      document_type: [null, Validators.required],
      payments: this.fb.array([])
    });
    this.loadOrder();
  }

  get invoicePayments(): FormArray {
    return this.invoiceDialogForm.get('payments') as FormArray;
  }

  get selectedDocType(): any {
    const id = this.invoiceDialogForm.get('document_type')?.value;
    return this.documentTypes.find(dt => dt.id === id) || null;
  }

  get filteredDocumentTypes(): any[] {
    const term = this.order?.client_payment_term;
    if (!term) return this.documentTypes;
    return this.documentTypes.filter(dt => dt.payment_term === term);
  }

  loadOrder() {
    const id = this.route.snapshot.params['id'];
    this.salesOrderService.getSalesOrderById(Number(id)).subscribe(data => {
      this.order = data;
      this.cd.detectChanges();
    });
  }

  openInvoiceDialog() {
    const loadDocTypes = this.documentTypes.length === 0
      ? this.salesInvoiceService.getDocumentTypes().toPromise().then((res: any) => {
          this.documentTypes = (res.results || res).filter((dt: any) => dt.category === 'INVOICE');
        })
      : Promise.resolve();

    const loadPaymentTypes = this.paymentTypes.length === 0
      ? this.paymentTypeService.getPaymentTypes().toPromise().then((res: any) => {
          this.paymentTypes = res.results || res;
        })
      : Promise.resolve();

    Promise.all([loadDocTypes, loadPaymentTypes]).then(() => {
      this.invoiceDialogForm.reset({ document_type: null });
      while (this.invoicePayments.length) {
        this.invoicePayments.removeAt(0);
      }
      this.showInvoiceDialog.set(true);
      this.cd.detectChanges();
    });
  }

  onDocTypeChange(docTypeId: number) {
    const docType = this.documentTypes.find(dt => dt.id === docTypeId);
    while (this.invoicePayments.length) {
      this.invoicePayments.removeAt(0);
    }
    if (docType && docType.payment_term === 'CASH') {
      this.invoicePayments.push(this.fb.group({
        payment_type: [null, Validators.required],
        amount: [this.order?.total ?? 0, [Validators.required, Validators.min(0.01)]],
        reference: ['']
      }));
    }
  }

  addPayment() {
    this.invoicePayments.push(this.fb.group({
      payment_type: [null, Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      reference: ['']
    }));
  }

  removePayment(i: number) {
    this.invoicePayments.removeAt(i);
  }

  confirmInvoice() {
    if (this.invoiceDialogForm.invalid) {
      this.invoiceDialogForm.markAllAsTouched();
      return;
    }

    const docType = this.selectedDocType;
    const formValue = this.invoiceDialogForm.value;

    if (docType && docType.payment_term === 'CASH') {
      const paymentsSum = this.invoicePayments.controls.reduce((acc, ctrl) => {
        return acc + Number(ctrl.get('amount')?.value || 0);
      }, 0);
      const orderTotal = Number(this.order?.total || 0);
      if (Math.abs(paymentsSum - orderTotal) > 0.01) {
        this.msg.add({
          severity: 'warn',
          summary: 'Validación',
          detail: `La suma de pagos (${paymentsSum.toFixed(2)}) debe ser igual al total del pedido (${orderTotal.toFixed(2)})`
        });
        return;
      }
    }

    const payload: any = {
      document_type_id: formValue.document_type,
      payments: formValue.payments || []
    };

    this.salesOrderService.generateInvoice(this.order.id, payload).subscribe({
      next: (res) => {
        this.showInvoiceDialog.set(false);
        this.msg.add({
          severity: 'success',
          summary: 'Factura Generada',
          detail: `Factura ${res.document_number} creada correctamente`,
          sticky: true
        });
        this.loadOrder();
        setTimeout(() => {
          this.router.navigate(['/sales/invoices', res.invoice_id]);
        }, 2000);
      },
      error: (err) => {
        this.msg.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.error || 'Error al generar la factura'
        });
      }
    });
  }

  cancelOrder() {
    this.confirmationService.confirm({
      message: `¿Estás seguro de anular el pedido ${this.order.document_number}?`,
      header: 'Confirmar Anulación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.salesOrderService.cancelOrder(this.order.id, 'Anulado desde detalle').subscribe({
          next: () => {
            this.msg.add({ severity: 'success', summary: 'Éxito', detail: 'Pedido anulado' });
            this.loadOrder();
          },
          error: (err) => this.msg.add({ severity: 'error', summary: 'Error', detail: err.error.error || 'Error al anular' })
        });
      }
    });
  }
}
