import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { SalesInvoiceService } from '@src/app/services/sales-invoice.service';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-sales-invoice-detail',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TableModule, DividerModule, RouterLink, TagModule],
  templateUrl: './sales-invoice-detail.html'
})
export class SalesInvoiceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private invoiceService = inject(SalesInvoiceService);
  private cd = inject(ChangeDetectorRef);
  invoice: any;

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.invoiceService.getInvoiceById(Number(id)).subscribe(data => {
      this.invoice = data;
      this.cd.detectChanges();
    });
  }

  printInvoice() {
    if (!this.invoice) return;
    this.invoiceService.printInvoice(this.invoice.id).subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
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
}
