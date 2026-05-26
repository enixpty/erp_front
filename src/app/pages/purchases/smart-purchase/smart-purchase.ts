import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Customtable } from '@src/app/components/customTable/customtable';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { environment } from '@src/environments/environment';

@Component({
  selector: 'app-smart-purchase',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, Customtable, FormsModule, ToastModule],
  templateUrl: './smart-purchase.html'
})
export class SmartPurchaseComponent implements OnInit {
  private http = inject(HttpClient);
  private msg = inject(MessageService);
  
  skus = signal<any[]>([]);
  selectedSkus: any[] = [];
  loading = false;

  cols = [
    { field: 'code', header: 'SKU', filter: true },
    { field: 'name', header: 'Producto' , filter: true},
    { field: 'current_stock', header: 'Stock Actual', filter: true },
    { field: 'min_stock', header: 'Stock Mínimo' , filter: true},
    { field: 'last_price', header: 'Últ. Precio' , filter: true},
    { field: 'last_date', header: 'Últ. Compra', filter: true }
  ];

  ngOnInit() {
    this.loadLowStock();
  }

  loadLowStock() {
    this.http.get<any>(`${environment.apiUrl}/api/inventory/skus/low-stock/`).subscribe(res => {
        this.skus.set(res.results || res);
    });
  }

  processPurchase() {
    if (this.selectedSkus.length === 0) return;

    const payload = {
      skus_data: this.selectedSkus.map(s => ({ sku_id: s.id, quantity: s.min_stock - s.current_stock }))
    };

    this.loading = true;
    this.http.post(`${environment.apiUrl}/api/purchases/generate-pos/`, payload).subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'Procesando', detail: 'Órdenes de compra generándose en segundo plano...' });
        this.loading = false;
        this.selectedSkus = [];
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron generar las órdenes' });
        this.loading = false;
      }
    });
  }
}
