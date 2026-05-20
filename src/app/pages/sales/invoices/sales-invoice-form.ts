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
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { SalesInvoiceService } from '@src/app/services/sales-invoice.service';
import { ClientService } from '@src/app/services/client.service';
import { SkuService } from '@src/app/services/sku.service';
import { WarehouseService } from '@src/app/services/warehouse.service';

@Component({
  selector: 'app-sales-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, Select, InputTextModule, TableModule, DividerModule, DatePickerModule, Toast, RouterLink],
  providers: [MessageService],
  templateUrl: './sales-invoice-form.html'
})
export class SalesInvoiceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private invoiceService = inject(SalesInvoiceService);
  private clientService = inject(ClientService);
  private skuService = inject(SkuService);
  private warehouseService = inject(WarehouseService);
  private msg = inject(MessageService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  form: FormGroup = this.fb.group({
    client: [null, Validators.required],
    document_type: [null, Validators.required],
    warehouse_id: [null, Validators.required],
    due_date: [null, Validators.required],
    global_discount: [0, [Validators.min(0)]],
    subtotal: [0],
    tax: [0],
    total: [0],
    notes: [''],
    details: this.fb.array([])
  });

  clients: any[] = [];
  skus: any[] = [];
  warehouses: any[] = [];
  documentTypes: any[] = [];
  isLoaded = false;

  get details() {
    return this.form.get('details') as FormArray;
  }

  ngOnInit() {
    this.form.patchValue({ due_date: new Date() });
    this.loadInitialData();
  }

  async loadInitialData() {
    this.clientService.getClients({}).subscribe(data => this.clients = data.results || data);
    this.warehouseService.getWarehouses({}).subscribe(data => this.warehouses = data.results || data);
    this.invoiceService.getDocumentTypes().subscribe(data => this.documentTypes = data.results || data);
    
    this.skuService.getSkus({}).subscribe(data => {
        this.skus = (data.results || data).map((s: any) => ({ ...s, searchLabel: `${s.code} - ${s.name}` }));
        if (this.details.length === 0) {
            this.addDetail();
        }
        this.isLoaded = true;
        // Obliga a angular a detectar cambios después de actualizar la bandera de carga
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
      subtotal: [0]
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
    const selectedSku = this.skus.find(s => s.id === selectedSkuId);
    if (selectedSku) {
      detail.patchValue({
        price: selectedSku.sell_price,
        tax_exempt: selectedSku.tax_exempt
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
    detail.get('subtotal')?.setValue(subtotal);
    this.calculateTotals();
  }

  calculateTotals() {
    let subtotal = 0;
    let taxableAmount = 0;
    const globalDiscountPercent = this.form.get('global_discount')?.value || 0;

    this.details.controls.forEach(control => {
      const rowSubtotal = control.get('subtotal')?.value || 0;
      subtotal += rowSubtotal;
      
      if (!control.get('tax_exempt')?.value) {
        taxableAmount += rowSubtotal;
      }
    });

    const discountAmount = subtotal * (globalDiscountPercent / 100);
    const taxableAfterDiscount = Math.max(0, taxableAmount * (1 - (globalDiscountPercent / 100)));
    
    const tax = taxableAfterDiscount * 0.07;
    const total = (subtotal - discountAmount) + tax;
    
    this.form.patchValue({ subtotal, tax, total }, { emitEvent: false });
  }

  save() {
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

    this.invoiceService.createInvoice(this.form.value).subscribe({
      next: (res) => {
        this.msg.add({ severity: 'success', summary: 'Éxito', detail: `Factura ${res.document_number} generada` });
        window.open(`/api/sales/sales-invoices/${res.id}/print/`, '_blank');
        setTimeout(() => this.router.navigate(['/sales/invoices']), 1500);
      },
      error: (err) => this.msg.add({ severity: 'error', summary: 'Error', detail: err.error.error || 'Error al facturar' })
    });
  }
}
