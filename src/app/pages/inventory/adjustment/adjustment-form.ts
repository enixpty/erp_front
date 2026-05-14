import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SkuService } from '@src/app/services/sku.service';
import { WarehouseService } from '@src/app/services/warehouse.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@src/environments/environment';

@Component({
  selector: 'app-adjustment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, SelectModule, InputTextModule, TextareaModule, ToastModule, RouterLink],
  providers: [MessageService],
  templateUrl: './adjustment-form.html'
})
export class AdjustmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private msg = inject(MessageService);
  private skuService = inject(SkuService);
  private whService = inject(WarehouseService);
  private cd = inject(ChangeDetectorRef);

  form: FormGroup = this.fb.group({
    sku: [null, Validators.required],
    movement_type: [null, Validators.required],
    warehouse_source: [null],
    warehouse_destination: [null],
    quantity: [0, [Validators.required, Validators.min(0.01)]],
    notes: ['', Validators.required]
  });

  skus: any[] = [];
  warehouses: any[] = [];
  types: any[] = [];

  ngOnInit() {
    this.skuService.getSkus({}).subscribe(data => {
        this.skus = data.results || data;
        this.cd.detectChanges();
    });
    this.whService.getWarehouses({}).subscribe(data => {
        this.warehouses = data.results || data;
        this.cd.detectChanges();
    });
    this.http.get<any>(`${environment.apiUrl}/api/inventory/movement-types/`).subscribe(data => {
        this.types = data.results || data;
        this.cd.detectChanges();
    });
  }

  save() {
    if (this.form.valid) {
      const payload = { ...this.form.value, document_reference: 'AJUSTE-MANUAL' };
      this.http.post(`${environment.apiUrl}/api/inventory/stock-movements/`, payload).subscribe({
        next: () => {
          this.msg.add({ severity: 'success', summary: 'Ajuste registrado' });
          this.form.reset();
        },
        error: () => this.msg.add({ severity: 'error', summary: 'Error al registrar' })
      });
    }
  }

  getSelectedType() {
    return this.types.find(t => t.id === this.form.get('movement_type')?.value);
  }
}
