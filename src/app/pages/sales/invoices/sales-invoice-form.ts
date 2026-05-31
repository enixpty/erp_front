import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { environment } from '@src/environments/environment';
import { SalesInvoiceService } from '@src/app/services/sales-invoice.service';
import { ClientService } from '@src/app/services/client.service';
import { SkuService } from '@src/app/services/sku.service';
import { WarehouseService } from '@src/app/services/warehouse.service';
import { AccountingService } from '@src/app/services/accounting.service';
import { PaymentTypeService } from '@src/app/services/payment-type.service';

@Component({
  selector: 'app-sales-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, Select, InputTextModule, TableModule, DividerModule, DatePickerModule, Toast, RouterLink, ConfirmDialogModule, TooltipModule, CheckboxModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './sales-invoice-form.html'
})
export class SalesInvoiceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private invoiceService = inject(SalesInvoiceService);
  private clientService = inject(ClientService);
  private skuService = inject(SkuService);
  private warehouseService = inject(WarehouseService);
  private accountingService = inject(AccountingService);
  private paymentTypeService = inject(PaymentTypeService);
  private msg = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  mappingValid = signal<boolean>(true);
  missingMappings = signal<string[]>([]);
  saving = signal<boolean>(false);

  form: FormGroup = this.fb.group({
    client: [null, Validators.required],
    customer_name: [''],
    document_type: [null, Validators.required],
    warehouse_id: [null, Validators.required],
    due_date: [null, Validators.required],
    global_discount: [0, [Validators.min(0)]],
    subtotal: [0],
    tax: [0],
    total: [0],
    notes: [''],
    send_by_email: [false],
    email_target: [''],
    details: this.fb.array([]),
    payments: this.fb.array([])
  });

  // Getter para tipos de documento filtrados
  get filteredDocumentTypes() {
    const clientId = this.form.get('client')?.value;
    const client = this.clients.find(c => c.id === clientId);
    if (!client) return [];
    
    // Filtrar documentos: deben coincidir con el término de pago (CASH/CREDIT)
    // El campo payment_term viene del cliente y del documento
    return this.documentTypes.filter(dt => 
        dt.payment_term === client.payment_term && 
        dt.category === 'INVOICE'
    );
  }

  get showCustomerName() {
    const client = this.clients.find(c => c.id === this.form.get('client')?.value);
    return client && client.payment_term === 'CASH';
  }

  get isCredit(): boolean {
    const id = this.form.get('document_type')?.value;
    const dt = this.documentTypes.find(d => d.id === id);
    return dt?.payment_term === 'CREDIT';
  }

  clients: any[] = [];
  skus: any[] = [];
  warehouses: any[] = [];
  documentTypes: any[] = [];
  paymentTypes: any[] = [];
  isLoaded = false;

  get details() {
    return this.form.get('details') as FormArray;
  }

  get payments() {
    return this.form.get('payments') as FormArray;
  }

  get paymentsSum(): number {
    return this.payments.controls.reduce((acc, ctrl) => acc + (Number(ctrl.get('amount')?.value) || 0), 0);
  }

  get paymentPending(): number {
    return (Number(this.form.get('total')?.value) || 0) - this.paymentsSum;
  }

  get isPaymentBalanced(): boolean {
    return Math.abs(this.paymentPending) <= 0.01;
  }

  /** Una factura de contado requiere que los pagos cubran el total. */
  get requiresFullPayment(): boolean {
    const id = this.form.get('document_type')?.value;
    const dt = this.documentTypes.find(d => d.id === id);
    return dt?.payment_term === 'CASH';
  }

  /** Habilita "Generar Factura": mapeo OK, no guardando, y si es contado, pagos completos. */
  get canGenerate(): boolean {
    if (!this.mappingValid() || this.saving()) return false;
    if (this.requiresFullPayment) {
      return this.payments.length > 0 && this.isPaymentBalanced;
    }
    return true;
  }

  ngOnInit() {
    this.form.patchValue({ due_date: new Date() });
    this.loadInitialData();

    // Validar contabilidad al cambiar tipo de documento
    this.form.get('document_type')?.valueChanges.subscribe(val => {
      if (val) {
        this.accountingService.validateSetup('SALES', val).subscribe(res => {
          this.mappingValid.set(res.is_valid);
          this.missingMappings.set(res.missing_events);
          if (!res.is_valid) {
            this.msg.add({
              severity: 'error',
              summary: 'Configuración Contable Incompleta',
              detail: 'No se puede facturar con este tipo de documento hasta completar el mapeo contable.',
              sticky: true
            });
          }
        });
      }
      
      const docType = this.documentTypes.find(d => d.id === val);
      if (docType && docType.payment_term === 'CASH') {
        if (this.payments.length === 0) this.addPayment();
        // CONTADO: vence hoy
        this.form.get('due_date')?.setValue(new Date());
        this.form.get('due_date')?.disable();
      } else {
        this.payments.clear();
        // CRÉDITO: vence según días de crédito del cliente
        const clientId = this.form.get('client')?.value;
        const client = this.clients.find(c => c.id === clientId);
        const creditDays = client?.credit_days || 30;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + creditDays);
        this.form.get('due_date')?.setValue(dueDate);
        this.form.get('due_date')?.enable();
      }
    });
  }

  async loadInitialData() {
    this.clientService.getClients({}).subscribe(data => {
        this.clients = data.results || data;
        this.cd.detectChanges();
    });
    this.warehouseService.getWarehouses({}).subscribe(data => {
        this.warehouses = data.results || data;
        this.cd.detectChanges();
    });
    this.invoiceService.getDocumentTypes().subscribe(data => {
        this.documentTypes = data.results || data;
        this.cd.detectChanges();
    });
    
    this.paymentTypeService.getPaymentTypes({ is_active: true }).subscribe(data => {
        this.paymentTypes = data.results || data;
        this.cd.detectChanges();
    });
    
    this.skuService.getSkus({ nopaginate: true }).subscribe(data => {
        this.skus = (data.results || data).map((s: any) => ({ ...s, searchLabel: `${s.code} - ${s.name}` }));
        // Flujo scan-first: no se agrega fila vacía; el usuario escanea/teclea el código.
        this.isLoaded = true;
        this.cd.detectChanges();
    });
  }

  addDetail() {
    const detailForm = this.fb.group({
      sku: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      discount: [0, [Validators.min(0)]],
      tax_exempt: [false],
      tax_percent: [7.00],
      tax: [0],
      subtotal: [0]
    });
    this.details.push(detailForm);
  }

  /**
   * Modo mostrador: busca un producto por código (exacto) o por coincidencia única
   * y lo agrega/incrementa. Pensado para lector de código de barras + Enter.
   */
  quickAdd(rawCode: string) {
    const term = (rawCode || '').trim();
    if (!term) return;

    const lower = term.toLowerCase();
    let sku = this.skus.find(s => (s.code || '').toLowerCase() === lower);
    if (!sku) {
      const matches = this.skus.filter(s => (s.searchLabel || '').toLowerCase().includes(lower));
      if (matches.length === 1) {
        sku = matches[0];
      } else if (matches.length > 1) {
        this.msg.add({ severity: 'info', summary: 'Varias coincidencias', detail: `"${term}" coincide con ${matches.length} productos. Sea más específico o use el botón Agregar.` });
        return;
      }
    }

    if (!sku) {
      this.msg.add({ severity: 'warn', summary: 'No encontrado', detail: `No hay producto con código o nombre "${term}".` });
      return;
    }

    this.addOrIncrement(sku);
  }

  /** Si el producto ya está en la factura, suma 1 a la cantidad; si no, agrega una línea nueva. */
  addOrIncrement(sku: any) {
    const idx = this.details.controls.findIndex(c => c.get('sku')?.value === sku.id);
    if (idx >= 0) {
      const ctrl = this.details.at(idx);
      ctrl.get('quantity')?.setValue((Number(ctrl.get('quantity')?.value) || 0) + 1, { emitEvent: false });
      this.calculateRowSubtotal(idx);
      this.msg.add({ severity: 'success', summary: 'Cantidad +1', detail: `${sku.code} — ${sku.name}`, life: 1200 });
    } else {
      const detailForm = this.fb.group({
        sku: [sku.id, Validators.required],
        quantity: [1, [Validators.required, Validators.min(0.1)]],
        price: [sku.sell_price || 0, [Validators.required, Validators.min(0)]],
        discount: [0, [Validators.min(0)]],
        tax_exempt: [sku.tax_exempt || false],
        tax_percent: [sku.tax_percent !== undefined ? parseFloat(sku.tax_percent) : 7.00],
        tax: [0],
        subtotal: [0]
      });
      this.details.push(detailForm);
      this.calculateRowSubtotal(this.details.length - 1);
      this.msg.add({ severity: 'success', summary: 'Producto agregado', detail: `${sku.code} — ${sku.name}`, life: 1200 });
    }
    this.cd.detectChanges();
  }

  addPayment() {
    const paymentForm = this.fb.group({
      payment_type: [null, Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      reference: ['']
    });
    this.payments.push(paymentForm);
  }

  removePayment(index: number) {
    this.payments.removeAt(index);
  }

  removeDetail(index: number) {
    this.details.removeAt(index);
    this.calculateTotals();
  }

  onSkuChange(index: number) {
    const detail = this.details.at(index);
    const selectedSkuId = detail.get('sku')?.value;
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

    // Auto-completar el monto en los pagos si es CASH y hay un solo pago
    if (this.payments.length === 1) {
      this.payments.at(0).get('amount')?.setValue(total);
    }
  }

  save() {
    if (this.saving()) return; // evitar doble submit

    if (this.details.length === 0) {
      this.msg.add({ severity: 'warn', summary: 'Factura vacía', detail: 'Agregue al menos un producto (escanee o teclee el código).' });
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Validación de regla de negocio en frontend antes de enviar
    const clientId = this.form.get('client')?.value;
    const docTypeId = this.form.get('document_type')?.value;
    const client = this.clients.find(c => c.id === clientId);
    const docType = this.documentTypes.find(d => d.id === docTypeId);

    if (client && docType && docType.payment_term === 'CREDIT' && client.payment_term === 'CASH') {
        this.msg.add({ 
            severity: 'error', 
            summary: 'Bloqueo de Términos', 
            detail: `El cliente ${client.first_name} es de CONTADO. No puede generar facturas a CRÉDITO.` 
        });
        return;
    }

    if (docType && docType.payment_term === 'CASH') {
        const totalPayments = this.payments.value.reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
        const invoiceTotal = this.form.get('total')?.value || 0;
        
        // Redondear a 2 decimales para evitar problemas de coma flotante
        const diff = Math.abs(totalPayments - invoiceTotal);
        if (diff > 0.01) {
            this.msg.add({ 
                severity: 'error', 
                summary: 'Diferencia en Pagos', 
                detail: `La suma de los pagos (${totalPayments.toFixed(2)}) no coincide con el total de la factura (${invoiceTotal.toFixed(2)}).` 
            });
            return;
        }
    }

    const formData = { ...this.form.value };
    if (formData.due_date instanceof Date) {
        formData.due_date = formData.due_date.toISOString().split('T')[0];
    }
    
    this.saving.set(true);
    this.invoiceService.createInvoice(formData).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.status === 'PENDING_AUTHORIZATION') {
          this.confirmationService.confirm({
            message: `La factura ${res.document_number} ha sido creada pero requiere AUTORIZACIÓN de un supervisor debido a límites de crédito o descuentos. No se generará el PDF hasta que sea aprobada.`,
            header: 'Autorización Requerida',
            icon: 'pi pi-exclamation-triangle',
            rejectVisible: false,
            acceptLabel: 'Entendido',
            accept: () => {
              this.router.navigate(['/sales/invoices']);
            }
          });
        } else {
          this.msg.add({ severity: 'success', summary: 'Éxito', detail: `Factura ${res.document_number} generada` });
          
          // Abrir PDF solo si está aprobada/pagada
          this.invoiceService.printInvoice(res.id).subscribe((blob: Blob) => {
              const url = window.URL.createObjectURL(blob);
              window.open(url, '_blank');
          });

          setTimeout(() => this.router.navigate(['/sales/invoices']), 1500);
        }
      },
      error: (err) => {
        this.saving.set(false);
        const errorMsg = err.error.error || 'Error al facturar';
        this.msg.add({ severity: 'error', summary: 'Error', detail: errorMsg });
      }
    });
  }
}
