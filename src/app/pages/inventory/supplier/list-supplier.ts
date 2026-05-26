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
import { SupplierService } from '@src/app/services/supplier.service';
import { Supplier } from '@src/app/interfaces/supplier.interface';

@Component({
  selector: 'app-list-supplier',
  standalone: true,
  imports: [
    CommonModule, CardModule, ButtonModule, InputTextModule, DialogModule, 
    ReactiveFormsModule, ToggleButtonModule, TooltipModule, ToastModule, 
    ConfirmDialogModule, Customtable
  ],
  templateUrl: './list-supplier.html'
})
export class ListSupplierComponent implements OnInit {
  @ViewChild('supplierTable') customTableComponent!: Customtable;
  
  public supplierService = inject(SupplierService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  
  displayModal = signal<boolean>(false);
  submitting = signal<boolean>(false);
  isEdit = signal<boolean>(false);

  cols = [
    { field: 'name', header: 'Nombre', order: true, filter: true },
    { field: 'ruc', header: 'RUC', order: true, filter: true },
    { field: 'phone', header: 'Teléfono', order: true, filter: true },
    { field: 'status', header: 'Estado', order: true, filter: true },
    { field: 'action', header: '', order: false, filter: false }
  ];

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      ruc: [''],
      phone: [''],
      email: ['', [Validators.email]],
      address: [''],
      status: [true]
    });
  }

  ngOnInit() {}

  openNew() {
    this.isEdit.set(false);
    this.form.reset({ status: true });
    this.displayModal.set(true);
  }

  editSupplier(supplier: Supplier) {
    this.isEdit.set(true);
    this.form.patchValue({
      ...supplier,
      status: supplier.status === '1'
    });
    this.displayModal.set(true);
  }

  save() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const formValue = this.form.value;
    const supplierData: Supplier = {
      ...formValue,
      status: formValue.status ? '1' : '0'
    };
    
    const request = this.isEdit() 
      ? this.supplierService.updateSupplier(supplierData)
      : this.supplierService.createSupplier(supplierData);

    request.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proveedor guardado' });
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

  confirmDelete(supplier: Supplier) {
    this.confirmationService.confirm({
      message: `¿Deseas eliminar al proveedor "${supplier.name}"?`,
      header: 'Confirmar Acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.supplierService.deleteSupplier(supplier.id!).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Proveedor borrado' });
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
