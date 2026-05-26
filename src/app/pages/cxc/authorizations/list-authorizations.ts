import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Customtable } from '@src/app/components/customTable/customtable';
import { HttpClient } from '@angular/common/http';
import { environment } from '@src/environments/environment';

@Component({
  selector: 'app-list-authorizations',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, ToastModule, Customtable],
  templateUrl: './list-authorizations.html'
})
export class ListAuthorizationsComponent implements OnInit {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  private url = `${environment.apiUrl}/api/sales/authorizations/`;

  cols = [
    { field: 'document_type', header: 'Tipo Doc' },
    { field: 'document_id', header: 'ID Doc' },
    { field: 'requested_by_name', header: 'Solicitado por' },
    { field: 'reason', header: 'Motivo' },
    { field: 'status', header: 'Estado' },
    { field: 'action', header: 'Acciones' }
  ];

  ngOnInit() {}

  loadAuthorizations = (params: any) => this.http.get<any>(this.url, { params });

  approve(row: any) {
    const printWindow = row.document_type === 'INVOICE' ? window.open('', '_blank') : null;

    this.http.post(`${this.url}${row.id}/approve/`, {}).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Aprobado', detail: 'Documento autorizado' });
        
        if (row.document_type === 'INVOICE' && printWindow) {
            this.http.get(`${environment.apiUrl}/api/sales/sales-invoices/${row.document_id}/print/`, { responseType: 'blob' })
                .subscribe((blob: Blob) => {
                    const url = window.URL.createObjectURL(blob);
                    printWindow.location.href = url;
                    window.location.reload(); 
                });
        } else {
            window.location.reload(); 
        }
      },
      error: () => {
        if (printWindow) printWindow.close();
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo aprobar' });
      }
    });
  }


  reject(id: number) {
    this.http.post(`${this.url}${id}/reject/`, { comment: 'Rechazo administrativo' }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'info', summary: 'Rechazado', detail: 'Documento rechazado' });
        window.location.reload();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo rechazar' })
    });
  }
}
