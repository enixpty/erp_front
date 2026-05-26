import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Customtable } from '@src/app/components/customTable/customtable';
import { CreditNoteService } from '@src/app/services/credit-note.service';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-list-credit-note',
  standalone: true,
  imports: [CommonModule, Customtable, RouterLink, ButtonModule, CardModule],
  templateUrl: './list-credit-note.html'
})
export class ListCreditNoteComponent {
  private creditNoteService = inject(CreditNoteService);
  
  columns = [
    { field: 'document_number', header: 'N° NC', sortable: true , filter: true},
    { field: 'invoice_number', header: 'Factura Ref.', sortable: true , filter: true},
    { field: 'date', header: 'Fecha', sortable: true , filter: true},
    { field: 'reason', header: 'Motivo', sortable: true , filter: true},
    { field: 'total', header: 'Total', sortable: true, type: 'currency', filter: true },
    { field: 'actions', header: 'Acciones', template: 'actions' }
  ];

  loadCreditNotes = (params: any) => this.creditNoteService.getCreditNotes(params);

  printCreditNote(id: number) {
    window.open(`/api/sales/credit-notes/${id}/print/`, '_blank');
  }
}
