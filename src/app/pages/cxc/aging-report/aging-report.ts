import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AccountReceivableService } from '@src/app/services/account-receivable.service';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-aging-report',
  standalone: true,
  imports: [
    CommonModule, 
    CardModule, 
    TableModule, 
    ButtonModule, 
    RouterLink, 
    AccordionModule
  ],
  templateUrl: './aging-report.html'
})
export class AgingReportComponent implements OnInit {
  private arService = inject(AccountReceivableService);
  
  report = signal<any>(null);
  tableData = signal<any[]>([]);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.arService.getAgingReport().subscribe({
      next: (res) => {
        this.report.set(res);
        this.prepareTableData(res);
      },
      error: (err) => console.error('Error al cargar datos:', err)
    });
  }

  prepareTableData(res: any) {
    const total = parseFloat(res.total_pending) || 1;
    const data = [
      { id: '1', range: 'Corriente (Al día)', amount: res.current?.total || 0, clients: res.current?.clients || [], percent: ((res.current?.total || 0) / total) * 100 },
      { id: '2', range: '1-30 Días Vencido', amount: res.overdue_1_30?.total || 0, clients: res.overdue_1_30?.clients || [], percent: ((res.overdue_1_30?.total || 0) / total) * 100 },
      { id: '3', range: '31-60 Días Vencido', amount: res.overdue_31_60?.total || 0, clients: res.overdue_31_60?.clients || [], percent: ((res.overdue_31_60?.total || 0) / total) * 100 },
      { id: '4', range: '61-90 Días Vencido', amount: res.overdue_61_90?.total || 0, clients: res.overdue_61_90?.clients || [], percent: ((res.overdue_61_90?.total || 0) / total) * 100 },
      { id: '5', range: '90+ Días Vencido', amount: res.overdue_90_plus?.total || 0, clients: res.overdue_90_plus?.clients || [], percent: ((res.overdue_90_plus?.total || 0) / total) * 100 },
    ];
    this.tableData.set(data);
  }
}
