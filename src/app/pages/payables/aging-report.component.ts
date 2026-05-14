import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AccountPayableService } from '@src/app/services/account-payable.service';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-debt-maturity',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, ButtonModule, RouterLink],
  templateUrl: './aging-report.html'
})
export class DebtMaturityComponent implements OnInit {
  private payablesService = inject(AccountPayableService);
  report = signal<any>(null);
  tableData = signal<any[]>([]);

  ngOnInit() {
    this.payablesService.getAgingReport().subscribe(res => {
      this.report.set(res);
      this.prepareTableData(res);
    });
  }

  prepareTableData(res: any) {
    const total = parseFloat(res.total_pending) || 1;
    const data = [
      { range: 'Corriente (Al día)', amount: parseFloat(res.current), percent: (parseFloat(res.current) / total) * 100 },
      { range: '1-30 Días Vencido', amount: parseFloat(res.overdue_1_30), percent: (parseFloat(res.overdue_1_30) / total) * 100 },
      { range: '31-60 Días Vencido', amount: parseFloat(res.overdue_31_60), percent: (parseFloat(res.overdue_31_60) / total) * 100 },
      { range: '61-90 Días Vencido', amount: parseFloat(res.overdue_61_90), percent: (parseFloat(res.overdue_61_90) / total) * 100 },
      { range: '90+ Días Vencido', amount: parseFloat(res.overdue_90_plus), percent: (parseFloat(res.overdue_90_plus) / total) * 100 },
    ];
    this.tableData.set(data);
  }
}
