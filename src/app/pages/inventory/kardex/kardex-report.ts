import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { Select } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { HttpClient } from '@angular/common/http';
import { SkuService } from '@src/app/services/sku.service';
import { WarehouseService } from '@src/app/services/warehouse.service';

@Component({
  selector: 'app-kardex-report',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, Select, ButtonModule, DatePicker, TableModule],
  templateUrl: './kardex-report.html'
})
export class KardexReportComponent implements OnInit {
  private http = inject(HttpClient);
  private skuService = inject(SkuService);
  private warehouseService = inject(WarehouseService);

  skus: any[] = [];
  warehouses: any[] = [];
  
  filters = { sku: null, warehouse: null, start_date: null, end_date: null };
  report: any = null;

  ngOnInit() {
    this.skuService.getSkus({}).subscribe(data => this.skus = (data.results || data));
    this.warehouseService.getWarehouses({}).subscribe(data => this.warehouses = (data.results || data));
  }

  loadReport() {
    if (!this.filters.sku || !this.filters.warehouse || !this.filters.start_date || !this.filters.end_date) return;
    
    const start = (this.filters.start_date as any).toISOString().split('T')[0];
    const end = (this.filters.end_date as any).toISOString().split('T')[0];
    
    const url = `http://localhost:8000/api/inventory/kardex/report/?sku_id=${this.filters.sku}&warehouse_id=${this.filters.warehouse}&start_date=${start}&end_date=${end}`;
    
    this.http.get<any>(url).subscribe(data => {
      this.report = data;
    });
  }
}
