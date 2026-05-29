import { Component, inject, OnInit, ViewChild, ElementRef, ViewChildren, QueryList, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
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

@Component({
  selector: 'app-quotation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, Select, InputTextModule, TableModule, DividerModule, Toast, RouterLink, ConfirmDialogModule, SplitButtonModule, DialogModule],
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

  get showCustomerName() {
    const client = this.clients.find(c => c.id === this.form.get('client')?.value);
    return client && client.payment_term === 'CASH';
  }

  clients: any[] = [];
  skus: any[] = [];
  warehouses: any[] = [];
  actionItems: MenuItem[] = [];
  isEdit = false;
  buttonLabel = 'Guardar';
  showWarehouseDialog = signal<boolean>(false);
  selectedWarehouseId: number | null = null;
  isLoaded = false;

  statusOptions = [
    { label: 'Borrador', value: 'DRAFT' },
    { label: 'Enviada', value: 'SENT' },
    { label: 'Aceptada', value: 'ACCEPTED' },
    { label: 'Rechazada', value: 'REJECTED' }
  ];

  get details() {
    return this.form.get('details') as FormArray;
  }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.isEdit = !!id;
    this.buttonLabel = this.isEdit ? 'Actualizar' : 'Guardar';

    // Usamos setTimeout para mover la carga de datos al siguiente macrotask 
    // y evitar el error NG0100 con los componentes de PrimeNG
    setTimeout(() => {
        this.loadClients();
        this.loadWarehouses();
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
        command: () => this.msg.add({ severity: 'info', summary: 'Info', detail: 'Funcionalidad próximamente' })
      }
    ];
  }

  showWarehouseSelection() {
    if (this.warehouses.length === 0) {
      this.msg.add({ severity: 'warn', summary: 'Atención', detail: 'No hay bodegas configuradas.' });
      return;
    }

    if (this.warehouses.length === 1) {
      this.confirmConversion(this.warehouses[0]);
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
    this.confirmConversion(warehouse);
  }

  confirmConversion(warehouse: any) {
    this.confirmationService.confirm({
      message: `¿Desea convertir esta cotización en un Pedido de Venta usando la bodega "${warehouse.name}"?`,
      header: 'Confirmar Conversión',
      icon: 'pi pi-question-circle',
      accept: () => this.convert(warehouse.id)
    });
  }

  convert(warehouseId: number) {
    const id = this.form.get('id')?.value;
    this.quotationService.convertQuotation(id, warehouseId).subscribe({
      next: (res) => {
        // Asumiendo que el backend ahora devuelve el objeto o el número de documento
        const msgDetail = res.document_number 
          ? `Pedido ${res.document_number} generado exitosamente` 
          : res.message;
          
        this.msg.add({ 
          severity: 'success', 
          summary: 'Conversión Exitosa', 
          detail: msgDetail,
          sticky: true 
        });
        
        this.form.disable();
        this.form.patchValue({ status: 'ACCEPTED' });
        this.cd.detectChanges();
        
        // Redirigir después de un tiempo para que el usuario vea el número
        setTimeout(() => {
          if (res.sales_order_id) {
            this.router.navigate(['/sales/sales-orders', res.sales_order_id]);
          } else {
            this.router.navigate(['/sales/sales-orders']);
          }
        }, 3000);
      },
      error: (err) => this.msg.add({ severity: 'error', summary: 'Error', detail: err.error.error || 'Error al convertir' })
    });
  }

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
    const tax = subtotal * (taxPercent / 100);

    detail.patchValue({ subtotal, tax }, { emitEvent: false });
    this.calculateTotals();
  }

  calculateTotals() {
    let subtotal = 0;
    let totalTaxBeforeDiscount = 0;
    const globalDiscountPercent = this.form.get('global_discount')?.value || 0;

    this.details.controls.forEach(control => {
      const rowSubtotal = control.get('subtotal')?.value || 0;
      subtotal += rowSubtotal;

      const taxPercent = control.get('tax_exempt')?.value ? 0 : (control.get('tax_percent')?.value || 0);
      const rowTax = rowSubtotal * (taxPercent / 100);
      totalTaxBeforeDiscount += rowTax;
    });

    const discountAmount = subtotal * (globalDiscountPercent / 100);
    const globalTaxDiscount = totalTaxBeforeDiscount * (globalDiscountPercent / 100);

    const tax = totalTaxBeforeDiscount - globalTaxDiscount;
    const total = (subtotal - discountAmount) + tax;

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
