import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Customtable } from '@src/app/components/customTable/customtable';
import { StockMovementService } from '@src/app/services/stock-movement.service';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-list-movements',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, ToastModule, Customtable, TagModule],
  providers: [MessageService],
  templateUrl: './list-movements.html'
})
export class ListMovementsComponent implements OnInit {
  private movementService = inject(StockMovementService);
  private msg = inject(MessageService);

  movements = signal<any[]>([]);
  isExporting = signal<boolean>(false);

  cols = [
    { field: 'created', header: 'Fecha', filter: true },
    { field: 'sku_code', header: 'SKU', filter: true },
    { field: 'sku_name', header: 'Descripción' , filter: true},
    { field: 'movement_type_name', header: 'Tipo' , filter: true},
    { field: 'quantity', header: 'Cantidad' , filter: true},
    { field: 'warehouse_source_name', header: 'Origen', filter: true },
    { field: 'warehouse_destination_name', header: 'Destino' , filter: true},
    { field: 'document_reference', header: 'Referencia' , filter: true}
  ];

  ngOnInit() {
    this.loadMovements({});
  }

  loadMovements(params: any) {
    this.movementService.getStockMovements(params).subscribe(res => {
        this.movements.set(res.results || res);
    });
  }

  getSeverity(direction: string) {
    switch (direction) {
      case 'IN': return 'success';
      case 'OUT': return 'danger';
      case 'TRANSFER': return 'info';
      default: return 'secondary';
    }
  }

  exportExcel() {
    this.isExporting.set(true);
    this.movementService.exportExcel().subscribe({
      next: (blob) => { this.downloadBlob(blob, 'Movimientos_Inventario.xlsx'); this.isExporting.set(false); },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo exportar.' });
        this.isExporting.set(false);
      }
    });
  }

  private downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

