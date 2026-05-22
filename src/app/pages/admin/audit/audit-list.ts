import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Customtable } from '@src/app/components/customTable/customtable';
import { AuditService } from '@src/app/services/audit.service';

@Component({
  selector: 'app-audit-list',
  standalone: true,
  imports: [CommonModule, CardModule, Customtable],
  templateUrl: './audit-list.html'
})
export class AuditListComponent {
  public auditService = inject(AuditService);

  cols = [
    { field: 'timestamp', header: 'Fecha' },
    { field: 'user_name', header: 'Usuario' },
    { field: 'operation_type', header: 'Acción' },
    { field: 'content_object_repr', header: 'Objeto' },
    { field: 'description', header: 'Detalle' }
  ];
}
