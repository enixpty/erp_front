import { Component, inject, OnInit, signal } from '@angular/core';
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

@Component({
  selector: 'app-return-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CardModule, ButtonModule, InputNumberModule, InputTextModule, ToastModule, RouterLink, Customtable],
  providers: [MessageService],
  templateUrl: './return-form.html'
})
export class ReturnFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private receiptService = inject(GoodsReceiptService);
  private returnService = inject(VendorReturnService);
  private msg = inject(MessageService);

  form: FormGroup;
  receipt = signal<any>(null);
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

  returnCols = [
    { field: 'sku_code', header: 'Código' },
    { field: 'sku_name', header: 'Descripción' },
    { field: 'quantity', header: 'Cantidad' },
    { field: 'unit_price', header: 'Costo' },
    { field: 'total_line', header: 'Total' }
  ];

  dummyLoader = (params: any) => this.dataSubject.asObservable();

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const receiptId = this.route.snapshot.queryParamMap.get('receiptId');

    if (id) {
      this.isViewMode = true;
      this.returnService.getReturnById(id).subscribe(r => {
        this.returnDetail.set(r);
        this.form.patchValue({
          receipt: r.receipt,
          reason: r.reason
        });
        
        // En modo view, los datos deben traer el costo de la línea o calcularse
        const lines = r.lines.map((l: any) => {
            const price = Number(l.unit_price) || 0;
            const qty = Number(l.quantity) || 0;
            return {
                ...l,
                unit_price: price,
                total_line: (qty * price).toFixed(2)
            };
        });
        
        this.dataSubject.next({ results: lines, count: lines.length });
        this.form.disable();
      });
    } else if (receiptId) {
      this.receiptService.getReceiptById(receiptId).subscribe(r => {
        this.receipt.set(r);
        this.form.patchValue({ receipt: r.id });
        const linesArray = this.form.get('lines') as FormArray;
        r.lines.forEach((line: any) => {
          // Aseguramos capturar el precio unitario correctamente
          const price = Number(line.unit_price) || 0;
          linesArray.push(this.fb.group({
            sku: [line.sku, Validators.required],
            sku_name: [line.sku_name],
            sku_code: [line.sku_code],
            quantity: [line.quantity, [Validators.required, Validators.max(line.quantity)]],
            unit_price: [price]
          }));
        });
        const currentLines = this.form.get('lines')?.value.map((l: any) => {
            const price = Number(l.unit_price) || 0;
            const qty = Number(l.quantity) || 0;
            return {
                ...l,
                unit_price: price,
                total_line: (qty * price).toFixed(2)
            };
        });
        this.dataSubject.next({ results: currentLines, count: currentLines.length });
      });
    }
  }

  get lines() { return this.form.get('lines') as FormArray; }

  save() {
    if (this.form.valid) {
      this.returnService.createReturn(this.form.value).subscribe({
        next: () => {
          this.msg.add({ severity: 'success', summary: 'Devolución registrada' });
          this.router.navigate(['/purchases/return']);
        },
        error: () => this.msg.add({ severity: 'error', summary: 'Error al registrar' })
      });
    }
  }
}
