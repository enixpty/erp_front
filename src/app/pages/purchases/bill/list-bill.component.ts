import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Customtable } from '@src/app/components/customTable/customtable';
import { VendorInvoiceService } from '@src/app/services/vendor-invoice.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-list-bill',
  standalone: true,
  imports: [CommonModule, Customtable, ButtonModule, CardModule, RouterLink],
  templateUrl: './list-bill.html'
})
export class ListBillComponent {
  private invoiceService = inject(VendorInvoiceService);
  
  cols = [
    { field: 'id', header: 'ID' },
    { field: 'invoice_number', header: 'Número Factura' },
    { field: 'invoice_date', header: 'Fecha' },
    { field: 'supplier_name', header: 'Proveedor' },
    { field: 'total_amount', header: 'Total' },
    { field: 'status', header: 'Estado' },
    { field: 'action', header: 'Acciones' }
  ];

  loadInvoices = (params: any) => this.invoiceService.getInvoices(params);

  changeStatus(invoice: any, status: string) {
    console.log('Cambiando estado de factura:', invoice.id, 'a:', status);
    this.invoiceService.changeStatus(invoice.id, status).subscribe({
      next: () => {
        console.log('Estado actualizado con éxito');
        // Aquí forzamos la actualización. Como no tenemos acceso directo a dt,
        // una forma rápida es recargar la página o disparar una recarga del servicio.
        window.location.reload();
      },
      error: (err) => console.error('Error al cambiar estado:', err)
    });
  }

  printPDF(id: number) {
    this.invoiceService.downloadInvoicePDF(id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    });
  }
}
