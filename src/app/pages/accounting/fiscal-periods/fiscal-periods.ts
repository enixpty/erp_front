import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AccountingService } from '@src/app/services/accounting.service';

@Component({
  selector: 'app-fiscal-periods',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, CardModule, ButtonModule,
    DialogModule, SelectModule, InputNumberModule, ToastModule,
    TooltipModule, TagModule, ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './fiscal-periods.html'
})
export class FiscalPeriodsComponent implements OnInit {
  private accountingService   = inject(AccountingService);
  private fb                  = inject(FormBuilder);
  private msg                 = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router              = inject(Router);

  periods      = signal<any[]>([]);
  displayModal = false;
  isLoading    = signal(false);

  readonly MESES = [
    { label: 'Enero',      value: 1  },
    { label: 'Febrero',    value: 2  },
    { label: 'Marzo',      value: 3  },
    { label: 'Abril',      value: 4  },
    { label: 'Mayo',       value: 5  },
    { label: 'Junio',      value: 6  },
    { label: 'Julio',      value: 7  },
    { label: 'Agosto',     value: 8  },
    { label: 'Septiembre', value: 9  },
    { label: 'Octubre',    value: 10 },
    { label: 'Noviembre',  value: 11 },
    { label: 'Diciembre',  value: 12 },
  ];

  form: FormGroup = this.fb.group({
    year:  [new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]],
    month: [new Date().getMonth() + 1, Validators.required],
  });

  ngOnInit() { this.loadPeriods(); }

  loadPeriods() {
    this.isLoading.set(true);
    this.accountingService.getFiscalPeriods({}).subscribe({
      next: (res) => {
        const list = (res.results || res).sort((a: any, b: any) => {
          if (b.year !== a.year) return b.year - a.year;
          return b.month - a.month;
        });
        this.periods.set(list);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openModal() {
    const now = new Date();
    this.form.reset({ year: now.getFullYear(), month: now.getMonth() + 1 });
    this.displayModal = true;
  }

  createPeriod() {
    if (this.form.invalid) return;
    this.accountingService.createFiscalPeriod(this.form.value).subscribe({
      next: (res) => {
        this.msg.add({ severity: 'success', summary: 'Periodo Creado',
          detail: `${this.monthName(res.month)} ${res.year} creado y abierto.` });
        this.displayModal = false;
        this.loadPeriods();
      },
      error: (err) => this.msg.add({
        severity: 'error', summary: 'Error',
        detail: err.error?.error || 'No se pudo crear el periodo.'
      })
    });
  }

  confirmClose(period: any) {
    if (period.draft_count > 0) {
      // El backend bloquea el cierre con borradores: hay que asentarlos primero.
      this.confirmationService.confirm({
        message: `El periodo <strong>${this.monthName(period.month)} ${period.year}</strong> tiene
                  <strong>${period.draft_count} asiento(s) en Borrador</strong>.<br><br>
                  No se puede cerrar hasta asentar o anular todos los borradores.<br><br>
                  ¿Desea ir a revisar los asientos pendientes?`,
        header: 'Asientos Pendientes',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Ver asientos',
        rejectLabel: 'Cancelar',
        acceptButtonStyleClass: 'p-button-warning',
        accept: () => this.router.navigate(['/accounting/entries'], {
          queryParams: { status: 'DRAFT' }
        }),
      });
    } else {
      this.confirmationService.confirm({
        message: `¿Confirma el cierre de <strong>${this.monthName(period.month)} ${period.year}</strong>?
                  <br><br>Esta acción es <strong>irreversible</strong>.
                  Se abrirá automáticamente el siguiente periodo.`,
        header: 'Cerrar Periodo Fiscal',
        icon: 'pi pi-lock',
        acceptLabel: 'Sí, cerrar periodo',
        rejectLabel: 'Cancelar',
        acceptButtonStyleClass: 'p-button-warning',
        accept: () => this.closePeriod(period),
      });
    }
  }

  closePeriod(period: any) {
    this.accountingService.closeFiscalPeriod(period.id).subscribe({
      next: (res: any) => {
        this.msg.add({ severity: 'success', summary: 'Periodo Cerrado', detail: res.message });
        this.loadPeriods();
      },
      error: (err) => this.msg.add({
        severity: 'error', summary: 'Error',
        detail: err.error?.error || 'No se pudo cerrar el periodo.'
      })
    });
  }

  monthName(n: number): string {
    return this.MESES.find(m => m.value === n)?.label ?? String(n);
  }

  get currentOpenPeriod(): any {
    return this.periods().find(p => p.status === 'OPEN');
  }
}
