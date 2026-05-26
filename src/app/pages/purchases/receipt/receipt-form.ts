import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { PurchaseOrderService } from '@src/app/services/purchase-order.service';
import { GoodsReceiptService } from '@src/app/services/goods-receipt.service';
import { WarehouseService } from '@src/app/services/warehouse.service';
import { Warehouse } from '@src/app/interfaces/warehouse.interface';

@Component({
  selector: 'app-receipt-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, SelectModule, InputNumberModule, ToastModule, FieldsetModule, InputTextModule, RouterLink],
  templateUrl: './receipt-form.html'
})
export class ReceiptFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private poService = inject(PurchaseOrderService);
  private receiptService = inject(GoodsReceiptService);
  private warehouseService = inject(WarehouseService);
  private fb = inject(FormBuilder);
  private msg = inject(MessageService);

  order = signal<any>(null);
  form: FormGroup = this.fb.group({
    order: [null, Validators.required],
    movement_type: [1, Validators.required], // ID temporal del tipo de movimiento
    lines: this.fb.array([])
  });

  ngOnInit() {
    const orderId = this.route.snapshot.params['id'];
    this.poService.getPurchaseOrders().subscribe((res:any) => {
        const foundOrder = res.results.find((o: any) => o.id == orderId);
        this.order.set(foundOrder);
        this.form.patchValue({ 
            order: orderId
        });
        foundOrder.lines.forEach((line: any, index: number) => {
            const control = this.fb.group({
                sku: [line.sku],
                quantity: [null, [Validators.required, Validators.min(0), (c: any) => {
                    return (c.value > line.quantity) ? { 'exceeded': true } : null;
                }]]
            });
            control.get('quantity')?.valueChanges.subscribe(val => {
                if (val !== null && val > line.quantity) {
                    this.msg.add({ severity: 'warn', summary: 'Advertencia', detail: `La cantidad ${val} excede lo solicitado (${line.quantity}) para el SKU ${line.sku_code}.` });
                }
            });
            (this.form.get('lines') as FormArray).push(control);
        });
    });
  }

  get lines() { return this.form.get('lines') as FormArray; }

  isLineInvalid(index: number): boolean {
    const control = this.lines.at(index).get('quantity');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  save() {
    if (this.form.invalid) return;
    
    this.receiptService.createReceipt(this.form.value).subscribe(() => {
        this.msg.add({ severity: 'success', summary: 'Recibido', detail: 'Mercancía ingresada' });
        this.router.navigate(['/purchases/orders']);
    });
  }
}
