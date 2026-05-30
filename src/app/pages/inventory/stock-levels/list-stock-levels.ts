import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Customtable } from '@src/app/components/customTable/customtable';
import { StockService } from '@src/app/services/stock.service';
import { PurchaseOrderService } from '@src/app/services/purchase-order.service';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { map } from 'rxjs';

@Component({
  selector: 'app-list-stock-levels',
  standalone: true,
  imports: [CommonModule, CardModule, Customtable, TagModule, ButtonModule, TooltipModule, ToastModule],
  providers: [MessageService],
  templateUrl: './list-stock-levels.html'
})
export class ListStockLevelsComponent {
  public stockService = inject(StockService);
  private poService = inject(PurchaseOrderService);
  private msg = inject(MessageService);

  isExporting = signal<boolean>(false);

  cols = [
    { field: 'sku_code', header: 'Código SKU', filter: true },
    { field: 'sku_name', header: 'Descripción', filter: true },
    { field: 'warehouse_name', header: 'Bodega', filter: true },
    { field: 'quantity', header: 'Físico' },
    { field: 'reserved_quantity', header: 'Reservado' },
    { field: 'available_quantity', header: 'Disponible' },
    { field: 'stock_min', header: 'Mín.' },
    { field: 'sku_cost', header: 'Costo Unit.' },
    { field: 'total_value', header: 'Valor Total' },
    { field: 'alert', header: 'Alerta', filter: true }
  ];

  loadStock = (params: any) => this.stockService.getStockLevels(params).pipe(
    map((res: any) => {
      if (res.results) {
        res.results = res.results.map((item: any) => {
          const qty = Number(item.quantity);
          const min = Number(item.stock_min);
          return {
            ...item,
            sku_cost: Number(item.sku_cost).toFixed(2),
            total_value: (qty * Number(item.sku_cost)).toFixed(2),
            alert: qty <= min ? 'REORDENAR' : 'OK'
          };
        });
      }
      return res;
    })
  );

  generateOrder(item: any) {
    console.log('Generando pedido para SKU:', item.sku_name);
    // Lógica para invocar al servicio de compras
    // Podríamos navegar a la pantalla de compra o disparar una acción inmediata
    alert(`Generando pedido para: ${item.sku_name}`);
  }

  exportExcel() {
    this.isExporting.set(true);
    this.stockService.exportExcel().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Inventario_Existencias.xlsx';
        a.click();
        URL.revokeObjectURL(url);
        this.isExporting.set(false);
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo exportar.' });
        this.isExporting.set(false);
      }
    });
  }

  getSeverity(quantity: number, min: number) {
    if (quantity <= 0) return 'danger';
    if (quantity <= min) return 'warn';
    return 'success';
  }
}
