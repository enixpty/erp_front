import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, InputNumberModule, SelectModule, AutoCompleteModule, ToastModule, RouterLink],
  providers: [MessageService],
  templateUrl: './order-form.html'
})
export class OrderFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private poService = inject(PurchaseOrderService);
  private skuService = inject(SkuService);
  private configService = inject(GlobalConfigService);
  private fb = inject(FormBuilder);
  private msg = inject(MessageService);

  order = signal<any>(null);
  filteredSkus = signal<any[]>([]);
  taxRate = signal<number>(0);
  form: FormGroup = this.fb.group({
    lines: this.fb.array([]),
    freight_cost: [0],
    insurance_cost: [0],
    tax_rate: [0]
  });

  get subtotal(): number {
    if (!this.lines || !this.lines.controls) return 0;
    const val = this.lines.controls.reduce((acc:any, control : any) => {
        const qty = parseFloat(control.get('quantity')?.value) || 0;
        const price = parseFloat(control.get('unit_price')?.value) || 0;
        return acc + (qty * price);
    }, 0);
    return Number(val);
  }

  get taxAmount(): number {
    const freight = parseFloat(this.form.get('freight_cost')?.value) || 0;
    const insurance = parseFloat(this.form.get('insurance_cost')?.value) || 0;
    const rate = parseFloat(this.form.get('tax_rate')?.value) || 0;
    const val = (this.subtotal + freight + insurance) * (rate / 100);
    return Number(val);
  }

  get total(): number {
    const freight = parseFloat(this.form.get('freight_cost')?.value) || 0;
    const insurance = parseFloat(this.form.get('insurance_cost')?.value) || 0; 
    const val = this.subtotal + this.taxAmount + freight + insurance;
    return Number(val);
  }

  ngOnInit() {
    this.configService.getConfig().subscribe((c: any) => {
        if (c && c.count > 0) {
            const rate = parseFloat(c.results[0].tax_rate);
            this.taxRate.set(rate);
            this.form.get('tax_rate')?.setValue(rate);
        }
    });
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
        this.poService.getPurchaseOrderById(id).subscribe(o => {
            this.order.set(o);
            this.initForm(o);
        });
    } else {
        // Nueva orden: inicializar con estructura vacía
        this.order.set({ id: 'NUEVA', status: 'DRAFT', lines: [] });
        this.initForm(null);
    }
  }

  initForm(order: any) {
    if (order) {
        this.form.patchValue({
            freight_cost: order.freight_cost || 0,
            insurance_cost: order.insurance_cost || 0,
            tax_rate: order.tax_rate || this.taxRate()
        });

        const isDraft = order.status === 'DRAFT';
        const lines = this.form.get('lines') as FormArray;
        
        order.lines.forEach((l: any) => {
            const group = this.fb.group({
                id: [l.id],
                sku: [{value: {id: l.sku, code: l.sku_code}, disabled: !isDraft}], 
                description: [{value: l.sku_name, disabled: !isDraft}],
                quantity: [{value: parseFloat(l.quantity), disabled: !isDraft}],
                unit_price: [{value: parseFloat(l.unit_price), disabled: !isDraft}]
            });
            lines.push(group);
        });

        if (!isDraft) {
            this.form.get('freight_cost')?.disable();
            this.form.get('insurance_cost')?.disable();
        }
    } else {
        // Si es nueva, agregar una línea inicial por defecto
        this.addLine();
    }
  }

  get lines() { return this.form.get('lines') as FormArray; }

  // Se debe usar la misma lógica de búsqueda de list-purchase-order
  searchSku(event: any) {
    this.skuService.getSkus({ search: event.query }).subscribe(res => {
        this.filteredSkus.set(res.results || []);
    });
  }

  onSkuSelect(event: any, line: any) {
    // Según los logs, el objeto seleccionado está en event.value
    const sku = event.value || event; 
    line.get('description')?.setValue(sku.name || '');
  }

  addLine() {
    (this.form.get('lines') as FormArray).push(this.fb.group({
      sku: [null, Validators.required],
      description: [''],
      quantity: [1, Validators.required],
      unit_price: [0, Validators.required]
    }));
  }

  save() {
    // Implementar lógica de update vía poService
    this.msg.add({severity: 'success', summary: 'Guardado'});
  }

  printPDF() {
    const id = this.order().id;
    this.poService.printOrderPDF(id).subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `OC_${id}.pdf`;
        a.click();
    });
  }
}
