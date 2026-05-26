import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { Select } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { HttpClient } from '@angular/common/http';
import { ClientService } from '@src/app/services/client.service';
import { Customtable } from '@src/app/components/customTable/customtable';
import { environment } from '@src/environments/environment';

@Component({
  selector: 'app-aging-monitor',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, Select, ButtonModule, Customtable],
  templateUrl: './aging-monitor.html'
})
export class AgingMonitorComponent implements OnInit {
  private http = inject(HttpClient);
  private clientService = inject(ClientService);
  private cdr = inject(ChangeDetectorRef);

  selectedClient: any = null;
  clients: any[] = [];
  agingData: any = null;
  subsidiaries: any[] = [];
  
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

  loadClientData() {
    if (!this.selectedClient) return;

    this.http.get<any>(`${environment.apiUrl}/api/sales/accounts-receivable/client_aging_details/?client_id=${this.selectedClient.id}`) 
      .subscribe(data => {
        this.agingData = data;
        this.cdr.markForCheck();
      });

    this.http.get<any>(`${environment.apiUrl}/api/sales/accounts-receivable/pending_by_client/?client_id=${this.selectedClient.id}`)  
      .subscribe((res: any) => {
        // Combinar facturas y pagos para mostrarlos en la tabla
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

        this.subsidiaries = [...invoices, ...payments].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.cdr.markForCheck();
      });
  }

  printStatement() {
    if (!this.selectedClient) return;
    const url = `${environment.apiUrl}/api/accounting/reports/customer_statement/?client_id=${this.selectedClient.id}&start_date=2026-01-01&end_date=2026-12-31`;
    
    this.http.get(url, { responseType: 'blob' }).subscribe((blob: Blob) => {
        const fileURL = window.URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
    });
  }
}
