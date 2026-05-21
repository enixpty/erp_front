import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { Select } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { HttpClient } from '@angular/common/http';
import { ClientService } from '@src/app/services/client.service';
import { Customtable } from '@src/app/components/customTable/customtable';

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
    { field: 'invoice_number', header: 'Documento' },
    { field: 'client_name', header: 'Cliente' },
    { field: 'due_date', header: 'Fecha Venc.' },
    { field: 'total_amount', header: 'Monto' }
  ];

  ngOnInit() {
    this.clientService.getClients({}).subscribe(data => {
      this.clients = (data.results || data).filter((c: any) => c.payment_term === 'CREDIT');
      this.cdr.markForCheck();
    });
  }

  loadClientData() {
    if (!this.selectedClient) return;
    const API_URL = 'http://localhost:8000';

    this.http.get<any>(`${API_URL}/api/sales/accounts-receivable/client_aging_details/?client_id=${this.selectedClient.id}`)
      .subscribe(data => {
        this.agingData = data;
        this.cdr.markForCheck();
      });

    this.http.get<any[]>(`${API_URL}/api/sales/accounts-receivable/pending_by_client/?client_id=${this.selectedClient.id}`)
      .subscribe(data => {
        this.subsidiaries = data;
        this.cdr.markForCheck();
      });
  }
}
