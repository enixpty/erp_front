import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Customtable } from '@src/app/components/customTable/customtable';
import { StockService } from '@src/app/services/stock.service';
import { PurchaseOrderService } from '@src/app/services/purchase-order.service';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { map } from 'rxjs';

@Component({
  selector: 'app-list-stock-levels',
  standalone: true,
  imports: [CommonModule, CardModule, Customtable, TagModule, ButtonModule, TooltipModule],
  templateUrl: './list-stock-levels.html'
})
export class ListStockLevelsComponent {
  public stockService = inject(StockService);
  private poService = inject(PurchaseOrderService);

  cols = [
    { field: 'sku_code', header: 'Código SKU', filter: true },
    { field: 'sku_name', header: 'Descripción', filter: true },
    { field: 'warehouse_name', header: 'Bodega', filter: true },
    { field: 'quantity', header: 'Existencia Actual' },
    { field: 'stock_min', header: 'Stock Mínimo' },
    { field: 'sku_cost', header: 'Costo Unitario' },
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

  getSeverity(quantity: number, min: number) {
    if (quantity <= 0) return 'danger';
    if (quantity <= min) return 'warn';
    return 'success';
  }
}
