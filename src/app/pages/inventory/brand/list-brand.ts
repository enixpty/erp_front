import { Component, inject, signal, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Customtable } from '@src/app/components/customTable/customtable';
import { BrandService } from '@src/app/services/brand.service';
import { Brand } from '@src/app/interfaces/brand.interface';

@Component({
  selector: 'app-list-brand',
  standalone: true,
  imports: [
    CommonModule, 
    CardModule,
    ButtonModule, 
    InputTextModule,
    DialogModule, 
    ReactiveFormsModule,
    ToggleButtonModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule,
    Customtable
  ],
  templateUrl: './list-brand.html'
})
export class ListBrandComponent implements OnInit {
  @ViewChild('brandTable') customTableComponent!: Customtable;
  
  public brandService = inject(BrandService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  
  displayModal = signal<boolean>(false);
  submitting = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  brands = signal<Brand[]>([]);

  cols = [
    { field: 'name', header: 'Nombre', order: true, filter: true },
    { field: 'status', header: 'Estado', order: true, filter: true },
    { field: 'actions', header: 'Acciones', order: false, filter: false }
  ];

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      status: [true]
    });
  }

  ngOnInit() {
    this.loadBrands();
  }

  loadBrands() {
    this.brandService.getBrands({rows: 1000}).subscribe(resp => {
        this.brands.set(resp.results || resp);
    });
  }

  openNew() {
    this.isEdit.set(false);
    this.form.reset({ status: true });
    this.displayModal.set(true);
  }

  editBrand(brand: Brand) {
    this.isEdit.set(true);
    this.form.patchValue({
      ...brand,
      status: brand.status === '1'
    });
    this.displayModal.set(true);
  }

  save() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const formValue = this.form.value;
    const brandData: Brand = {
      ...formValue,
      status: formValue.status ? '1' : '0'
    };
    
    const request = this.isEdit() 
      ? this.brandService.updateBrand(brandData)
      : this.brandService.createBrand(brandData);

    request.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Marca guardada' });
        this.displayModal.set(false);
        this.submitting.set(false);
        this.refreshTable();
      },
      error: () => {
        this.submitting.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar' });
      }
    });
  }

  confirmDelete(brand: Brand) {
    this.confirmationService.confirm({
      message: `¿Deseas eliminar la marca "${brand.name}"?`,
      header: 'Confirmar Acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.brandService.deleteBrand(brand.id!).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Marca borrada' });
          this.refreshTable();
        });
      }
    });
  }

  refreshTable() {
    if (this.customTableComponent) {
      this.customTableComponent.onRefresh();
    }
  }
}
