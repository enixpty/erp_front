import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { AccountingService } from '@src/app/services/accounting.service';

@Component({
  selector: 'app-chart-of-accounts',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    CardModule, ButtonModule, DialogModule, InputTextModule,
    SelectModule, ToastModule, TagModule, TooltipModule, TreeTableModule
  ],
  providers: [MessageService],
  templateUrl: './chart-of-accounts.html'
})
export class ChartOfAccountsComponent implements OnInit {
  private accountingService = inject(AccountingService);
  private fb  = inject(FormBuilder);
  private msg = inject(MessageService);

  allAccounts  = signal<any[]>([]);
  treeData     = signal<TreeNode[]>([]);
  displayModal = false;
  filterText   = '';

  form: FormGroup = this.fb.group({
    id:           [null],
    code:         ['', Validators.required],
    name:         ['', Validators.required],
    account_type: ['ASSET', Validators.required],
    balance_type: ['DEBIT', Validators.required],
    parent:       [null],
    is_selectable:[true]
  });

  accountTypes = [
    { label: 'Activo',     value: 'ASSET',     color: 'info' },
    { label: 'Pasivo',     value: 'LIABILITY',  color: 'warn' },
    { label: 'Patrimonio', value: 'EQUITY',     color: 'secondary' },
    { label: 'Ingreso',    value: 'REVENUE',    color: 'success' },
    { label: 'Gasto',      value: 'EXPENSE',    color: 'danger' },
  ];

  balanceTypes = [
    { label: 'Deudor (Débito)',    value: 'DEBIT' },
    { label: 'Acreedor (Crédito)', value: 'CREDIT' },
  ];

  ngOnInit() { this.loadData(); }

  loadData() {
    this.accountingService.getAccounts({ rows: 1000 }).subscribe(res => {
      const list = (res.results || res).sort((a: any, b: any) =>
        a.code.localeCompare(b.code, undefined, { numeric: true })
      );
      this.allAccounts.set(list);
      this.treeData.set(this.buildTree(list));
    });
  }

  // ── Conversión lista plana → árbol ──────────────────────────
  buildTree(accounts: any[], filter = ''): TreeNode[] {
    const term = filter.toLowerCase();
    const filtered = term
      ? accounts.filter(a =>
          a.code.toLowerCase().includes(term) ||
          a.name.toLowerCase().includes(term))
      : accounts;

    const map = new Map<number, TreeNode>();
    const roots: TreeNode[] = [];

    for (const acc of filtered) {
      map.set(acc.id, { data: acc, children: [], expanded: true });
    }
    for (const acc of filtered) {
      const node = map.get(acc.id)!;
      if (acc.parent && map.has(acc.parent)) {
        map.get(acc.parent)!.children!.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  applyFilter() {
    this.treeData.set(this.buildTree(this.allAccounts(), this.filterText));
  }

  clearFilter() {
    this.filterText = '';
    this.treeData.set(this.buildTree(this.allAccounts()));
  }

  // ── Helpers de tipo ─────────────────────────────────────────
  typeSeverity(t: string): 'info' | 'warn' | 'secondary' | 'success' | 'danger' {
    const m: any = { ASSET: 'info', LIABILITY: 'warn', EQUITY: 'secondary', REVENUE: 'success', EXPENSE: 'danger' };
    return m[t] ?? 'secondary';
  }

  typeLabel(t: string): string {
    const m: any = { ASSET: 'Activo', LIABILITY: 'Pasivo', EQUITY: 'Patrimonio', REVENUE: 'Ingreso', EXPENSE: 'Gasto' };
    return m[t] ?? t;
  }

  // ── Diálogo ─────────────────────────────────────────────────
  openNew(parentAccount?: any) {
    this.form.reset({ account_type: 'ASSET', balance_type: 'DEBIT', is_selectable: true });
    if (parentAccount) {
      this.form.patchValue({
        parent:       parentAccount,
        account_type: parentAccount.account_type,
        balance_type: parentAccount.balance_type,
      });
    }
    this.displayModal = true;
  }

  editAccount(row: any) {
    const parent = row.parent
      ? this.allAccounts().find(a => a.id === row.parent) ?? null
      : null;
    this.form.patchValue({
      id:           row.id,
      code:         row.code,
      name:         row.name,
      account_type: row.account_type,
      balance_type: row.balance_type,
      parent,
      is_selectable: row.is_selectable,
    });
    this.displayModal = true;
  }

  saveAccount() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const data = { ...this.form.value };
    if (data.parent) data.parent = data.parent.id;

    const isEdit  = !!data.id;
    const request = isEdit
      ? this.accountingService.updateAccount(data.id, data)
      : this.accountingService.createAccount(data);

    request.subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: isEdit ? 'Actualizado' : 'Creado',
          detail: `Cuenta "${data.name}" guardada.` });
        this.displayModal = false;
        this.loadData();
      },
      error: (err) => this.msg.add({
        severity: 'error', summary: 'Error',
        detail: err.error?.error || 'No se pudo guardar la cuenta.'
      })
    });
  }

  deleteAccount(id: number, name: string) {
    this.accountingService.deleteAccount(id).subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'Eliminado', detail: `Cuenta "${name}" eliminada.` });
        this.loadData();
      },
      error: () => this.msg.add({
        severity: 'error', summary: 'Error',
        detail: 'No se puede eliminar — tiene movimientos o subcuentas asociadas.'
      })
    });
  }

  loadDefaults() {
    this.accountingService.loadDefaultAccounts().subscribe({
      next: (res: any) => {
        this.msg.add({ severity: 'success', summary: 'Catálogo cargado', detail: res.message });
        this.loadData();
      },
      error: (err) => this.msg.add({
        severity: 'error', summary: 'Error',
        detail: err.error?.error || 'No se pudo cargar el catálogo.'
      })
    });
  }

  get selectableParents(): any[] {
    return this.allAccounts().filter(a => !a.is_selectable || a.level < 3);
  }
}
