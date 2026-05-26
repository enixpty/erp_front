import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Customtable } from '@src/app/components/customTable/customtable';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { QuotationService } from '@src/app/services/quotation.service';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-list-quotation',
  standalone: true,
  imports: [CommonModule, Customtable, ButtonModule, CardModule, RouterLink, Toast],
  templateUrl: './list-quotation.html'
})
export class ListQuotationComponent {
  @ViewChild(Customtable) customTable!: Customtable;
  private quotationService = inject(QuotationService);
  private messageService = inject(MessageService);

  cols = [
    { field: 'document_number', header: 'N° Cotización' , filter: true},
    { field: 'client_name', header: 'Cliente', filter: true },
    { field: 'date', header: 'Fecha' },
    { field: 'expiration_date', header: 'Vence', filter: true },
    { field: 'total', header: 'Total' , filter: true},
    { field: 'status_display', header: 'Estado' , filter: true},
    { field: 'action', header: 'Acciones' }
  ];

  loadQuotations = (params: any) => this.quotationService.getQuotations(params);

  deleteQuotation(id: number) {
    if(confirm('¿Seguro que desea eliminar esta cotización?')) {
        this.quotationService.deleteQuotation(id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cotización eliminada' });
                this.customTable.onRefresh();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la cotización' });
            }
        });
    }
  }
}
