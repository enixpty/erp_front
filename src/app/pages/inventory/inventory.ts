import { Component, inject } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { ListStockLevelsComponent } from './stock-levels/list-stock-levels';
import { StockService } from '@src/app/services/stock.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, ChartModule, CardModule, ListStockLevelsComponent],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory {
  private stockService = inject(StockService);
  chartData: any;

  ngOnInit() {
    this.stockService.getStockLevels({}).subscribe((res: any) => {
      const warehouseData: any = {};
      res.results.forEach((item: any) => {
        const val = Number(item.quantity) * Number(item.sku_cost);
        warehouseData[item.warehouse_name] = (warehouseData[item.warehouse_name] || 0) + val;
      });

      this.chartData = {
        labels: Object.keys(warehouseData),
        datasets: [{
          data: Object.values(warehouseData),
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350']
        }]
      };
    });
  }
}
