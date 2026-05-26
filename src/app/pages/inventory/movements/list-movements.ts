import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Customtable } from '@src/app/components/customTable/customtable';
import { StockMovementService } from '@src/app/services/stock-movement.service';
import { TagModule } from 'primeng/tag';
import { filter } from 'rxjs';

@Component({
  selector: 'app-list-movements',
  standalone: true,
  imports: [CommonModule, CardModule, Customtable, TagModule],
  templateUrl: './list-movements.html'
})
export class ListMovementsComponent implements OnInit {
  private movementService = inject(StockMovementService);

  movements = signal<any[]>([]);

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
}

