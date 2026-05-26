import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Customtable } from '@src/app/components/customTable/customtable';
import { DebitNoteService } from '@src/app/services/debit-note.service';
import { RouterLink } from '@angular/router';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-list-debit-note',
  standalone: true,
  imports: [CommonModule, Customtable, CardModule, ButtonModule, RouterLink, ToastModule],
  templateUrl: './list-debit-note.html'
})
export class ListDebitNoteComponent {
  private debitNoteService = inject(DebitNoteService);

  cols = [
    { field: 'note_number', header: 'N° Nota' },
    { field: 'invoice_number', header: 'Factura Rel.' },
    { field: 'amount', header: 'Monto' },
    { field: 'reason', header: 'Motivo' },
    { field: 'action', header: 'Acciones' }
  ];

  loadDebitNotes = (params: any) => this.debitNoteService.getDebitNotes(params);

  printDebitNote(id: number) {
    this.debitNoteService.printDebitNote(id).subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
    });
  }
}
