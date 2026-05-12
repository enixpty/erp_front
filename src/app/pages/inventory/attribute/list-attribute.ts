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
import { SelectModule } from 'primeng/select';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Customtable } from '@src/app/components/customTable/customtable';
import { AttributeService } from '@src/app/services/attribute.service';
import { Attribute, AttributeValue } from '@src/app/interfaces/attribute.interface';

@Component({
  selector: 'app-list-attribute',
  standalone: true,
  imports: [
    CommonModule, CardModule, ButtonModule, InputTextModule, DialogModule, 
    ReactiveFormsModule, ToggleButtonModule, TooltipModule, ToastModule, 
    ConfirmDialogModule, Customtable, SelectModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './list-attribute.html'
})
export class ListAttributeComponent implements OnInit {
  @ViewChild('attrTable') attrTable!: Customtable;
  @ViewChild('valTable') valTable!: Customtable;
  
  public attrService = inject(AttributeService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  
  displayAttrModal = signal<boolean>(false);
  displayValModal = signal<boolean>(false);
  submitting = signal<boolean>(false);
  
  attrForm: FormGroup;
  valForm: FormGroup;
  
  attributes = signal<Attribute[]>([]);
  selectedAttribute = signal<Attribute | null>(null);

  attrCols = [
    { field: 'name', header: 'Nombre', order: true, filter: true },
    { field: 'action', header: '', order: false, filter: false }
  ];

  valCols = [
    { field: 'value', header: 'Valor', order: true, filter: true },
    { field: 'attribute_name', header: 'Atributo', order: true, filter: true },
    { field: 'action', header: '', order: false, filter: false }
  ];

  constructor() {
    this.attrForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      status: [true]
    });

    this.valForm = this.fb.group({
      id: [null],
      attribute: [null, Validators.required],
      value: ['', Validators.required],
      status: [true]
    });
  }

  ngOnInit() {
    this.loadAttributes();
  }

  loadAttributes() {
    this.attrService.getAttributes({ rows: 1000 }).subscribe(resp => {
      this.attributes.set(resp.results);
    });
  }

  // --- Atributos ---
  openNewAttr() {
    this.attrForm.reset({ status: true });
    this.displayAttrModal.set(true);
  }

  editAttr(attr: Attribute) {
    this.attrForm.patchValue({ ...attr, status: attr.status === '1' });
    this.displayAttrModal.set(true);
  }

  deleteAttr(attr: Attribute) {
    this.confirmationService.confirm({
      message: `¿Eliminar atributo "${attr.name}"?`,
      accept: () => this.attrService.deleteAttribute(attr.id!).subscribe(() => this.attrTable.onRefresh())
    });
  }

  saveAttr() {
    if (this.attrForm.invalid) return;
    this.submitting.set(true);
    const data = { ...this.attrForm.value, status: this.attrForm.value.status ? '1' : '0' };
    
    (data.id ? this.attrService.updateAttribute(data) : this.attrService.createAttribute(data)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Atributo guardado' });
        this.displayAttrModal.set(false);
        this.submitting.set(false);
        this.attrTable.onRefresh();
        this.loadAttributes();
      },
      error: () => this.submitting.set(false)
    });
  }

  // --- Valores ---
  openNewVal() {
    this.valForm.reset({ status: true });
    this.displayValModal.set(true);
  }

  editVal(val: AttributeValue) {
    this.valForm.patchValue({ ...val, status: val.status === '1' });
    this.displayValModal.set(true);
  }

  deleteVal(val: AttributeValue) {
    this.confirmationService.confirm({
      message: `¿Eliminar valor "${val.value}"?`,
      accept: () => this.attrService.deleteAttributeValue(val.id!).subscribe(() => this.valTable.onRefresh())
    });
  }

  saveVal() {
    if (this.valForm.invalid) return;
    this.submitting.set(true);
    const data = { ...this.valForm.value, status: this.valForm.value.status ? '1' : '0' };
    
    (data.id ? this.attrService.updateAttributeValue(data) : this.attrService.createAttributeValue(data)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Valor guardado' });
        this.displayValModal.set(false);
        this.submitting.set(false);
        this.valTable.onRefresh();
      },
      error: () => this.submitting.set(false)
    });
  }
}
