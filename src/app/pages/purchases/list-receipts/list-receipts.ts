import { Component, inject, ViewChild, TemplateRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Customtable } from '@src/app/components/customTable/customtable';
import { GoodsReceiptListService } from '@src/app/services/goods-receipt-list.service';
import { GoodsReceiptService } from '@src/app/services/goods-receipt.service';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-list-receipts',
  standalone: true,
  imports: [CommonModule, CardModule, Customtable, RouterLink, ButtonModule, TooltipModule, ToastModule],
  templateUrl: './list-receipts.html'
})
export class ListReceiptsComponent implements OnInit {
  @ViewChild('recTable') table!: Customtable;
  public recService = inject(GoodsReceiptListService);
  private receiptService = inject(GoodsReceiptService);
  private router = inject(Router);
  
  cols = [
    { field: 'id', header: 'ID', filter: true },
    { field: 'supplier_name', header: 'Proveedor', filter: true },
    { field: 'order', header: 'OC ID', filter: true },
    { field: 'received_date', header: 'Fecha Recepción', filter: true },
    { field: 'total', header: 'Total', filter: true },
    { field: 'actions', header: 'Acciones' }
  ];

  ngOnInit() {
  }

  navigateToInvoice(receiptId: number) {
    this.router.navigate(['/purchases/bill/new'], { queryParams: { receiptId } });
  }

  downloadPdf(id: any) {
    this.receiptService.printReceiptPDF(id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RECEPCION_${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
