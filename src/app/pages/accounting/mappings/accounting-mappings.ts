import { Component, inject, OnInit, signal, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { Customtable } from '@src/app/components/customTable/customtable';
import { AccountingService } from '@src/app/services/accounting.service';
import { DocumentTypeService } from '@src/app/services/document-type.service';

@Component({
  selector: 'app-accounting-mappings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, DialogModule, InputTextModule, SelectModule, ToastModule, Customtable, TooltipModule],
  templateUrl: './accounting-mappings.html'
})
export class AccountingMappingsComponent implements OnInit {
  @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;
  private accountingService = inject(AccountingService);
  private docTypeService = inject(DocumentTypeService);
  private fb = inject(FormBuilder);
  private msg = inject(MessageService);

  displayModal = false;
  mappings = signal<any[]>([]);
  accounts = signal<any[]>([]);
  eventTypes = signal<any[]>([]);
  documentTypes = signal<any[]>([]);
  
  cols = [
    { field: 'event_type_display', header: 'Evento' },
    { field: 'document_type_name', header: 'Tipo Documento' },
    { field: 'account_code', header: 'Cód. Cuenta' },
    { field: 'account_name', header: 'Cuenta Contable' },
    { field: 'description', header: 'Descripción' },
    { field: 'actions', header: 'Acciones' }
  ];

  form: FormGroup = this.fb.group({
    id: [null],
    event_type: ['', Validators.required],
    document_type: [null],
    account: [null, Validators.required],
    description: ['']
  });

  loaderFunction = (params: any) => this.accountingService.getMappings(params);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // We don't need to manually load data here anymore if using loaderFunction
    // But keeping it for other non-table data
    this.accountingService.getAccounts({rows: 1000}).subscribe(a => this.accounts.set(a.results || a));
    this.accountingService.getEventTypes().subscribe(e => this.eventTypes.set(e));
    this.docTypeService.getDocumentTypes({is_active: true}).subscribe(d => this.documentTypes.set(d.results || d));
  }

  openNew() {
    this.form.reset();
    this.displayModal = true;
  }

  editMapping(row: any) {
    this.form.patchValue({
      id: row.id,
      event_type: row.event_type,
      document_type: row.document_type ? this.documentTypes().find(d => d.id === row.document_type) : null,
      account: this.accounts().find(a => a.id === row.account),
      description: row.description
    });
    this.displayModal = true;
  }

  save() {
    if (this.form.invalid) return;

    const data = { ...this.form.value };
    data.account = data.account.id;
    data.document_type = data.document_type ? data.document_type.id : null;

    if (data.id) {
      this.accountingService.updateMapping(data.id, data).subscribe({
        next: () => {
          this.msg.add({ severity: 'success', summary: 'Actualizado' });
          this.displayModal = false;
          this.loadData();
        },
        error: (err) => this.msg.add({ severity: 'error', summary: 'Error', detail: err.error.error || 'Error al actualizar' })
      });
    } else {
      this.accountingService.createMapping(data).subscribe({
        next: () => {
          this.msg.add({ severity: 'success', summary: 'Creado' });
          this.displayModal = false;
          this.loadData();
        },
        error: (err) => this.msg.add({ severity: 'error', summary: 'Error', detail: err.error.error || 'Error al crear' })
      });
    }
  }

  deleteMapping(id: number) {
    this.accountingService.deleteMapping(id).subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'Eliminado' });
        this.loadData();
      }
    });
  }
}
