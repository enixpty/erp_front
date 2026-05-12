import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Customtable } from '@src/app/components/customTable/customtable';
import { DebitNoteService } from '@src/app/services/debit-note.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-list-debit-note',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, Customtable, RouterLink],
  templateUrl: './list-debit-note.html'
})
export class ListDebitNoteComponent {
  private debitNoteService = inject(DebitNoteService);

  cols = [
    { field: 'note_number', header: 'No. Nota' },
    { field: 'invoice', header: 'ID Factura' },
    { field: 'amount', header: 'Monto' },
    { field: 'reason', header: 'Motivo' },
    { field: 'created', header: 'Fecha' }
  ];

  loadDebitNotes = (params: any) => this.debitNoteService.getDebitNotes(params);
}
