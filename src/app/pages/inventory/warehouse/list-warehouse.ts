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
import { WarehouseService } from '@src/app/services/warehouse.service';
import { Warehouse } from '@src/app/interfaces/warehouse.interface';

@Component({
  selector: 'app-list-warehouse',
  standalone: true,
  imports: [
    CommonModule, CardModule, ButtonModule, InputTextModule, DialogModule, 
    ReactiveFormsModule, ToggleButtonModule, TooltipModule, ToastModule, 
    ConfirmDialogModule, Customtable
  ],
  templateUrl: './list-warehouse.html'
})
export class ListWarehouseComponent implements OnInit {
  @ViewChild('warehouseTable') customTableComponent!: Customtable;
  
  public warehouseService = inject(WarehouseService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  
  displayModal = signal<boolean>(false);
  submitting = signal<boolean>(false);
  isEdit = signal<boolean>(false);

  cols = [
    { field: 'name', header: 'Nombre', order: true, filter: true },
    { field: 'location', header: 'Ubicación', order: true, filter: true },
    { field: 'status', header: 'Estado', order: true, filter: true },
    { field: 'action', header: '', order: false, filter: false }
  ];

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      location: [''],
      status: [true]
    });
  }

  ngOnInit() {}

  openNew() {
    this.isEdit.set(false);
    this.form.reset({ status: true });
    this.displayModal.set(true);
  }

  editWarehouse(warehouse: any) {
    this.isEdit.set(true);
    this.form.patchValue({
      ...warehouse,
      status: warehouse.status === '1'
    });
    this.displayModal.set(true);
  }

  save() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const formValue = this.form.value;
    const data: Warehouse = {
      ...formValue,
      status: formValue.status ? '1' : '0'
    };
    
    const request = this.isEdit() 
      ? this.warehouseService.updateWarehouse(data)
      : this.warehouseService.createWarehouse(data);

    request.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Bodega guardada' });
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

  confirmDelete(warehouse: any) {
    this.confirmationService.confirm({
      message: `¿Deseas eliminar la bodega "${warehouse.name}"?`,
      header: 'Confirmar Acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.warehouseService.deleteWarehouse(warehouse.id!).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Bodega borrada' });
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
