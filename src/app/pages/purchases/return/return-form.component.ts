import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RouterLink } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { GoodsReceiptService } from '@src/app/services/goods-receipt.service';
import { VendorReturnService } from '@src/app/services/vendor-return.service';
import { BehaviorSubject } from 'rxjs';
import { Customtable } from '@src/app/components/customTable/customtable';
import { CastToFormGroupPipe } from '@src/app/components/cast-to-form-group.pipe';

@Component({
  selector: 'app-return-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CardModule, ButtonModule, InputNumberModule, InputTextModule, ToastModule, RouterLink, Customtable, CastToFormGroupPipe],
  templateUrl: './return-form.html'
})
export class ReturnFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private receiptService = inject(GoodsReceiptService);
  private returnService = inject(VendorReturnService);
  private msg = inject(MessageService);
  private cd = inject(ChangeDetectorRef);

  form: FormGroup;
  receipt = signal<any>(null);
  receiptData = signal<any>(null);
  dataSubject = new BehaviorSubject<any>({ results: [], count: 0 });

  constructor() {
    this.form = this.fb.group({
      receipt: [null, Validators.required],
      reason: ['', Validators.required],
      lines: this.fb.array([])
    });
  }

  isViewMode = false;
  returnDetail = signal<any>(null);

  get returnCols() {
    const cols = [
        { field: 'sku_code', header: 'Código' },
        { field: 'sku_name', header: 'Descripción' }
    ];
    
    if (this.isViewMode) {
        cols.push({ field: 'quantity', header: 'Cant. Devuelta' });
    } else {
        cols.push({ field: 'received_qty', header: 'Cant. Recibida' });
        cols.push({ field: 'quantity', header: 'Cant. a Devolver' });
    }
    
    cols.push({ field: 'unit_price', header: 'Costo' });
    cols.push({ field: 'total_line', header: 'Total' });
    return cols;
  }

  dummyLoader = (params: any) => this.dataSubject.asObservable();

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const receiptId = this.route.snapshot.queryParamMap.get('receiptId');

    if (id) {
      this.isViewMode = true;
      this.returnService.getReturnById(id).subscribe(r => {
        this.returnDetail.set(r);
        console.log('Return detail data:', r);
        this.form.patchValue({
          receipt: r.receipt,
          reason: r.reason
        });
        
        const lines = r.lines.map((l: any) => {
            const price = Number(l.unit_price) || 0;
            const qty = Number(l.quantity) || 0;
            return {
                ...l,
                sku_code: l.sku_code || 'N/A',
                sku_name: l.sku_name || 'N/A',
                received_qty: qty, // or whatever original qty was
                unit_price: price,
                total_line: (qty * price).toFixed(2)
            };
        });
        
        this.dataSubject.next({ results: lines, count: lines.length });
        this.cd.detectChanges();
        this.form.disable();
      });
    } else if (receiptId) {
      this.receiptService.getReceiptById(receiptId).subscribe(r => {
        this.receiptData.set(r); 
        this.form.patchValue({ receipt: r.id });
        const linesArray = this.form.get('lines') as FormArray;
        
        r.lines.forEach((line: any) => {
          const price = Number(line.unit_price) || 0;
          const alreadyReturned = Number(line.already_returned || 0);
          const maxAvailable = Number(line.quantity) - alreadyReturned;
          
          const group = this.fb.group({
            sku: [line.sku, Validators.required],
            sku_name: [line.sku_name],
            sku_code: [line.sku_code],
            received_qty: [line.quantity],
            already_returned: [alreadyReturned],
            available_qty: [maxAvailable],
            quantity: [null, [Validators.min(1), Validators.max(maxAvailable)]],
            unit_price: [price]
          });

          if (maxAvailable <= 0) {
            group.get('quantity')?.disable();
          }

          linesArray.push(group);
        });
        const currentLines = linesArray.value.map((l: any) => ({
            ...l,
            total_line: (Number(l.quantity || 0) * Number(l.unit_price)).toFixed(2)
        }));
        this.dataSubject.next({ results: currentLines, count: currentLines.length });
        this.cd.detectChanges();
      });
    }
  }

  get lines() { return this.form.get('lines') as FormArray; }

  getIndex(item: any): number {
    return this.lines.controls.findIndex(c => c.value.sku === item.sku);
  }

  calculateTotal(index: number) {
    const control = this.lines.at(index);
    const qty = control.get('quantity')?.value;
    const max = control.get('received_qty')?.value;
    
    if (qty && max && qty > max) {
      control.get('quantity')?.setValue(null);
      this.msg.add({ 
        severity: 'error', 
        summary: 'Cantidad Inválida', 
        detail: `No puede devolver más de ${max} unidades.` 
      });
    }
  }

  hasValidQuantities(): boolean {
      const lines = this.lines.value;
      const atLeastOne = lines.some((l: any) => l.quantity && l.quantity > 0);
      const allValid = lines.every((l: any) => 
        (l.quantity === null || l.quantity === 0) || 
        (l.quantity > 0 && l.quantity <= l.available_qty)
      );
      return atLeastOne && allValid;
  }

  save() {
    if (this.form.valid && this.hasValidQuantities()) {
      const payload = {
          ...this.form.value,
          lines: this.form.value.lines.filter((l: any) => l.quantity && l.quantity > 0)
      };
      this.returnService.createReturn(payload).subscribe({
        next: () => {
          this.router.navigate(['/purchases/return']);
        },
        error: () => this.msg.add({ severity: 'error', summary: 'Error al registrar' })
      });
    } else {
        this.msg.add({ severity: 'warn', summary: 'Atención', detail: 'Debe ingresar al menos una cantidad válida mayor a cero.' });
    }
  }
}
