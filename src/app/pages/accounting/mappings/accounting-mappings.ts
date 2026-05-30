import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { Customtable } from '@src/app/components/customTable/customtable';
import { AccountingService } from '@src/app/services/accounting.service';
import { DocumentTypeService } from '@src/app/services/document-type.service';

@Component({
  selector: 'app-accounting-mappings',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, CardModule, ButtonModule, DialogModule,
    InputTextModule, SelectModule, ToastModule, Customtable, TooltipModule,
    TagModule, DividerModule, SkeletonModule
  ],
  providers: [MessageService],
  templateUrl: './accounting-mappings.html'
})
export class AccountingMappingsComponent implements OnInit {
  private accountingService = inject(AccountingService);
  private docTypeService    = inject(DocumentTypeService);
  private fb                = inject(FormBuilder);
  private msg               = inject(MessageService);

  // ── Estado ──────────────────────────────────────────────────
  displayModal  = false;
  healthData    = signal<any>(null);
  healthLoading = signal<boolean>(true);
  accounts      = signal<any[]>([]);
  eventTypes    = signal<any[]>([]);
  documentTypes = signal<any[]>([]);

  form: FormGroup = this.fb.group({
    id:            [null],
    event_type:    ['',  Validators.required],
    document_type: [null],
    account:       [null, Validators.required],
    description:   ['']
  });

  // ── Tabla de mapeos ──────────────────────────────────────────
  cols = [
    { field: 'event_type_display', header: 'Evento' },
    { field: 'document_type_name', header: 'Tipo Doc.' },
    { field: 'account_code',       header: 'Código' },
    { field: 'account_name',       header: 'Cuenta Contable' },
    { field: 'actions',            header: '' }
  ];

  loaderFunction = (p: any) => this.accountingService.getMappings(p);

  // ── Inicialización ───────────────────────────────────────────
  ngOnInit() {
    this.loadHealth();
    this.loadCatalogs();
  }

  loadHealth() {
    this.healthLoading.set(true);
    this.accountingService.getHealthCheck().subscribe({
      next:  (d) => { this.healthData.set(d); this.healthLoading.set(false); },
      error: ()  => this.healthLoading.set(false)
    });
  }

  loadCatalogs() {
    this.accountingService.getAccounts({ rows: 1000 })
      .subscribe(a => this.accounts.set(a.results || a));
    this.accountingService.getEventTypes()
      .subscribe(e => this.eventTypes.set(e));
    this.docTypeService.getDocumentTypes({ is_active: true })
      .subscribe(d => this.documentTypes.set(d.results || d));
  }

  // ── Helpers de salud ─────────────────────────────────────────
  statusSeverity(s: string): 'success' | 'warn' | 'danger' {
    return s === 'ok' ? 'success' : s === 'warn' ? 'warn' : 'danger';
  }

  statusLabel(s: string, configured: number, total: number): string {
    if (s === 'ok')    return `Completo (${configured}/${total})`;
    if (s === 'warn')  return `Incompleto (${configured}/${total})`;
    return `Sin configurar (0/${total})`;
  }

  // ── Abrir diálogo ────────────────────────────────────────────
  openNew(presetEventKey?: string) {
    this.form.reset();
    if (presetEventKey) {
      this.form.get('event_type')?.setValue(presetEventKey);
    }
    this.displayModal = true;
  }

  editMapping(row: any) {
    this.form.patchValue({
      id:            row.id,
      event_type:    row.event_type,
      document_type: row.document_type
        ? this.documentTypes().find(d => d.id === row.document_type) ?? null
        : null,
      account:       this.accounts().find(a => a.id === row.account) ?? null,
      description:   row.description
    });
    this.displayModal = true;
  }

  // ── Guardar ──────────────────────────────────────────────────
  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const data: any = { ...this.form.value };
    data.account      = data.account?.id      ?? data.account;
    data.document_type = data.document_type?.id ?? null;

    const isEdit = !!data.id;
    const req$   = isEdit
      ? this.accountingService.updateMapping(data.id, data)
      : this.accountingService.createMapping(data);

    req$.subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: isEdit ? 'Actualizado' : 'Creado',
          detail: 'Configuración guardada correctamente.' });
        this.displayModal = false;
        this.loadHealth();
      },
      error: (err) => this.msg.add({
        severity: 'error', summary: 'Error',
        detail: err.error?.error || 'No se pudo guardar.'
      })
    });
  }

  deleteMapping(id: number) {
    this.accountingService.deleteMapping(id).subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'Eliminado' });
        this.loadHealth();
      },
      error: (err) => this.msg.add({
        severity: 'error', summary: 'Error',
        detail: err.error?.error || 'No se pudo eliminar.'
      })
    });
  }
}
