import { Component, inject, OnInit, ViewChild, ElementRef, ViewChildren, QueryList, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SplitButtonModule } from 'primeng/splitbutton';
import { DialogModule } from 'primeng/dialog';
import { QuotationService } from '@src/app/services/quotation.service';
import { ClientService } from '@src/app/services/client.service';
import { SkuService } from '@src/app/services/sku.service';
import { LvalService } from '@src/app/services/lval.service';
import { Quotation, QuotationDetail } from '@src/app/interfaces/quotation.interface';
import { WarehouseService } from '@src/app/services/warehouse.service';
import { SalesInvoiceService } from '@src/app/services/sales-invoice.service';
import { PaymentTypeService } from '@src/app/services/payment-type.service';

@Component({
  selector: 'app-quotation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CardModule, ButtonModule, Select, InputTextModule, TableModule, DividerModule, Toast, RouterLink, ConfirmDialogModule, SplitButtonModule, DialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './quotation-form.html'
})
export class QuotationFormComponent implements OnInit {
  @ViewChild('notesArea') notesArea!: ElementRef;
  @ViewChildren('discountInput') discountInputs!: QueryList<ElementRef>;

  private fb = inject(FormBuilder);
  private quotationService = inject(QuotationService);
  private clientService = inject(ClientService);
  private skuService = inject(SkuService);
  private lvalService = inject(LvalService);
  private warehouseService = inject(WarehouseService);
  private invoiceService = inject(SalesInvoiceService);
  private paymentTypeService = inject(PaymentTypeService);
  private msg = inject(MessageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private confirmationService = inject(ConfirmationService);
  private cd = inject(ChangeDetectorRef);

  form: FormGroup = this.fb.group({
    id: [null],
    client: [null, Validators.required],
    customer_name: [''],
    send_by_email: [false],
    email_target: [''],
    expiration_date: [null, Validators.required],
    status: ['DRAFT', Validators.required],
    global_discount: [0, [Validators.min(0)]],
    subtotal: [0],
    tax: [0],
    total: [0],
    notes: [''],
    details: this.fb.array([])
  });

  invoiceDialogForm: FormGroup = this.fb.group({
    warehouse_id: [null, Validators.required],
    document_type: [null, Validators.required],
    due_date: [null, Validators.required],
    payments: this.fb.array([])
  });

  get showCustomerName() {
    const client = this.clients.find(c => c.id === this.form.get('client')?.value);
    return client && client.payment_term === 'CASH';
  }

  get details() { return this.form.get('details') as FormArray; }
  get invoicePayments() { return this.invoiceDialogForm.get('payments') as FormArray; }

  get selectedInvoiceDocType() {
    const id = this.invoiceDialogForm.get('document_type')?.value;
    return this.documentTypes.find(d => d.id === id);
  }

  get filteredDocumentTypes() {
    const clientId = this.form.get('client')?.value;
    const client = this.clients.find(c => c.id === clientId);
    if (!client) return this.documentTypes.filter(dt => dt.category === 'INVOICE');
    return this.documentTypes.filter(dt => dt.payment_term === client.payment_term && dt.category === 'INVOICE');
  }

  clients: any[] = [];
  skus: any[] = [];
  warehouses: any[] = [];
  documentTypes: any[] = [];
  paymentTypes: any[] = [];
  actionItems: MenuItem[] = [];
  isEdit = false;
  buttonLabel = 'Guardar';
  showWarehouseDialog = signal<boolean>(false);
  showInvoiceDialog = signal<boolean>(false);
  selectedWarehouseId: number | null = null;
  isLoaded = false;

  statusOptions = [
    { label: 'Borrador', value: 'DRAFT' },
    { label: 'Enviada', value: 'SENT' },
    { label: 'Aceptada', value: 'ACCEPTED' },
    { label: 'Rechazada', value: 'REJECTED' }
  ];

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.isEdit = !!id;
    this.buttonLabel = this.isEdit ? 'Actualizar' : 'Guardar';

    setTimeout(() => {
      this.loadClients();
      this.loadWarehouses();
      this.loadDocumentTypes();
      this.loadPaymentTypes();
      this.loadSkus().then(() => {
        if (this.isEdit) {
          this.quotationService.getQuotationById(Number(id)).subscribe({
            next: (quotation) => {
              this.form.patchValue(quotation);
              quotation.details.forEach(detail => this.addDetail(detail));
              this.initActions();
              if (quotation.status !== 'DRAFT') {
                this.form.disable();
              }
              this.cd.detectChanges();
            },
            error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la cotización' })
          });
        } else {
          this.setExpirationDate();
          this.addDetail();
        }
        this.isLoaded = true;
        this.cd.detectChanges();
      });
    });
  }

  loadWarehouses() {
    this.warehouseService.getWarehouses({}).subscribe(data => {
      this.warehouses = data.results || data;
      this.cd.detectChanges();
    });
  }

  loadDocumentTypes() {
    this.invoiceService.getDocumentTypes().subscribe(data => {
      this.documentTypes = data.results || data;
      this.cd.detectChanges();
    });
  }

  loadPaymentTypes() {
    this.paymentTypeService.getPaymentTypes({ is_active: true }).subscribe(data => {
      this.paymentTypes = data.results || data;
      this.cd.detectChanges();
    });
  }

  initActions() {
    this.actionItems = [
      {
        label: 'Crear Pedido de Venta',
        icon: 'pi pi-shopping-cart',
        command: () => this.showWarehouseSelection()
      },
      {
        label: 'Facturar Directamente',
        icon: 'pi pi-file-invoice',
        command: () => this.showDirectInvoice()
      }
    ];
  }

  // --- Flujo: Pedido de Venta ---

  showWarehouseSelection() {
    if (this.warehouses.length === 0) {
      this.msg.add({ severity: 'warn', summary: 'Atención', detail: 'No hay bodegas configuradas.' });
      return;
    }
    if (this.warehouses.length === 1) {
      this.convert(this.warehouses[0].id);
      return;
    }
    this.selectedWarehouseId = null;
    this.showWarehouseDialog.set(true);
  }

  onConfirmWarehouse() {
    const warehouse = this.warehouses.find(w => w.id === this.selectedWarehouseId);
    if (!warehouse) {
      this.msg.add({ severity: 'warn', summary: 'Atención', detail: 'Seleccione una bodega.' });
      return;
    }
    this.showWarehouseDialog.set(false);
    this.convert(warehouse.id);
  }

  convert(warehouseId: number) {
    const id = this.form.get('id')?.value;
    this.quotationService.convertQuotation(id, warehouseId).subscribe({
      next: (res) => {
        const msgDetail = res.document_number
          ? `Pedido ${res.document_number} generado exitosamente`
          : res.message;
        this.msg.add({ severity: 'success', summary: 'Conversión Exitosa', detail: msgDetail, sticky: true });
        this.form.disable();
        this.form.patchValue({ status: 'ACCEPTED' });
        this.cd.detectChanges();
        setTimeout(() => {
          if (res.sales_order_id) {
            this.router.navigate(['/sales/sales-orders', res.sales_order_id]);
          } else {
            this.router.navigate(['/sales/sales-orders']);
          }
        }, 3000);
      },
      error: (err) => this.msg.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'Error al convertir' })
    });
  }

  // --- Flujo: Facturación Directa ---

  showDirectInvoice() {
    if (this.filteredDocumentTypes.length === 0) {
      this.msg.add({ severity: 'warn', summary: 'Atención', detail: 'No hay tipos de documento configurados para este cliente.' });
      return;
    }
    this.invoiceDialogForm.reset();
    this.invoicePayments.clear();
    if (this.warehouses.length === 1) {
      this.invoiceDialogForm.get('warehouse_id')?.setValue(this.warehouses[0].id);
    }
    this.showInvoiceDialog.set(true);
  }

  onInvoiceDocTypeChange(docTypeId: number) {
    const docType = this.documentTypes.find(d => d.id === docTypeId);
    this.invoicePayments.clear();

    if (docType?.payment_term === 'CASH') {
      const today = new Date().toISOString().split('T')[0];
      this.invoiceDialogForm.get('due_date')?.setValue(today);
      this.addInvoicePayment();
      this.invoicePayments.at(0).get('amount')?.setValue(this.form.get('total')?.value || 0);
    } else {
      const clientId = this.form.get('client')?.value;
      const client = this.clients.find(c => c.id === clientId);
      const creditDays = client?.credit_days || 30;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + creditDays);
      this.invoiceDialogForm.get('due_date')?.setValue(dueDate.toISOString().split('T')[0]);
    }
    this.cd.detectChanges();
  }

  addInvoicePayment() {
    this.invoicePayments.push(this.fb.group({
      payment_type: [null, Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      reference: ['']
    }));
  }

  removeInvoicePayment(index: number) {
    this.invoicePayments.removeAt(index);
  }

  confirmDirectInvoice() {
    if (this.invoiceDialogForm.invalid) {
      this.invoiceDialogForm.markAllAsTouched();
      return;
    }

    const docType = this.selectedInvoiceDocType;
    if (docType?.payment_term === 'CASH') {
      const totalPayments = this.invoicePayments.value.reduce((acc: number, p: any) => acc + (Number(p.amount) || 0), 0);
      const invoiceTotal = this.form.get('total')?.value || 0;
      if (Math.abs(totalPayments - invoiceTotal) > 0.01) {
        this.msg.add({ severity: 'warn', summary: 'Diferencia en Pagos', detail: `La suma de pagos (${totalPayments.toFixed(2)}) no coincide con el total (${invoiceTotal.toFixed(2)}).` });
        return;
      }
    }

    const dialogData = this.invoiceDialogForm.value;
    const quotationData = this.form.getRawValue();

    const payload = {
      client: quotationData.client,
      customer_name: quotationData.customer_name,
      document_type: dialogData.document_type,
      warehouse_id: dialogData.warehouse_id,
      due_date: dialogData.due_date,
      global_discount: quotationData.global_discount,
      send_by_email: quotationData.send_by_email,
      email_target: quotationData.email_target,
      notes: quotationData.notes,
      subtotal: quotationData.subtotal,
      tax: quotationData.tax,
      total: quotationData.total,
      details: quotationData.details.map((d: any) => ({
        sku: d.sku,
        quantity: d.quantity,
        price: d.price,
        discount: d.discount,
        tax_exempt: d.tax_exempt,
        tax_percent: d.tax_percent,
        tax: d.tax,
        subtotal: d.subtotal
      })),
      payments: dialogData.payments || []
    };

    this.showInvoiceDialog.set(false);

    this.invoiceService.createInvoice(payload).subscribe({
      next: (res) => {
        if (res.status === 'PENDING_AUTHORIZATION') {
          this.msg.add({ severity: 'warn', summary: 'Autorización Requerida', detail: `Factura ${res.document_number} creada, pendiente de aprobación supervisor.`, sticky: true });
        } else {
          this.msg.add({ severity: 'success', summary: 'Factura Creada', detail: `Factura ${res.document_number} generada exitosamente`, sticky: true });
          this.invoiceService.printInvoice(res.id).subscribe((blob: Blob) => {
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
          });
        }
        this.form.disable();
        this.form.patchValue({ status: 'ACCEPTED' });
        this.cd.detectChanges();
        setTimeout(() => this.router.navigate(['/sales/invoices']), 2500);
      },
      error: (err) => {
        this.msg.add({ severity: 'error', summary: 'Error al Facturar', detail: err.error?.error || 'Error al crear la factura' });
      }
    });
  }

  // --- Utilidades del formulario principal ---

  setExpirationDate() {
    this.lvalService.listLvals('dExpiration').subscribe(data => {
      const days = parseInt(data[0]?.value || '30', 10);
      const date = new Date();
      date.setDate(date.getDate() + days);
      this.form.patchValue({ expiration_date: date.toISOString().split('T')[0] });
    });
  }

  handleTabOnDiscount(event: Event, index: number) {
    if (index === this.details.length - 1) {
      event.preventDefault();
      this.confirmationService.confirm({
        message: '¿Deseas agregar otro material?',
        header: 'Confirmar',
        accept: () => {
          this.addDetail();
          setTimeout(() => {
            const inputs = this.discountInputs.toArray();
            inputs[inputs.length - 1].nativeElement.focus();
          }, 100);
        },
        reject: () => {
          this.notesArea.nativeElement.focus();
        }
      });
    }
  }

  loadClients() {
    this.clientService.getClients({}).subscribe(data => {
      this.clients = data.results || data;
      this.cd.detectChanges();
    });
  }

  loadSkus(): Promise<any> {
    return new Promise((resolve) => {
      this.skuService.getSkus({ nopaginate: true }).subscribe(data => {
        const rawSkus = data.results || data;
        this.skus = rawSkus.map((sku: any) => ({
          ...sku,
          searchLabel: `${sku.code} - ${sku.name}`
        }));
        this.cd.detectChanges();
        resolve(this.skus);
      });
    });
  }

  addDetail(detail?: any) {
    const detailForm = this.fb.group({
      id: [detail?.id || null],
      sku: [detail?.sku || null, Validators.required],
      quantity: [detail?.quantity || 1, [Validators.required, Validators.min(0.1)]],
      price: [detail?.price || 0, [Validators.required, Validators.min(0)]],
      discount: [detail?.discount || 0, [Validators.min(0)]],
      tax_exempt: [detail?.tax_exempt || false],
      tax_percent: [detail?.tax_percent || 7.00],
      tax: [detail?.tax || 0],
      subtotal: [detail?.subtotal || 0]
    });
    this.details.push(detailForm);
  }

  removeDetail(index: number) {
    this.details.removeAt(index);
    this.calculateTotals();
  }

  onSkuChange(index: number) {
    const detail = this.details.at(index);
    const selectedSkuId = detail.get('sku')?.value;

    const isDuplicate = this.details.controls.some((ctrl, i) => i !== index && ctrl.get('sku')?.value === selectedSkuId);
    if (isDuplicate) {
      this.msg.add({ severity: 'warn', summary: 'Atención', detail: 'Este producto ya ha sido agregado.' });
      detail.patchValue({ sku: null, price: 0, tax_exempt: false, subtotal: 0 });
      return;
    }

    const selectedSku = this.skus.find(s => s.id === selectedSkuId);
    if (selectedSku) {
      detail.patchValue({
        price: selectedSku.sell_price,
        tax_exempt: selectedSku.tax_exempt,
        tax_percent: selectedSku.tax_percent !== undefined ? parseFloat(selectedSku.tax_percent) : 7.00
      });
      this.calculateRowSubtotal(index);
    }
  }

  calculateRowSubtotal(index: number) {
    const detail = this.details.at(index);
    const qty = detail.get('quantity')?.value || 0;
    const price = detail.get('price')?.value || 0;
    const disc = detail.get('discount')?.value || 0;
    const subtotal = (qty * price) - disc;

    const isExempt = detail.get('tax_exempt')?.value;
    const taxPercent = isExempt ? 0 : (detail.get('tax_percent')?.value || 0);
    // ITBMS redondeado a 2 decimales por renglón (estándar fiscal Panamá)
    const tax = Math.round(subtotal * (taxPercent / 100) * 100) / 100;

    detail.patchValue({ subtotal, tax }, { emitEvent: false });
    this.calculateTotals();
  }

  calculateTotals() {
    let subtotal = 0;
    let totalTax = 0;
    const globalDiscountPercent = this.form.get('global_discount')?.value || 0;

    // Sumar ITBMS ya redondeado por renglón, no recalcular
    this.details.controls.forEach(control => {
      subtotal += control.get('subtotal')?.value || 0;
      totalTax += control.get('tax')?.value || 0;
    });

    const discountAmount = subtotal * (globalDiscountPercent / 100);
    const taxDiscount = Math.round(totalTax * (globalDiscountPercent / 100) * 100) / 100;
    const tax = Math.round((totalTax - taxDiscount) * 100) / 100;
    const total = Math.round(((subtotal - discountAmount) + tax) * 100) / 100;

    this.form.patchValue({ subtotal, tax, total }, { emitEvent: false });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const quotationValue = this.form.value;
    quotationValue.subtotal = Number(Number(quotationValue.subtotal || 0).toFixed(4));
    quotationValue.tax = Number(Number(quotationValue.tax || 0).toFixed(4));
    quotationValue.total = Number(Number(quotationValue.total || 0).toFixed(4));
    quotationValue.global_discount = Number(Number(quotationValue.global_discount || 0).toFixed(4));
    quotationValue.details = quotationValue.details.map((d: any) => ({
      ...d,
      quantity: Number(Number(d.quantity || 0).toFixed(4)),
      price: Number(Number(d.price || 0).toFixed(4)),
      discount: Number(Number(d.discount || 0).toFixed(4)),
      tax_percent: Number(Number(d.tax_percent || 0).toFixed(2)),
      tax: Number(Number(d.tax || 0).toFixed(4)),
      subtotal: Number(Number(d.subtotal || 0).toFixed(4))
    }));

    const action = this.isEdit
      ? this.quotationService.updateQuotation(quotationValue)
      : this.quotationService.createQuotation(quotationValue);

    action.subscribe({
      next: (res) => {
        this.msg.add({ severity: 'success', summary: 'Éxito', detail: `Cotización ${this.isEdit ? 'actualizada' : 'registrada'}` });
        if (!this.isEdit && res.id) {
          this.quotationService.printQuotation(res.id).subscribe((blob: Blob) => {
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
          });
        }
        setTimeout(() => this.router.navigate(['/sales/quotations']), 1000);
      },
      error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar la cotización' })
    });
  }
}
