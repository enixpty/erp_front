import { Component, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Customtable } from '@src/app/components/customTable/customtable';
import { MovementTypeService } from '@src/app/services/movement-type.service';
import { MovementType } from '@src/app/interfaces/movement-type.interface';

@Component({
  selector: 'app-list-movement-type',
  standalone: true,
  imports: [
    CommonModule, CardModule, ButtonModule, InputTextModule, DialogModule, 
    ReactiveFormsModule, ToggleButtonModule, SelectModule, ToastModule, ConfirmDialogModule, Customtable, CheckboxModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './list-movement-type.html'
})
export class ListMovementTypeComponent {
  @ViewChild('mtTable') table!: Customtable;
  public mtService = inject(MovementTypeService);
  private fb = inject(FormBuilder);
  private msg = inject(MessageService);
  private confirm = inject(ConfirmationService);

  displayModal = signal(false);
  isEdit = signal(false);
  directions = ['IN', 'OUT', 'TRANSFER'];
  cols = [
    { field: 'name', header: 'Nombre' },
    { field: 'direction', header: 'Dirección' },
    { field: 'action', header: '' }
  ];
  form = this.fb.group({
    id: [null as number | string | null],
    name: ['', Validators.required],
    direction: ['IN', Validators.required],
    needs_source: [false],
    needs_destination: [true]
  });

  openNew() { this.isEdit.set(false); this.form.reset({ direction: 'IN', needs_source: false, needs_destination: true }); this.displayModal.set(true); }
  edit(mt: MovementType) { this.isEdit.set(true); this.form.patchValue(mt); this.displayModal.set(true); }
  
  save() {
    const data = this.form.value as MovementType;
    const req = this.isEdit() ? this.mtService.updateMovementType(data) : this.mtService.createMovementType(data);
    req.subscribe(() => { this.displayModal.set(false); this.msg.add({ severity: 'success', summary: 'Guardado' }); this.table.onRefresh(); });
  }

  confirmDelete(mt: MovementType) {
    this.confirm.confirm({
      message: '¿Eliminar este tipo de movimiento?',
      accept: () => this.mtService.deleteMovementType(mt.id!).subscribe(() => this.table.onRefresh())
    });
  }
}
