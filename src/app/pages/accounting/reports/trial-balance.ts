import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { AccountingService } from '@src/app/services/accounting.service';

@Component({
  selector: 'app-trial-balance',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, TableModule,
            DatePickerModule, TagModule, SelectModule, InputTextModule, TooltipModule],
  templateUrl: './trial-balance.html'
})
export class TrialBalanceComponent implements OnInit {
  private accountingService = inject(AccountingService);

  startDate: Date | null = null;
  endDate: Date   | null = null;

  data        = signal<any>(null);
  isLoading   = signal<boolean>(false);
  isExporting = signal<boolean>(false);

  filterText = '';
  typeFilter = '';

  typeOptions = [
    { label: 'Todos los tipos', value: '' },
    { label: 'Activo',     value: 'ASSET' },
    { label: 'Pasivo',     value: 'LIABILITY' },
    { label: 'Patrimonio', value: 'EQUITY' },
    { label: 'Ingreso',    value: 'REVENUE' },
    { label: 'Gasto',      value: 'EXPENSE' },
  ];

  ngOnInit() {
    const now = new Date();
    this.startDate = new Date(now.getFullYear(), 0, 1);
    this.endDate   = new Date();
    this.loadReport();
  }

  private buildParams() {
    const fmt = (d: Date | null) => d ? d.toISOString().split('T')[0] : undefined;
    const p: any = {};
    if (this.startDate) p.start_date = fmt(this.startDate);
    if (this.endDate)   p.end_date   = fmt(this.endDate);
    return p;
  }

  loadReport() {
    this.isLoading.set(true);
    this.data.set(null);
    this.accountingService.getTrialBalance(this.buildParams()).subscribe({
      next: (d) => { this.data.set(d); this.isLoading.set(false); },
      error: ()  => this.isLoading.set(false)
    });
  }

  get filteredAccounts(): any[] {
    const d = this.data();
    if (!d) return [];
    const term = this.filterText.toLowerCase();
    return d.accounts.filter((a: any) => {
      const matchText = !term ||
        a.code.toLowerCase().includes(term) ||
        a.name.toLowerCase().includes(term);
      const matchType = !this.typeFilter || a.account_type === this.typeFilter;
      return matchText && matchType;
    });
  }

  typeSeverity(t: string): 'info' | 'warn' | 'secondary' | 'success' | 'danger' {
    const m: any = { ASSET: 'info', LIABILITY: 'warn', EQUITY: 'secondary', REVENUE: 'success', EXPENSE: 'danger' };
    return m[t] ?? 'secondary';
  }

  exportExcel() {
    this.isExporting.set(true);
    this.accountingService.exportTrialBalanceExcel(this.buildParams()).subscribe({
      next: (blob) => {
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        const end  = this.endDate ? this.endDate.toISOString().split('T')[0] : 'completo';
        a.href     = url;
        a.download = `Balance_Comprobacion_${end}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        this.isExporting.set(false);
      },
      error: () => this.isExporting.set(false)
    });
  }
}
