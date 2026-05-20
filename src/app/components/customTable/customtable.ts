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
  @Input() genericCol : any;
  @Input() loaderFunction?: ArrayServicesLoader;
  @Input() actionsTemplate: TemplateRef<any> | null = null;
  @Input() columnTemplates: { [key: string]: TemplateRef<any> } | null = null;
  @Input() selection: any[] = [];
  @Output() selectionChange = new EventEmitter<any[]>();
  @Input() selectionMode: 'single' | 'multiple' | null = null;
  @Input() data: any[] = [];
  @Input() columns: any[] = [];
  @Input() totalRecords: number = 0;
  @Input() loading: boolean = false;
  
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
    if (this.loaderFunction) {
      const params = {
        page: 1, 
        rows: 10, 
        filters: [], 
        sort: 1,      // sort -> asc/desc/null
        sortField: undefined  // field name to sort data
      }; 
        console.log("Customtable: Executing loaderFunction...");
        this.loaderFunction?.(params).subscribe({
          next: (resp: any) => {
            console.log("Customtable: Data received", resp);
            const data = resp.results || resp;
            const count = resp.count || data.length;
            this.genericData.set(data);
            this.isloading.set(false);
            this.totalCount.set(count);
          },
          error: (err) => {
            console.error("Customtable: Loader error", err);
            this.isloading.set(false);
          }
        });
    } else {
        this.isloading.set(false);
    }
  }
  onRefresh() {
        if (this.dt) {
            this.dt.reset();
        }
  }

  loadRegistros(event: any) {
      this.isloading.set(true) ; 
      const first = event.first ?? 0;
      const rows = event.rows ?? 10;
      const filters = extractActiveFilters(event.filters) 
      const currentPage = Math.floor(first / rows) + 1; 
  
      const params = {
        page: currentPage, 
        rows: rows, 
        filters: filters, 
        sort: event.sortOrder,
        sortField: event.sortField 
      }; 
      console.log("Customtable: loadRegistros calling loaderFunction...");
      this.loaderFunction?.(params).subscribe({
        next: (resp: any) => {
          console.log("Customtable: Data received in loadRegistros", resp);
          const data = resp.results || resp;
          const count = resp.count || data.length;
          this.genericData.set(data);
          this.isloading.set(false);
          this.totalCount.set(count);
        },
        error: (err) => {
          console.error("Customtable: Loader error in loadRegistros", err);
          this.isloading.set(false);
        }
      });
  
    }

}
