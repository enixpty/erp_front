import { Routes } from '@angular/router';
import { ListBrandComponent } from './brand/list-brand';
import { ListCategoryComponent } from './category/list-category';
import { ListSupplierComponent } from './supplier/list-supplier';
import { ListProductComponent } from './product/list-product';
import { ListAttributeComponent } from './attribute/list-attribute';
import { ListWarehouseComponent } from './warehouse/list-warehouse';
import { ListMovementTypeComponent } from './movement-type/list-movement-type';
import { ListMovementsComponent } from './movements/list-movements';
import { ListStockLevelsComponent } from './stock-levels/list-stock-levels';
import { InventorySkuComponent } from './inventory-sku/inventory-sku';
import { AdjustmentFormComponent } from './adjustment/adjustment-form';

import { KardexReportComponent } from './kardex/kardex-report';
import { ValuationReportComponent } from './valuation/valuation-report';

export const inventoryRoutes: Routes = [
    {
        path: 'kardex',
        component: KardexReportComponent
    },
    {
        path: 'valuation',
        component: ValuationReportComponent
    },
    {
        path: 'adjustment',
        component: AdjustmentFormComponent
    },
    {
        path: 'inventory-sku',
        component: InventorySkuComponent
    },
    {
        path: 'stock-levels',
        component: ListStockLevelsComponent
    },
    {
        path: 'movements',
        component: ListMovementsComponent
    },
    {
        path: 'brands',
        component: ListBrandComponent
    },
    {
        path: 'categories',
        component: ListCategoryComponent
    },
    {
        path: 'suppliers',
        component: ListSupplierComponent
    },
    {
        path: 'products',
        component: ListProductComponent
    },
    {
        path: 'attributes',
        component: ListAttributeComponent
    },
    {
        path: 'warehouses',
        component: ListWarehouseComponent
    },
    {
        path: 'movementType',
        component: ListMovementTypeComponent
    }
];
