import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Customtable } from '@src/app/components/customTable/customtable';
import { StockMovementService } from '@src/app/services/stock-movement.service';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-list-movements',
  standalone: true,
  imports: [CommonModule, CardModule, Customtable, TagModule],
  templateUrl: './list-movements.html'
})
export class ListMovementsComponent {
  public movementService = inject(StockMovementService);

  cols = [
    { field: 'created', header: 'Fecha' },
    { field: 'sku_code', header: 'SKU' },
    { field: 'sku_name', header: 'Descripción' },
    { field: 'movement_type_name', header: 'Tipo' },
    { field: 'quantity', header: 'Cantidad' },
    { field: 'warehouse_source_name', header: 'Origen' },
    { field: 'warehouse_destination_name', header: 'Destino' },
    { field: 'document_reference', header: 'Referencia' }
  ];

  loadMovements = (params: any) => this.movementService.getStockMovements(params);

  getSeverity(direction: string) {
    switch (direction) {
      case 'IN': return 'success';
      case 'OUT': return 'danger';
      case 'TRANSFER': return 'info';
      default: return 'secondary';
    }
  }
}
