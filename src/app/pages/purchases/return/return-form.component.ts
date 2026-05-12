import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
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

@Component({
  selector: 'app-return-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, InputNumberModule, InputTextModule, ToastModule, RouterLink],
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

  constructor() {
    this.form = this.fb.group({
      receipt: [null, Validators.required],
      reason: ['', Validators.required],
      lines: this.fb.array([])
    });
  }

  ngOnInit() {
    const receiptId = this.route.snapshot.queryParamMap.get('receiptId');
    if (receiptId) {
      this.receiptService.getReceiptById(receiptId).subscribe(r => {
        this.receipt.set(r);
        this.form.patchValue({ receipt: r.id });
        const linesArray = this.form.get('lines') as FormArray;
        r.lines.forEach((line: any) => {
          linesArray.push(this.fb.group({
            sku: [line.sku, Validators.required],
            sku_name: [line.sku_name],
            quantity: [line.quantity, [Validators.required, Validators.max(line.quantity)]]
          }));
        });
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
