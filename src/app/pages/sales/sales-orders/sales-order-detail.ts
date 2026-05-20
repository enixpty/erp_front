import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { SalesOrderService } from '@src/app/services/sales-order.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-sales-order-detail',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TableModule, DividerModule, RouterLink, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './sales-order-detail.html'
})
export class SalesOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private salesOrderService = inject(SalesOrderService);
  private confirmationService = inject(ConfirmationService);
  private msg = inject(MessageService);
  private cd = inject(ChangeDetectorRef);
  order: any;

  ngOnInit() {
    this.loadOrder();
  }

  loadOrder() {
    const id = this.route.snapshot.params['id'];
    this.salesOrderService.getSalesOrderById(Number(id)).subscribe(data => {
      this.order = data;
      this.cd.detectChanges();
    });
  }

  cancelOrder() {
    this.confirmationService.confirm({
      message: `¿Estás seguro de anular el pedido ${this.order.document_number}?`,
      header: 'Confirmar Anulación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.salesOrderService.cancelOrder(this.order.id, 'Anulado desde detalle').subscribe({
          next: () => {
            this.msg.add({ severity: 'success', summary: 'Éxito', detail: 'Pedido anulado' });
            this.loadOrder();
          },
          error: (err) => this.msg.add({ severity: 'error', summary: 'Error', detail: err.error.error || 'Error al anular' })
        });
      }
    });
  }

  generateInvoice() {
    this.confirmationService.confirm({
      message: `¿Desea generar la factura para el pedido ${this.order.document_number}? Esto descontará inventario físico.`,
      header: 'Confirmar Facturación',
      icon: 'pi pi-file-invoice',
      accept: () => {
        this.salesOrderService.createInvoice(this.order.id).subscribe({
          next: (res) => {
            this.msg.add({ 
              severity: 'success', 
              summary: 'Factura Generada', 
              detail: `Factura ${res.document_number} creada correctamente`,
              sticky: true 
            });
            this.loadOrder();
            // Redirigir al detalle de la factura después de un pequeño retraso
            setTimeout(() => {
              this.router.navigate(['/sales/invoices', res.invoice_id]);
            }, 2000);
          },
          error: (err) => this.msg.add({ severity: 'error', summary: 'Error', detail: err.error.error || 'Error al facturar' })
        });
      }
    });
  }
}
