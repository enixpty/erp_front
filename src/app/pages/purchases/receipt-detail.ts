import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { GoodsReceiptService } from '@src/app/services/goods-receipt.service';

@Component({
  selector: 'app-receipt-detail',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TableModule, RouterLink, ToastModule],
  providers: [MessageService],
  templateUrl: './receipt-detail.html'
})
export class ReceiptDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private receiptService = inject(GoodsReceiptService);
  receipt = signal<any>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
        this.receiptService.getReceiptById(id).subscribe(r => this.receipt.set(r));
    }
  }

  printPDF() {
    const id = this.receipt().id;
    this.receiptService.printReceiptPDF(id).subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        window.open(url);
    });
  }
}
