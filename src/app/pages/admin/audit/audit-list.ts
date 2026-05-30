import { Component, inject, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { Customtable } from '@src/app/components/customTable/customtable';
import { AuditService } from '@src/app/services/audit.service';

@Component({
  selector: 'app-audit-list',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, Customtable],
  templateUrl: './audit-list.html'
})
export class AuditListComponent implements OnInit {
  public auditService = inject(AuditService);

  @ViewChild('opTemplate') opTemplate!: TemplateRef<any>;
  @ViewChild('dateTemplate') dateTemplate!: TemplateRef<any>;

  // Columnas con filtro nativo de PrimeNG (filter: true) y orden
  cols = [
    { field: 'timestamp',           header: 'Fecha / Hora',  order: true },
    { field: 'user_name',           header: 'Usuario',        filter: true },
    { field: 'operation_type',      header: 'Acción',         filter: true },
    { field: 'content_object_repr', header: 'Objeto' },
    { field: 'description',         header: 'Detalle',        filter: true }
  ];

  columnTemplates: any = {};

  ngOnInit() {
    this.columnTemplates = {
      'operation_type': this.opTemplate,
      'timestamp':      this.dateTemplate
    };
  }

  opLabel(op: string): string {
    const map: any = {
      CREATE: 'Creación', UPDATE: 'Modificación', DELETE: 'Eliminación',
      CANCEL: 'Anulación', CREATE_PENDING_AUTH: 'Creación (Pend. Aut.)',
      STOCK_MOVEMENT: 'Movimiento Stock', PAYMENT_APPLIED: 'Pago Aplicado',
      QUOTATION_CONVERTED: 'Cotización Convertida', SALES_ORDER_CANCELLED: 'Pedido Anulado'
    };
    return map[op] ?? op;
  }

  opSeverity(op: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    if (op === 'CREATE') return 'success';
    if (op === 'UPDATE') return 'info';
    if (op === 'DELETE' || op === 'CANCEL' || op === 'SALES_ORDER_CANCELLED') return 'danger';
    if (op?.includes('PENDING') || op === 'PAYMENT_APPLIED') return 'warn';
    return 'secondary';
  }
}
