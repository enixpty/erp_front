import { Component, Input, Output, EventEmitter, signal, TemplateRef, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { extractActiveFilters } from './mapfilter';
import { Observable } from 'rxjs';
import {  NgTemplateOutlet } from '@angular/common';


export type ArrayServicesLoader = (params: any) => Observable<any>;
@Component({
  selector: 'app-customtable',
  imports: [TableModule, ButtonModule, NgTemplateOutlet, TooltipModule],
  templateUrl: './customtable.html',
  styleUrl: './customtable.css',
})
export class Customtable {
  @Input () titletable : string='';
  @ViewChild('dt') dt: Table | undefined;
  @Input () genericCol : any;
  @Input() loaderFunction!: ArrayServicesLoader;
  @Input() actionsTemplate: TemplateRef<any> | null = null;
  @Input() columnTemplates: { [key: string]: TemplateRef<any> } | null = null;
  @Input() selection: any[] = [];
  @Output() selectionChange = new EventEmitter<any[]>();
  @Input() selectionMode: 'single' | 'multiple' | null = null;
  
  totalCount = signal<number>(0) 
  genericData = signal<[]>([])  
  isloading = signal<boolean>(true)

  onSelectionChange(event: any) {
    this.selection = event;
    this.selectionChange.emit(event);
  }
  getLvalName(item: any, col: any): string {
    const value = item[col.field];
    if (value === undefined || value === null) return '';

    // Si options es una función (Signal), la ejecutamos, si no la usamos directamente
    const options = typeof col.options === 'function' ? col.options() : col.options;
    
    if (!Array.isArray(options)) return value;

    // Buscamos el objeto cuya propiedad 'value' coincida con el valor de la celda
    const found = options.find((opt: any) => String(opt.value) === String(value));
    return found ? found.name : value;
  }

  ngOnInit(){
    const params = {
      page: 1, 
      rows: 10, 
      filters: [], 
      sort: 1,      // sort -> asc/desc/null
      sortField: undefined  // field name to sort data
    }; 
      this.loaderFunction(params).subscribe((resp:any)=>
      {
        this.genericData.set(resp.results)
        this.isloading.set(false)
        this.totalCount.set(resp.count) 
      })
  }
  onRefresh() {
        if (this.dt) {
            // Llama a reset(), que forza un nuevo evento onLazyLoad.
            this.dt.reset();
            console.log("Tabla genérica reseteada y recargando...");
        }
  }

  loadRegistros(event: any) {
      this.isloading.set(true) ; 
      // PrimeNG da el índice inicial (0, 10, 20...). Django quiere el número de página (1, 2, 3...)
      const first = event.first ?? 0;
      const rows = event.rows ?? 10;
      const filters = extractActiveFilters(event.filters) 
      // 📌 CALCULAR EL NÚMERO DE PÁGINA: (índice / filas) + 1
      const currentPage = Math.floor(first / rows) + 1; 
  
      const params = {
        page: currentPage, 
        rows: rows, 
        filters: filters, 
        sort: event.sortOrder,      // sort -> asc/desc/null
        sortField: event.sortField // field name to sort data
      }; 
      this.loaderFunction(params).subscribe((resp:any)=>
      {
        this.genericData.set(resp.results)
        this.isloading.set(false)
        this.totalCount.set(resp.count) 
      })
  
    }

}
