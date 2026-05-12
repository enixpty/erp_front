import { Component, inject, signal, ViewChild, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { FieldsetModule } from 'primeng/fieldset';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Customtable } from '@src/app/components/customTable/customtable';
import { PurchaseOrderService } from '@src/app/services/purchase-order.service';
import { SupplierService } from '@src/app/services/supplier.service';
import { SkuService } from '@src/app/services/sku.service';
import { WarehouseService } from '@src/app/services/warehouse.service';
import { GlobalConfigService } from '@src/app/services/global-config.service';
import { SKU } from '@src/app/interfaces/sku.interface';
import { Supplier } from '@src/app/interfaces/supplier.interface';
import { Warehouse } from '@src/app/interfaces/warehouse.interface';

@Component({
  selector: 'app-list-purchase-order',
  standalone: true,
  imports: [
    CommonModule, RouterLink, CardModule, ButtonModule, InputTextModule, DialogModule, 
    ReactiveFormsModule, SelectModule, InputNumberModule, ToastModule, Customtable, FieldsetModule, AutoCompleteModule, TooltipModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './list-purchase-order.html'
})
export class ListPurchaseOrderComponent implements OnInit {
  @ViewChild('poTable') table!: Customtable;
  @ViewChild('idTemplate') idTemplate!: TemplateRef<any>;
  public poService = inject(PurchaseOrderService);
  private supplierService = inject(SupplierService);
  private skuService = inject(SkuService);
  private warehouseService = inject(WarehouseService);
  private configService = inject(GlobalConfigService);
  private fb = inject(FormBuilder);
  private msg = inject(MessageService);

  displayModal = signal(false);
  taxRateValue = signal(0);
  suppliers = signal<Supplier[]>([]);
  warehouses = signal<Warehouse[]>([]);
  skus = signal<SKU[]>([]);
  filteredSkus = signal<SKU[]>([]);
  
  cols = [
    { field: 'id', header: 'ID' },
    { field: 'created', header: 'Fecha' },
    { field: 'supplier', header: 'Proveedor' },
    { field: 'total', header: 'Total' },
    { field: 'status', header: 'Estado' },
    { field: 'action', header: 'Acciones' }
  ];

  columnTemplates: any = {};

  form: FormGroup = this.fb.group({
    supplier: [null, Validators.required],
    warehouse: [null, Validators.required],
    tax_rate: [0, Validators.required],
    freight_cost: [0],
    insurance_cost: [0],
    lines: this.fb.array([])
  });

  ngOnInit() {
    this.columnTemplates = { 'id': this.idTemplate };
    this.supplierService.getSuppliers({rows: 1000}).subscribe(s => this.suppliers.set(s.results));
    this.warehouseService.getWarehouses({rows: 1000}).subscribe(w => this.warehouses.set(w.results));
    this.configService.getConfig().subscribe((c:any) => { 
        if (c && c.count > 0) this.taxRateValue.set(parseFloat(c.results[0].tax_rate) * 100);
    });
  }

  searchSku(event: any) {
    this.skuService.getSkus({ search: event.query }).subscribe(res => {
        this.filteredSkus.set(res.results || []);
    });
  }

  openNew() { 
    this.form.reset({ tax_rate: this.taxRateValue(), freight_cost: 0, insurance_cost: 0 });
    this.displayModal.set(true); 
  }

  get lines() { return this.form.get('lines') as FormArray; }

  addLine() {
    this.lines.push(this.fb.group({
      sku: [null, Validators.required],
      quantity: [1, Validators.required],
      unit_price: [0, Validators.required]
    }));
  }

  save() {
    if (this.form.invalid) return;

    const formData = {
        ...this.form.value,
        lines: this.form.value.lines.map((line: any) => ({
            ...line,
            sku: line.sku.id
        }))
    };

    this.poService.createPurchaseOrder(formData).subscribe(() => {
        this.displayModal.set(false);
        this.msg.add({ severity: 'success', summary: 'Creado' });
        this.table.onRefresh();
    });
  }

  confirmOrder(id: any) {
    this.poService.confirmOrder(id).subscribe(() => {
        this.msg.add({ severity: 'success', summary: 'Confirmado', detail: 'Orden de compra confirmada' });
        this.table.onRefresh();
    });
  }

  cancelOrder(id: any) {
    this.poService.cancelOrder(id).subscribe(() => {
        this.msg.add({ severity: 'warn', summary: 'Cancelado', detail: 'Orden de compra anulada' });
        this.table.onRefresh();
    });
  }
}
