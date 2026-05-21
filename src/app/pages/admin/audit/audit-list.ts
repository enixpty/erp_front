import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Customtable } from '@src/app/components/customTable/customtable';

@Component({
  selector: 'app-audit-list',
  standalone: true,
  imports: [CommonModule, CardModule, Customtable],
  templateUrl: './audit-list.html'
})
export class AuditListComponent {
  cols = [
    { field: 'timestamp', header: 'Fecha' },
    { field: 'user_name', header: 'Usuario' },
    { field: 'operation_type', header: 'Acción' },
    { field: 'content_object_repr', header: 'Objeto' },
    { field: 'description', header: 'Detalle' }
  ];
}
