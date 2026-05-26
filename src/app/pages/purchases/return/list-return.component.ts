import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Customtable } from '@src/app/components/customTable/customtable';
import { VendorReturnService } from '@src/app/services/vendor-return.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { RouterLink } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-list-return',
  standalone: true,
  imports: [CommonModule, Customtable, ButtonModule, CardModule, RouterLink, ToastModule],
  templateUrl: './list-return.html'
})
export class ListReturnComponent {
  private returnService = inject(VendorReturnService);
  
  cols = [
    { field: 'id', header: 'ID', filter: true },
    { field: 'receipt', header: 'ID Recepción', filter: true },
    { field: 'reason', header: 'Motivo' , filter: true},
    { field: 'return_date', header: 'Fecha' , filter: true},
    { field: 'action', header: 'Acciones' }
  ];

  loadReturns = (params: any) => this.returnService.getReturns(params);

  printReturn(id: number) {
    this.returnService.printReturn(id).subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
    });
  }
}
