import { Component, inject, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Customtable } from '@src/app/components/customTable/customtable';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { RouterLink } from '@angular/router';
import { environment } from '@src/environments/environment';

@Component({
  selector: 'app-list-document-type',
  standalone: true,
  imports: [CommonModule, Customtable, ButtonModule, CardModule, RouterLink],
  templateUrl: './list-document-type.html'
})
export class ListDocumentTypeComponent {
  private http = inject(HttpClient);
  columns = [
    { field: 'name', header: 'Nombre', sortable: true },
    { field: 'code', header: 'Código', sortable: true },
    { field: 'category', header: 'Categoría', sortable: true },
    { field: 'affects_inventory', header: 'Afecta Inv.', sortable: true, template: 'boolean' },
    { field: 'inventory_action', header: 'Acción Inv.', sortable: true },
    { field: 'actions', header: 'Acciones', template: 'actions' }
  ];
  loadData = (params: any) => this.http.get(`${environment.apiUrl}/api/sales/document-types/`, { params });
}
