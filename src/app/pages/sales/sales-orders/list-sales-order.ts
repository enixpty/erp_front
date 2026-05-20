import { Component, inject, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Customtable } from '@src/app/components/customTable/customtable';
import { SalesOrderService } from '@src/app/services/sales-order.service';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-list-sales-order',
  standalone: true,
  imports: [CommonModule, Customtable, ButtonModule, RouterLink, CardModule, ConfirmDialogModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './list-sales-order.html'
})
export class ListSalesOrderComponent {
  private salesOrderService = inject(SalesOrderService);
  private confirmationService = inject(ConfirmationService);
  private msg = inject(MessageService);

  columns = [
    { field: 'document_number', header: 'Documento', filter: true, filterType: 'text' },
    { field: 'client_name', header: 'Cliente', filter: true, filterType: 'text' },
    { field: 'date', header: 'Fecha de Confirmación', filter: true, filterType: 'date' },
    { field: 'status_display', header: 'Estado', filter: true, filterType: 'text' },
    { field: 'total', header: 'Total', filter: true, filterType: 'number', isCurrency: true },
    { field: 'action', header: 'Acciones' }
  ];

  loaderFunction = (params: any) => this.salesOrderService.getSalesOrders(params);

  @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;

  cancelOrder(order: any) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de anular el pedido ${order.document_number}?`,
      header: 'Confirmar Anulación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.salesOrderService.cancelOrder(order.id, 'Anulado por usuario').subscribe({
          next: () => {
            this.msg.add({ severity: 'success', summary: 'Éxito', detail: 'Pedido anulado' });
            // Forzar actualización de tabla...
          },
          error: (err) => this.msg.add({ severity: 'error', summary: 'Error', detail: err.error.error })
        });
      }
    });
  }

  generateInvoice(order: any) {
    console.log('Generando factura para:', order.document_number);
  }

  printOrder(order: any) {
    this.salesOrderService.printOrder(order.id).subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
    });
  }

  sendEmail(order: any) {
    console.log('Enviando email para pedido:', order.document_number);
  }
}
