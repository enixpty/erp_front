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
import { PaymentTypeService, PaymentType } from '@src/app/services/payment-type.service';
import { AccountingService } from '@src/app/services/accounting.service';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-list-payment-type',
  standalone: true,
  imports: [
    CommonModule, CardModule, ButtonModule, InputTextModule, DialogModule, 
    ReactiveFormsModule, ToggleButtonModule, TooltipModule, ToastModule, 
    ConfirmDialogModule, Customtable, SelectModule
  ],
  templateUrl: './list-payment-type.html'
})
export class ListPaymentTypeComponent implements OnInit {
  @ViewChild('paymentTable') customTableComponent!: Customtable;
  
  public paymentTypeService = inject(PaymentTypeService);
  private accountingService = inject(AccountingService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  
  displayModal = signal<boolean>(false);
  submitting = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  accounts = signal<any[]>([]);

  cols = [
    { field: 'name', header: 'Nombre', order: true, filter: true },
    { field: 'ledger_account_name', header: 'Cuenta Contable', order: true, filter: true },
    { field: 'is_active', header: 'Estado', order: true, filter: true },
    { field: 'action', header: '', order: false, filter: false }
  ];

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      ledger_account: [null, [Validators.required]],
      is_active: [true]
    });
  }

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.accountingService.getAccounts({ type: 'ASSET' }).subscribe(resp => {
      this.accounts.set(resp.results || resp);
    });
  }

  openNew() {
    this.isEdit.set(false);
    this.form.reset({ is_active: true });
    this.displayModal.set(true);
  }

  editPaymentType(paymentType: PaymentType) {
    this.isEdit.set(true);
    this.form.patchValue(paymentType);
    this.displayModal.set(true);
  }

  save() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const formValue = this.form.value;
    
    const request = this.isEdit() 
      ? this.paymentTypeService.updatePaymentType(formValue)
      : this.paymentTypeService.createPaymentType(formValue);

    request.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Tipo de Pago guardado' });
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

  confirmDelete(paymentType: PaymentType) {
    this.confirmationService.confirm({
      message: `¿Deseas eliminar el tipo de pago "${paymentType.name}"?`,
      header: 'Confirmar Acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.paymentTypeService.deletePaymentType(paymentType.id!).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Tipo de Pago borrado' });
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
