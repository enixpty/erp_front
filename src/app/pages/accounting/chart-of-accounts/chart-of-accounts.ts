import { Component, inject, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Customtable } from '@src/app/components/customTable/customtable';
import { AccountingService } from '@src/app/services/accounting.service';

@Component({
  selector: 'app-chart-of-accounts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, DialogModule, InputTextModule, SelectModule, ToastModule, Customtable],
  templateUrl: './chart-of-accounts.html'
})
export class ChartOfAccountsComponent implements OnInit {
  @ViewChild('table') table!: Customtable;
  public accountingService = inject(AccountingService);
  private fb = inject(FormBuilder);
  private msg = inject(MessageService);

  displayModal = false;
  accounts = signal<any[]>([]);
  cols = [
    { field: 'code', header: 'Código' },
    { field: 'name', header: 'Nombre de la Cuenta' },
    { field: 'account_type', header: 'Tipo' },
    { field: 'balance_type', header: 'Saldo' },
    { field: 'is_selectable', header: 'Posteable' },
    { field: 'actions', header: 'Acciones' }
  ];

  form: FormGroup = this.fb.group({
    id: [null],
    code: ['', Validators.required],
    name: ['', Validators.required],
    account_type: ['ASSET', Validators.required],
    balance_type: ['DEBIT', Validators.required],
    parent: [null],
    is_selectable: [true]
  });

  accountTypes = [
    { label: 'Activo', value: 'ASSET' },
    { label: 'Pasivo', value: 'LIABILITY' },
    { label: 'Patrimonio', value: 'EQUITY' },
    { label: 'Ingreso', value: 'REVENUE' },
    { label: 'Gasto', value: 'EXPENSE' }
  ];

  balanceTypes = [
    { label: 'Deudor', value: 'DEBIT' },
    { label: 'Acreedor', value: 'CREDIT' }
  ];

  // ... (accountTypes, balanceTypes kept)

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.accountingService.getAccounts({rows: 1000}).subscribe(a => this.accounts.set(a.results));
  }

  loadDefaults() {
    this.accountingService.loadDefaultAccounts().subscribe({
      next: (res: any) => {
        this.msg.add({ severity: 'success', summary: 'Éxito', detail: res.message });
        this.loadData();
      },
      error: (err) => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'No se pudo cargar el catálogo' });
      }
    });
  }

  openNewAccount() {
    this.form.reset({ id: null, account_type: 'ASSET', balance_type: 'DEBIT', is_selectable: true });
    this.displayModal = true;
  }

  editAccount(row: any) {
    this.form.patchValue({
      id: row.id,
      code: row.code,
      name: row.name,
      account_type: row.account_type,
      balance_type: row.balance_type,
      parent: row.parent,
      is_selectable: row.is_selectable
    });
    this.displayModal = true;
  }

  deleteAccount(id: number) {
    if (confirm('¿Está seguro de eliminar esta cuenta?')) {
      this.accountingService.deleteAccount(id).subscribe({
        next: () => {
          this.msg.add({ severity: 'success', summary: 'Eliminado' });
          this.loadData();
        },
        error: (err) => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se puede eliminar la cuenta, puede tener movimientos asociados.' })
      });
    }
  }

  saveAccount() {
    if (this.form.invalid) return;

    const data = { ...this.form.value };
    if (data.parent) data.parent = data.parent.id;

    const request$ = data.id 
      ? this.accountingService.updateAccount(data.id, data) 
      : this.accountingService.createAccount(data);

    request$.subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: data.id ? 'Actualizado' : 'Creado' });
        this.displayModal = false;
        this.loadData();
      },
      error: (err) => this.msg.add({ severity: 'error', summary: 'Error', detail: err.error.error || 'Error al guardar' })
    });
  }
}
