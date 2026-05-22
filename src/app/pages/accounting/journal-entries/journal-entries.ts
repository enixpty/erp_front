import { Component, inject, signal, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { Customtable } from '@src/app/components/customTable/customtable';
import { AccountingService } from '@src/app/services/accounting.service';

@Component({
  selector: 'app-journal-entries',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, ToastModule, TooltipModule, Customtable],
  providers: [MessageService],
  templateUrl: './journal-entries.html'
})
export class JournalEntriesComponent implements OnInit {
  @ViewChild('statusTemplate') statusTemplate!: TemplateRef<any>;
  public accountingService = inject(AccountingService);
  private msg = inject(MessageService);

  cols = [
    { field: 'id', header: 'ID' },
    { field: 'date', header: 'Fecha' },
    { field: 'description', header: 'Descripción' },
    { field: 'reference', header: 'Referencia' },
    { field: 'status', header: 'Estado' },
    { field: 'action', header: 'Acciones' }
  ];

  columnTemplates: any = {};

  ngOnInit() {
    this.columnTemplates = { 'status': this.statusTemplate };
  }

  postEntry(id: number) {
    this.accountingService.postJournalEntry(id).subscribe({
      next: (res: any) => {
        this.msg.add({ severity: 'success', summary: 'Asentado', detail: res.message });
        window.location.reload();
      },
      error: (err) => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'No se pudo asentar el asiento' });
      }
    });
  }
}
