import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Customtable } from '@src/app/components/customTable/customtable';
import { StockService } from '@src/app/services/stock.service';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-list-stock-levels',
  standalone: true,
  imports: [CommonModule, CardModule, Customtable, TagModule],
  templateUrl: './list-stock-levels.html'
})
export class ListStockLevelsComponent {
  public stockService = inject(StockService);

  cols = [
    { field: 'sku_code', header: 'Código SKU', filter: true },
    { field: 'sku_name', header: 'Descripción', filter: true },
    { field: 'warehouse_name', header: 'Bodega', filter: true },
    { field: 'quantity', header: 'Existencia Actual' }
  ];

  loadStock = (params: any) => this.stockService.getStockLevels(params);

  getSeverity(quantity: number) {
    if (quantity <= 0) return 'danger';
    if (quantity < 10) return 'warn';
    return 'success';
  }
}
