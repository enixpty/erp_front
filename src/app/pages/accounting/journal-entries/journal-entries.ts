import { Component, inject, signal, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { Customtable } from '@src/app/components/customTable/customtable';
import { AccountingService } from '@src/app/services/accounting.service';

@Component({
  selector: 'app-journal-entries',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CardModule, ButtonModule,
            ToastModule, TooltipModule, Customtable, InputTextModule,
            DatePickerModule, SelectModule],
  providers: [MessageService],
  templateUrl: './journal-entries.html'
})
export class JournalEntriesComponent implements OnInit {
  @ViewChild('statusTemplate') statusTemplate!: TemplateRef<any>;
  public accountingService = inject(AccountingService);
  private msg = inject(MessageService);
  private route = inject(ActivatedRoute);

  // Filtros
  filterStart: Date | null = null;
  filterEnd: Date   | null = null;
  filterRef: string       = '';
  filterStatus: string    = '';

  statusOptions = [
    { label: 'Todos',     value: '' },
    { label: 'Borrador',  value: 'DRAFT' },
    { label: 'Asentado',  value: 'POSTED' },
    { label: 'Anulado',   value: 'CANCELLED' },
  ];

  cols = [
    { field: 'id',          header: 'ID',          filter: false },
    { field: 'date',        header: 'Fecha',        filter: false },
    { field: 'description', header: 'Descripción',  filter: true  },
    { field: 'reference',   header: 'Referencia',   filter: true  },
    { field: 'status',      header: 'Estado',       filter: false },
    { field: 'action',      header: 'Acciones' }
  ];

  columnTemplates: any = {};

  activeParams = signal<any>({});

  loaderFunction = (params: any) =>
    this.accountingService.getJournalEntries({ ...params, ...this.activeParams() });

  ngOnInit() {
    this.columnTemplates = { 'status': this.statusTemplate };

    // Permite llegar pre-filtrado desde otra pantalla (ej: Periodos Fiscales → ver borradores)
    const status = this.route.snapshot.queryParamMap.get('status');
    if (status) {
      this.filterStatus = status;
      this.applyFilters();
    }
  }

  applyFilters() {
    const fmt = (d: Date | null) => d ? d.toISOString().split('T')[0] : undefined;
    const p: any = {};
    if (this.filterStart)  p.start_date = fmt(this.filterStart);
    if (this.filterEnd)    p.end_date   = fmt(this.filterEnd);
    if (this.filterRef)    p.reference  = this.filterRef;
    if (this.filterStatus) p.status     = this.filterStatus;
    this.activeParams.set(p);
  }

  clearFilters() {
    this.filterStart = null;
    this.filterEnd   = null;
    this.filterRef   = '';
    this.filterStatus = '';
    this.activeParams.set({});
  }

  postEntry(id: number) {
    this.accountingService.postJournalEntry(id).subscribe({
      next: (res: any) => {
        this.msg.add({ severity: 'success', summary: 'Asentado', detail: res.message });
        this.applyFilters();
      },
      error: (err) => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'No se pudo asentar' });
      }
    });
  }
}
