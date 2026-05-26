import { Component, inject, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Customtable } from '@src/app/components/customTable/customtable';
import { AccountingService } from '@src/app/services/accounting.service';

@Component({
  selector: 'app-fiscal-periods',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, DialogModule, InputNumberModule, ToastModule, ConfirmDialogModule, Customtable],
  templateUrl: './fiscal-periods.html'
})
export class FiscalPeriodsComponent implements OnInit {
  @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;
  @ViewChild('statusTemplate') statusTemplate!: TemplateRef<any>;
  public accountingService = inject(AccountingService);
  private fb = inject(FormBuilder);
  private msg = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  displayModal = false;
  cols = [
    { field: 'year', header: 'Año' },
    { field: 'month', header: 'Mes' },
    { field: 'status', header: 'Estado' },
    { field: 'action', header: 'Acciones' }
  ];
  columnTemplates: any = {};

  form: FormGroup = this.fb.group({
    year: [new Date().getFullYear(), Validators.required],
    month: [new Date().getMonth() + 1, Validators.required]
  });

  ngOnInit() {
    this.columnTemplates = { 'status': this.statusTemplate, 'action': this.actionsTemplate };
  }

  createPeriod() {
    this.accountingService.createFiscalPeriod(this.form.value).subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'Creado' });
        this.displayModal = false;
        window.location.reload();
      },
      error: (err) => this.msg.add({ severity: 'error', summary: 'Error', detail: err.error.error })
    });
  }

  confirmClosePeriod(id: number) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea cerrar este periodo? Esta acción es irreversible.',
      header: 'Confirmar Cierre',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.closePeriod(id);
      }
    });
  }

  closePeriod(id: number) {
    this.accountingService.closeFiscalPeriod(id).subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'Cerrado' });
        window.location.reload();
      },
      error: (err) => this.msg.add({ severity: 'error', summary: 'Error', detail: err.error.error })
    });
  }
}
