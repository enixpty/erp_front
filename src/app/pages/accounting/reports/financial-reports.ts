import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { AccountingService } from '@src/app/services/accounting.service';

@Component({
  selector: 'app-financial-reports',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CardModule, ButtonModule, TableModule,
            DatePickerModule, DividerModule, TagModule, SkeletonModule, TooltipModule],
  templateUrl: './financial-reports.html'
})
export class FinancialReportsComponent implements OnInit {
  private accountingService = inject(AccountingService);

  startDate: Date | null = null;
  endDate: Date   | null = null;

  incomeStatement = signal<any>(null);
  balanceSheet    = signal<any>(null);
  isLoading       = signal<boolean>(false);

  ngOnInit() {
    const now = new Date();
    this.startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    this.endDate   = new Date();
    this.loadReports();
  }

  loadReports() {
    this.isLoading.set(true);
    this.incomeStatement.set(null);
    this.balanceSheet.set(null);

    const fmt = (d: Date | null) => d ? d.toISOString().split('T')[0] : undefined;

    const isParams: any = {};
    if (this.startDate) isParams.start_date = fmt(this.startDate);
    if (this.endDate)   isParams.end_date   = fmt(this.endDate);

    const bsParams: any = {};
    if (this.endDate) bsParams.end_date = fmt(this.endDate);

    this.accountingService.getIncomeStatement(isParams).subscribe({
      next: (data) => {
        this.incomeStatement.set(data);
        this.accountingService.getBalanceSheet(bsParams).subscribe({
          next: (bs) => { this.balanceSheet.set(bs); this.isLoading.set(false); },
          error: ()  => this.isLoading.set(false)
        });
      },
      error: () => this.isLoading.set(false)
    });
  }

  isExporting = signal<boolean>(false);

  exportExcel() {
    this.isExporting.set(true);
    const fmt = (d: Date | null) => d ? d.toISOString().split('T')[0] : undefined;
    const params: any = {};
    if (this.startDate) params.start_date = fmt(this.startDate);
    if (this.endDate)   params.end_date   = fmt(this.endDate);

    this.accountingService.exportExcel(params).subscribe({
      next: (blob) => {
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        const name = `Reporte_Financiero_${params.end_date ?? 'completo'}.xlsx`;
        a.href     = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
        this.isExporting.set(false);
      },
      error: () => this.isExporting.set(false)
    });
  }

  isProfit(): boolean {
    return (this.incomeStatement()?.net_income ?? 0) >= 0;
  }

  isBalanced(): boolean {
    const bs = this.balanceSheet();
    if (!bs) return false;
    return Math.abs(bs.total_assets - bs.total_liabilities - bs.total_equity) < 0.05;
  }
}
