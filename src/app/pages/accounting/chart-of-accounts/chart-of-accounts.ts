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
  providers: [MessageService],
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
    { field: 'is_selectable', header: 'Posteable' }
  ];

  form: FormGroup = this.fb.group({
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

  ngOnInit() {
    this.accountingService.getAccounts({rows: 1000}).subscribe(a => this.accounts.set(a.results));
  }

  loadDefaults() {
    this.accountingService.loadDefaultAccounts().subscribe({
      next: (res: any) => {
        this.msg.add({ severity: 'success', summary: 'Éxito', detail: res.message });
        window.location.reload();
      },
      error: (err) => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'No se pudo cargar el catálogo' });
      }
    });
  }

  openNewAccount() {
    this.form.reset({ account_type: 'ASSET', balance_type: 'DEBIT', is_selectable: true });
    this.displayModal = true;
  }

  saveAccount() {
    if (this.form.invalid) return;

    const data = { ...this.form.value };
    if (data.parent) data.parent = data.parent.id;

    this.accountingService.createAccount(data).subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'Creado' });
        this.displayModal = false;
        window.location.reload();
      },
      error: (err) => this.msg.add({ severity: 'error', summary: 'Error', detail: err.error.error || 'Error al crear cuenta' })
    });
  }
}
