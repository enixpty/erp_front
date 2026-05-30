import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { Select } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { environment } from '@src/environments/environment';
import { SkuService } from '@src/app/services/sku.service';
import { WarehouseService } from '@src/app/services/warehouse.service';

@Component({
  selector: 'app-kardex-report',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, Select, ButtonModule,
            DatePicker, TableModule, TagModule, ToastModule],
  providers: [MessageService],
  templateUrl: './kardex-report.html'
})
export class KardexReportComponent implements OnInit {
  private http = inject(HttpClient);
  private skuService = inject(SkuService);
  private warehouseService = inject(WarehouseService);
  private msg = inject(MessageService);

  skus: any[] = [];
  warehouses: any[] = [];

  filters = { sku: null, warehouse: null, start_date: null as Date | null, end_date: null as Date | null };
  report = signal<any>(null);
  isLoading = signal<boolean>(false);
  isExporting = signal<boolean>(false);

  ngOnInit() {
    // nopaginate: true → trae TODOS los productos, no solo la primera página
    this.skuService.getSkus({ nopaginate: true }).subscribe(data => {
      const raw = data.results || data;
      this.skus = raw.map((s: any) => ({ ...s, searchLabel: `${s.code} — ${s.name}` }));
    });
    this.warehouseService.getWarehouses({}).subscribe(data => {
      this.warehouses = data.results || data;
    });
  }

  // ── Totales calculados sobre los movimientos ────────────────
  get totalEntradas(): number {
    const r = this.report();
    if (!r?.movements) return 0;
    return r.movements
      .filter((m: any) => m.type === 'ENTRADA')
      .reduce((s: number, m: any) => s + Number(m.qty || 0), 0);
  }

  get totalSalidas(): number {
    const r = this.report();
    if (!r?.movements) return 0;
    return r.movements
      .filter((m: any) => m.type === 'SALIDA')
      .reduce((s: number, m: any) => s + Number(m.qty || 0), 0);
  }

  get movementCount(): number {
    return this.report()?.movements?.length || 0;
  }

  get selectedSkuLabel(): string {
    const s = this.skus.find(x => x.id === this.filters.sku);
    return s ? s.searchLabel : '';
  }

  get selectedWarehouseLabel(): string {
    const w = this.warehouses.find(x => x.id === this.filters.warehouse);
    return w ? w.name : '';
  }

  loadReport() {
    if (!this.filters.sku || !this.filters.warehouse || !this.filters.start_date || !this.filters.end_date) {
      this.msg.add({ severity: 'warn', summary: 'Datos incompletos',
        detail: 'Seleccione producto, bodega y el rango de fechas.' });
      return;
    }
    if (this.filters.start_date > this.filters.end_date) {
      this.msg.add({ severity: 'error', summary: 'Rango inválido',
        detail: 'La fecha de inicio no puede ser posterior a la fecha de fin.' });
      return;
    }

    const start = this.filters.start_date.toISOString().split('T')[0];
    const end   = this.filters.end_date.toISOString().split('T')[0];

    const url = `${environment.apiUrl}/api/inventory/kardex/report/`
      + `?sku_id=${this.filters.sku}`
      + `&warehouse_id=${this.filters.warehouse}`
      + `&start_date=${start}&end_date=${end}`;

    this.isLoading.set(true);
    this.report.set(null);
    this.http.get<any>(url).subscribe({
      next: (data) => { this.report.set(data); this.isLoading.set(false); },
      error: (err) => {
        this.msg.add({ severity: 'error', summary: 'Error',
          detail: err.error?.error || 'No se pudo cargar el kardex.' });
        this.isLoading.set(false);
      }
    });
  }

  exportExcel() {
    if (!this.report()) return;
    const start = this.filters.start_date!.toISOString().split('T')[0];
    const end   = this.filters.end_date!.toISOString().split('T')[0];

    const url = `${environment.apiUrl}/api/inventory/kardex/report_excel/`
      + `?sku_id=${this.filters.sku}`
      + `&warehouse_id=${this.filters.warehouse}`
      + `&start_date=${start}&end_date=${end}`;

    this.isExporting.set(true);
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const fileURL = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = `Kardex_${end}.xlsx`;
        a.click();
        URL.revokeObjectURL(fileURL);
        this.isExporting.set(false);
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo exportar el kardex.' });
        this.isExporting.set(false);
      }
    });
  }
}
