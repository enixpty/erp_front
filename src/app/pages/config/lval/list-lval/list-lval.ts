import { Component, inject, signal, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Customtable } from '@src/app/components/customTable/customtable';
import { LvalService } from '@src/app/services/lval.service';
import { Lval } from '@src/app/interfaces/lval.interface';

@Component({
  selector: 'app-list-lval',
  standalone: true,
  imports: [
    CommonModule, 
    CardModule,
    ButtonModule, 
    InputTextModule,
    InputNumberModule,
    DialogModule, 
    ReactiveFormsModule,
    ToggleButtonModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule,
    Customtable
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './list-lval.html'
})
export class ListLvalComponent implements OnInit {
  @ViewChild('lvalTable') customTableComponent!: Customtable;
  
  public lvalService = inject(LvalService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  statusOptions = signal<any[]>([]);
  displayModal = signal<boolean>(false);
  submitting = signal<boolean>(false);
  isEdit = signal<boolean>(false);

  loadStatusOptions() {
    this.lvalService.listLvals('STD').subscribe({
      next: (data) => {
        this.statusOptions.set(data);
      }
    });
  }
  cols = [
    { field: 'category', header: 'Categoría', order: true, filter: true },
    { field: 'name', header: 'Nombre', order: true, filter: true },
    { field: 'value', header: 'Valor', order: true, filter: true },
    { field: 'order', header: 'Orden', order: true, filter: true },
    { field: 'status', header: 'Estado', order: true, filter: true },
    { field: 'action', header: '', order: false, filter: false }
  ];

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      id: [null],
      category: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      value: ['', [Validators.required, Validators.maxLength(100)]],
      order: [0, [Validators.required, Validators.min(0)]],
      status: [true]
    });
  }

  ngOnInit() {
    this.loadStatusOptions();
  }

  openNew() {
    this.isEdit.set(false);
    this.form.reset({ order: 0, status: true });
    this.displayModal.set(true);
  }

  editLval(lval: Lval) {
    this.isEdit.set(true);
    this.form.patchValue({
      ...lval,
      status: lval.status === '1'
    });
    this.displayModal.set(true);
  }

  save() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const formValue = this.form.value;
    const lvalData: Lval = {
      ...formValue,
      status: formValue.status ? '1' : '0'
    };
    
    const request = this.isEdit() 
      ? this.lvalService.updateLval(lvalData)
      : this.lvalService.createLval(lvalData);

    request.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Registro guardado' });
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

  confirmDelete(lval: Lval) {
    this.confirmationService.confirm({
      message: `¿Deseas eliminar "${lval.name}"?`,
      header: 'Confirmar Acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.lvalService.deleteLval(lval.id!).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Registro borrado' });
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
