import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PurchaseOrderService } from '@src/app/services/purchase-order.service';
import { SkuService } from '@src/app/services/sku.service';
import { GlobalConfigService } from '@src/app/services/global-config.service';
import { SupplierService } from '@src/app/services/supplier.service';
import { WarehouseService } from '@src/app/services/warehouse.service';
import { first } from 'rxjs';

@Component({
  selector: 'app-order-new',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, InputNumberModule, SelectModule, AutoCompleteModule, ToastModule, RouterLink],
  templateUrl: './order-new.html'
})
export class OrderNewComponent implements OnInit {
  private poService = inject(PurchaseOrderService);
  private skuService = inject(SkuService);
  private configService = inject(GlobalConfigService);
  private supplierService = inject(SupplierService);
  private warehouseService = inject(WarehouseService);
  private fb = inject(FormBuilder);
  private msg = inject(MessageService);
  private router = inject(Router);

  filteredSkus = signal<any[]>([]);
  suppliers = signal<any[]>([]);
  warehouses = signal<any[]>([]);
  taxRate = signal<number>(0);

  form: FormGroup = this.fb.group({
    supplier: [null, Validators.required],
    warehouse: [null, Validators.required],
    freight_cost: [0],
    insurance_cost: [0],
    tax_rate: [0],
    lines: this.fb.array([])
  });

  get subtotal(): number {
    return this.lines.controls.reduce((acc:any, control : any) => {
        const qty = control.get('quantity')?.value || 0;
        const price = control.get('unit_price')?.value || 0;
        return acc + (qty * price);
    }, 0);
  }

  get taxAmount(): number {
    const freight = parseFloat(this.form.get('freight_cost')?.value || 0);
    const insurance = parseFloat(this.form.get('insurance_cost')?.value || 0);
    const taxRate = parseFloat(this.form.get('tax_rate')?.value || 0);

    const linesTotal = this.lines.controls.reduce((acc: number, control: any) => {
        const qty = parseFloat(control.get('quantity')?.value || 0);
        const price = parseFloat(control.get('unit_price')?.value || 0);
        return acc + (qty * price);
    }, 0);

    const baseAmount = linesTotal + freight + insurance;
    const tax = baseAmount * (taxRate / 100);
    return parseFloat(tax.toFixed(6));
  }

  get total(): number {
    const freight = parseFloat(this.form.get('freight_cost')?.value || 0);
    const insurance = parseFloat(this.form.get('insurance_cost')?.value || 0);
    const total = this.subtotal + this.taxAmount + freight + insurance;
    return parseFloat(total.toFixed(6));
  }

  get taxRateDisplay(): string {
    const rate = this.form.get('tax_rate')?.value || 0;
    return (rate).toFixed(4) + ' %';
  }

  ngOnInit() {
    this.configService.getConfig().subscribe((c: any) => {
        if (c && c.count > 0) {
            const rate = parseFloat(c.results[0].tax_rate);
            this.taxRate.set(rate);
            this.form.get('tax_rate')?.setValue(this.taxRate());
        }
    });
    this.supplierService.getSuppliers({}).subscribe(s => this.suppliers.set(s.results || []));
    this.warehouseService.getWarehouses({}).subscribe(w => this.warehouses.set(w.results || []));
    this.addLine();
  }

  get lines() { return this.form.get('lines') as FormArray; }

  searchSku(event: any) {
    this.skuService.getSkus({ search: event.query }).subscribe(res => this.filteredSkus.set(res.results || []));
  }

  onSkuSelect(event: any, line: any) {
    line.get('description')?.setValue(event.value.name);
  }

  addLine() {
    this.lines.push(this.fb.group({
      sku: [null, Validators.required],
      description: [''],
      quantity: [1, Validators.required],
      unit_price: [0, Validators.required]
    }));
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'Por favor complete todos los campos requeridos.' });
      return;
    }

    const payload = {
        supplier: this.form.value.supplier,
        warehouse: this.form.value.warehouse,
        freight_cost: this.form.value.freight_cost,
        insurance_cost: this.form.value.insurance_cost,
        tax_rate: this.form.value.tax_rate,
        lines: this.form.value.lines.map((l: any) => ({
            sku: l.sku.id,
            quantity: l.quantity,
            unit_price: l.unit_price
        }))
    };

    this.poService.createPurchaseOrder(payload).pipe(first()).subscribe({
        next: () => {
            setTimeout(() => this.router.navigate(['/purchases/orders']), 1000);
        },
        error: (err) => {
            console.error('Error capturado:', err);
            if (err.status !== 201 && err.status !== 200) {
                this.msg.add({severity: 'error', summary: 'Error', detail: err.error?.error || 'No se pudo crear la orden'});
            }
        }
    });
  }
}
