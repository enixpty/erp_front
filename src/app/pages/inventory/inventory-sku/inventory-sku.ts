import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Customtable } from '@src/app/components/customTable/customtable';
import { SkuService } from '@src/app/services/sku.service';

@Component({
  selector: 'app-inventory-sku',
  standalone: true,
  imports: [CommonModule, CardModule, Customtable],
  templateUrl: './inventory-sku.html'
})
export class InventorySkuComponent {
  private skuService = inject(SkuService);

  cols = [
    { field: 'code', header: 'Código SKU' },
    { field: 'name', header: 'Nombre' },
    { field: 'total_stock', header: 'Existencia Total' },
    { field: 'warehouse_breakdown', header: 'Detalle por Bodega' }
  ];

  // Necesitamos que el backend retorne SKUs con la suma de stock
  loadInventory = (params: any) => this.skuService.getSkus(params);
}
