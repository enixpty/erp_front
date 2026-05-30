import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { Select } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { ClientService } from '@src/app/services/client.service';
import { Customtable } from '@src/app/components/customTable/customtable';
import { environment } from '@src/environments/environment';

@Component({
  selector: 'app-aging-monitor',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, Select, ButtonModule, DatePickerModule, ToastModule, Customtable],
  providers: [MessageService],
  templateUrl: './aging-monitor.html'
})
export class AgingMonitorComponent implements OnInit {
  private http = inject(HttpClient);
  private clientService = inject(ClientService);
  private cdr = inject(ChangeDetectorRef);
  private msg = inject(MessageService);

  selectedClient: any = null;
  clients: any[] = [];
  agingData: any = null;
  subsidiaries: any[] = [];

  // Rango de fechas para el estado de cuenta (default: año en curso hasta hoy)
  startDate: Date = new Date(new Date().getFullYear(), 0, 1);
  endDate: Date = new Date();

  cols = [
    { field: 'date', header: 'Fecha' },
    { field: 'type', header: 'Tipo' },
    { field: 'document', header: 'Documento' },
    { field: 'amount', header: 'Monto' }
  ];

  ngOnInit() {
    this.clientService.getClients({}).subscribe(data => {
      this.clients = (data.results || data).filter((c: any) => c.payment_term === 'CREDIT');
      this.cdr.markForCheck();
    });
  }

  // ── Totales calculados ───────────────────────────────────────
  get totalDebt(): number {
    if (!this.agingData) return 0;
    return (this.agingData.current || 0)
         + (this.agingData.days_30 || 0)
         + (this.agingData.days_60 || 0)
         + (this.agingData.days_90 || 0)
         + (this.agingData.days_120_plus || 0);
  }

  get overdueDebt(): number {
    if (!this.agingData) return 0;
    return (this.agingData.days_30 || 0)
         + (this.agingData.days_60 || 0)
         + (this.agingData.days_90 || 0)
         + (this.agingData.days_120_plus || 0);
  }

  get overduePercent(): number {
    const total = this.totalDebt;
    return total > 0 ? (this.overdueDebt / total) * 100 : 0;
  }

  /** Porcentaje que representa un bucket sobre la deuda total (para barras). */
  bucketPercent(value: number): number {
    const total = this.totalDebt;
    return total > 0 ? (value / total) * 100 : 0;
  }

  loadClientData() {
    if (!this.selectedClient) {
      this.msg.add({ severity: 'warn', summary: 'Atención', detail: 'Seleccione un cliente primero.' });
      return;
    }

    this.http.get<any>(`${environment.apiUrl}/api/sales/accounts-receivable/client_aging_details/?client_id=${this.selectedClient.id}`)
      .subscribe(data => {
        this.agingData = data;
        this.cdr.markForCheck();
      });

    this.http.get<any>(`${environment.apiUrl}/api/sales/accounts-receivable/pending_by_client/?client_id=${this.selectedClient.id}`)
      .subscribe((res: any) => {
        const invoices = (res.invoices || []).map((i: any) => ({
          ...i,
          type: 'FACTURA',
          document: i.invoice_number || i.document_number,
          date: i.due_date,
          amount: i.total_amount
        }));

        const payments = (res.payments || []).map((p: any) => ({
          ...p,
          type: 'PAGO',
          document: p.reference,
          date: p.payment_date,
          amount: -p.amount
        }));

        this.subsidiaries = [...invoices, ...payments]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.cdr.markForCheck();
      });
  }

  printStatement() {
    if (!this.selectedClient) {
      this.msg.add({ severity: 'warn', summary: 'Atención', detail: 'Seleccione un cliente primero.' });
      return;
    }
    if (!this.startDate || !this.endDate) {
      this.msg.add({ severity: 'warn', summary: 'Atención', detail: 'Seleccione el rango de fechas.' });
      return;
    }
    if (this.startDate > this.endDate) {
      this.msg.add({ severity: 'error', summary: 'Rango inválido', detail: 'La fecha inicial no puede ser mayor que la final.' });
      return;
    }

    const fmt = (d: Date) => d.toISOString().split('T')[0];
    const url = `${environment.apiUrl}/api/accounting/reports/customer_statement/`
      + `?client_id=${this.selectedClient.id}`
      + `&start_date=${fmt(this.startDate)}`
      + `&end_date=${fmt(this.endDate)}`;

    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        const fileURL = window.URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      },
      error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el estado de cuenta.' })
    });
  }
}
