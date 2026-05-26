import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Customtable } from '@src/app/components/customTable/customtable';
import { SalesInvoiceService } from '@src/app/services/sales-invoice.service';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-list-sales-invoice',
  standalone: true,
  imports: [CommonModule, Customtable, RouterLink, ButtonModule, CardModule, TagModule],
  templateUrl: './list-sales-invoice.html'
})
export class ListSalesInvoiceComponent implements OnInit {
  private invoiceService = inject(SalesInvoiceService);
  private cd = inject(ChangeDetectorRef);

  invoices = signal<any[]>([]);
  totalRecords = signal<number>(0);
  loading = signal<boolean>(false);

  columns = [
    { field: 'document_number', header: 'N° Factura', sortable: true, filter: true },
    { field: 'client_name', header: 'Cliente', sortable: true, filter: true },
    { field: 'date', header: 'Fecha', sortable: true, filter: true },
    { field: 'due_date', header: 'Vencimiento', sortable: true, filter: true },
    { field: 'total', header: 'Total', sortable: true, type: 'currency', filter: true },
    { field: 'status_display', header: 'Estado', sortable: true, template: 'status', filter: true },
    { field: 'actions', header: 'Acciones', template: 'actions' }
  ];

  ngOnInit() {
    this.loadInvoices({});
  }

  loadInvoices(params: any) {
    this.loading.set(true);
    this.invoiceService.getInvoices(params).subscribe({
      next: (res) => {
        this.invoices.set(res.results || res);
        this.totalRecords.set(res.count || (res.results ? res.results.length : res.length));
        this.loading.set(false);
        this.cd.detectChanges();
      },
      error: () => this.loading.set(false)
    });
  }

  getStatusSeverity(status: string) {
    switch (status) {
      case 'OPEN': return 'warn';
      case 'PAID': return 'success';
      case 'CANCELLED': return 'danger';
      default: return 'info';
    }
  }

  printInvoice(id: number) {
    this.invoiceService.printInvoice(id).subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
    });
  }
}
