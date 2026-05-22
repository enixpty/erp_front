import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AccountingService } from '@src/app/services/accounting.service';

@Component({
  selector: 'app-financial-reports',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, ProgressSpinnerModule],
  templateUrl: './financial-reports.html'
})
export class FinancialReportsComponent implements OnInit {
  private accountingService = inject(AccountingService);
  
  incomeStatement = signal<any>(null);
  balanceSheet = signal<any>(null);
  isLoading = signal<boolean>(false);

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.isLoading.set(true);
    this.accountingService.getIncomeStatement({}).subscribe({
      next: (data) => {
        this.incomeStatement.set(data);
        this.accountingService.getBalanceSheet({}).subscribe({
          next: (bsData) => {
            this.balanceSheet.set(bsData);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false)
        });
      },
      error: () => this.isLoading.set(false)
    });
  }
}
