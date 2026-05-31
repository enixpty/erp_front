import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AccountPayableService } from '@src/app/services/account-payable.service';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-debt-maturity',
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
export class DebtMaturityComponent implements OnInit {
  private payablesService = inject(AccountPayableService);
  
  report = signal<any>(null);
  tableData = signal<any[]>([]);

  ngOnInit() {
    this.loadData();
  }

  // ── Totales calculados para el encabezado de salud ───────────
  get totalDebt(): number {
    const r = this.report();
    if (!r) return 0;
    return parseFloat(r.total_pending) || 0;
  }

  get currentDebt(): number {
    const r = this.report();
    return r ? (Number(r.current?.total) || 0) : 0;
  }

  get overdueDebt(): number {
    const r = this.report();
    if (!r) return 0;
    return (Number(r.overdue_1_30?.total) || 0)
         + (Number(r.overdue_31_60?.total) || 0)
         + (Number(r.overdue_61_90?.total) || 0)
         + (Number(r.overdue_90_plus?.total) || 0);
  }

  get overduePercent(): number {
    const total = this.totalDebt;
    return total > 0 ? (this.overdueDebt / total) * 100 : 0;
  }

  loadData() {
    this.payablesService.getAgingReport().subscribe({
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
      { id: '1', range: 'Corriente (Al día)', amount: res.current?.total || 0, providers: res.current?.providers || [], percent: ((res.current?.total || 0) / total) * 100 },
      { id: '2', range: '1-30 Días Vencido', amount: res.overdue_1_30?.total || 0, providers: res.overdue_1_30?.providers || [], percent: ((res.overdue_1_30?.total || 0) / total) * 100 },
      { id: '3', range: '31-60 Días Vencido', amount: res.overdue_31_60?.total || 0, providers: res.overdue_31_60?.providers || [], percent: ((res.overdue_31_60?.total || 0) / total) * 100 },
      { id: '4', range: '61-90 Días Vencido', amount: res.overdue_61_90?.total || 0, providers: res.overdue_61_90?.providers || [], percent: ((res.overdue_61_90?.total || 0) / total) * 100 },
      { id: '5', range: '90+ Días Vencido', amount: res.overdue_90_plus?.total || 0, providers: res.overdue_90_plus?.providers || [], percent: ((res.overdue_90_plus?.total || 0) / total) * 100 },
    ];
    this.tableData.set(data);
  }
}
