import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { AccountingService } from '@src/app/services/accounting.service';

@Component({
  selector: 'app-journal-entry-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    CardModule, ButtonModule, SelectModule, InputNumberModule,
    InputTextModule, DividerModule, TooltipModule, ToastModule, TagModule
  ],
  providers: [MessageService],
  templateUrl: './journal-entry-form.html'
})
export class JournalEntryFormComponent implements OnInit {
  private fb                = inject(FormBuilder);
  private accountingService = inject(AccountingService);
  private msg               = inject(MessageService);
  private router            = inject(Router);
  private cd                = inject(ChangeDetectorRef);

  accounts  = signal<any[]>([]);
  isSaving  = signal<boolean>(false);

  form: FormGroup = this.fb.group({
    date:        [new Date().toISOString().substring(0, 10), Validators.required],
    description: ['', Validators.required],
    reference:   [''],
    lines:       this.fb.array([this.createLine(), this.createLine()])
  });

  ngOnInit() {
    this.accountingService.getAccounts({ rows: 1000 }).subscribe(a => {
      this.accounts.set(
        (a.results || a).filter((acc: any) => acc.is_selectable)
          .map((acc: any) => ({ ...acc, searchLabel: `${acc.code} — ${acc.name}` }))
      );
      this.cd.detectChanges();
    });
  }

  // ── FormArray ────────────────────────────────────────────────
  get lines(): FormArray { return this.form.get('lines') as FormArray; }

  createLine(): FormGroup {
    return this.fb.group({
      account_id:  [null, Validators.required],
      debit:       [null],
      credit:      [null],
      description: ['']
    });
  }

  addLine() { this.lines.push(this.createLine()); }

  removeLine(i: number) {
    if (this.lines.length > 2) this.lines.removeAt(i);
    else this.msg.add({ severity: 'warn', summary: 'Mínimo 2 líneas', detail: 'Un asiento requiere al menos 2 renglones.' });
  }

  // ── Exclusión mutua débito / crédito ────────────────────────
  onDebitChange(i: number) {
    const line = this.lines.at(i);
    if ((line.get('debit')?.value || 0) > 0) {
      line.get('credit')?.setValue(null, { emitEvent: false });
    }
  }

  onCreditChange(i: number) {
    const line = this.lines.at(i);
    if ((line.get('credit')?.value || 0) > 0) {
      line.get('debit')?.setValue(null, { emitEvent: false });
    }
  }

  // ── Totales reactivos ────────────────────────────────────────
  get totalDebit(): number {
    return this.lines.controls.reduce((s, c) => s + (Number(c.get('debit')?.value) || 0), 0);
  }

  get totalCredit(): number {
    return this.lines.controls.reduce((s, c) => s + (Number(c.get('credit')?.value) || 0), 0);
  }

  get difference(): number { return Math.abs(this.totalDebit - this.totalCredit); }
  get isBalanced():  boolean { return this.difference < 0.01; }

  balanceSeverity(): 'success' | 'warn' | 'danger' {
    if (this.isBalanced)      return 'success';
    if (this.difference < 1)  return 'warn';
    return 'danger';
  }

  // ── Guardar ──────────────────────────────────────────────────
  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.msg.add({ severity: 'error', summary: 'Datos incompletos',
        detail: 'Complete todos los campos obligatorios.' });
      return;
    }

    if (!this.isBalanced) {
      this.msg.add({ severity: 'error', summary: 'Asiento desbalanceado',
        detail: `La diferencia entre Débito y Crédito es ${this.difference.toFixed(2)}. Debe ser 0.` });
      return;
    }

    const hasEmptyAmounts = this.lines.controls.some(
      c => !((c.get('debit')?.value || 0) > 0 || (c.get('credit')?.value || 0) > 0)
    );
    if (hasEmptyAmounts) {
      this.msg.add({ severity: 'error', summary: 'Montos incompletos',
        detail: 'Cada línea debe tener un monto en Débito o Crédito.' });
      return;
    }

    const payload = {
      ...this.form.value,
      lines: this.form.value.lines.map((l: any) => ({
        account_id:  l.account_id,
        debit:       Number(l.debit  || 0),
        credit:      Number(l.credit || 0),
        description: l.description || ''
      }))
    };

    this.isSaving.set(true);
    this.accountingService.createJournalEntry(payload).subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'Asiento Creado',
          detail: 'El asiento fue registrado correctamente.' });
        setTimeout(() => this.router.navigate(['/accounting/entries']), 1200);
      },
      error: (err) => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'Error al guardar' });
        this.isSaving.set(false);
      }
    });
  }
}
