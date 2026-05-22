import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { StockService } from '@src/app/services/stock.service';

@Component({
  selector: 'app-valuation-report',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, ButtonModule, ProgressBarModule],
  templateUrl: './valuation-report.html'
})
export class ValuationReportComponent implements OnInit {
  private stockService = inject(StockService);
  private cdr = inject(ChangeDetectorRef);

  report: any = null;
  loading: boolean = false;

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.loading = true;
    this.stockService.getValuation().subscribe({
      next: (data) => {
        this.report = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
