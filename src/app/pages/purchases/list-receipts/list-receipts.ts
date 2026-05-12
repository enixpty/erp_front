import { Component, inject, ViewChild, TemplateRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Customtable } from '@src/app/components/customTable/customtable';
import { GoodsReceiptListService } from '@src/app/services/goods-receipt-list.service';

@Component({
  selector: 'app-list-receipts',
  standalone: true,
  imports: [CommonModule, CardModule, Customtable, RouterLink, ButtonModule, TooltipModule],
  templateUrl: './list-receipts.html'
})
export class ListReceiptsComponent implements OnInit {
  @ViewChild('recTable') table!: Customtable;
  public recService = inject(GoodsReceiptListService);
  
  cols = [
    { field: 'id', header: 'ID' },
    { field: 'supplier_name', header: 'Proveedor' },
    { field: 'order', header: 'OC ID' },
    { field: 'received_date', header: 'Fecha Recepción' },
    { field: 'total', header: 'Total' },
    { field: 'action', header: 'Acciones' }
  ];

  ngOnInit() {
  }
}
