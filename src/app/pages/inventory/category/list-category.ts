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
import { CategoryService } from '@src/app/services/category.service';
import { Category } from '@src/app/interfaces/category.interface';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-list-category',
  standalone: true,
  imports: [
    CommonModule, CardModule, ButtonModule, InputTextModule, DialogModule, 
    ReactiveFormsModule, ToggleButtonModule, TooltipModule, ToastModule, 
    ConfirmDialogModule, Customtable, SelectModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './list-category.html'
})
export class ListCategoryComponent implements OnInit {
  @ViewChild('categoryTable') customTableComponent!: Customtable;
  
  public categoryService = inject(CategoryService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  
  displayModal = signal<boolean>(false);
  submitting = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  categories = signal<Category[]>([]);

  cols = [
    { field: 'name', header: 'Nombre', order: true, filter: true },
    { field: 'status', header: 'Estado', order: true, filter: true },
    { field: 'action', header: '', order: false, filter: false }
  ];

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      parent: [null],
      stock_min_default: [0.0],
      stock_max_default: [0.0],
      status: [true]
    });
  }

  ngOnInit() {
    this.loadAllCategories();
  }

  loadAllCategories() {
    this.categoryService.getCategories({ rows: 1000 }).subscribe(resp => {
      this.categories.set(resp.results);
    });
  }

  openNew() {
    this.isEdit.set(false);
    this.form.reset({ status: true });
    this.displayModal.set(true);
  }

  editCategory(category: Category) {
    this.isEdit.set(true);
    this.form.patchValue({
      ...category,
      status: category.status === '1'
    });
    this.displayModal.set(true);
  }

  save() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const formValue = this.form.value;
    const categoryData: Category = {
      ...formValue,
      status: formValue.status ? '1' : '0'
    };
    
    const request = this.isEdit() 
      ? this.categoryService.updateCategory(categoryData)
      : this.categoryService.createCategory(categoryData);

    request.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría guardada' });
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

  confirmDelete(category: Category) {
    this.confirmationService.confirm({
      message: `¿Deseas eliminar la categoría "${category.name}"?`,
      header: 'Confirmar Acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.categoryService.deleteCategory(category.id!).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Categoría borrada' });
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
