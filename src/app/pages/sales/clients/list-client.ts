import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Customtable } from '@src/app/components/customTable/customtable';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ClientService } from '@src/app/services/client.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-list-client',
  standalone: true,
  imports: [CommonModule, Customtable, ButtonModule, CardModule, RouterLink, ToastModule],
  templateUrl: './list-client.html',
  providers: [MessageService]
})
export class ListClientComponent {
  @ViewChild(Customtable) customTable!: Customtable;
  private clientService = inject(ClientService);
  private messageService = inject(MessageService);

  cols = [
    { field: 'id', header: 'ID' },
    { field: 'identification', header: 'Identificación' },
    { field: 'first_name', header: 'Nombre' },
    { field: 'parent_name', header: 'Principal' },
    { field: 'email', header: 'Correo' },
    { field: 'phone', header: 'Teléfono' },
    { field: 'client_type_name', header: 'Tipo' },
    { field: 'payment_term_name', header: 'Término de Pago' },
    { field: 'credit_days', header: 'Días' },
    { field: 'status_name', header: 'Estado' },
    { field: 'action', header: 'Acciones' }
  ];

  loadClients = (params: any) => this.clientService.getClients(params);

  deleteClient(id: number) {
    if(confirm('¿Seguro que desea eliminar este cliente?')) {
        this.clientService.deleteClient(id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente eliminado' });
                this.customTable.onRefresh();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el cliente' });
            }
        });
    }
  }
}
