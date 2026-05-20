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
  templateUrl: './list-authorizations.html',
  providers: [MessageService]
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

  approve(id: number) {
    this.http.post(`${this.url}${id}/approve/`, {}).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Aprobado', detail: 'Documento autorizado' });
        // Refrescar tabla (lógica simplificada)
        window.location.reload(); 
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo aprobar' })
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
