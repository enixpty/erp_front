import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AccountingService } from '@src/app/services/accounting.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-journal-entry-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, SelectModule, InputNumberModule, InputTextModule, ToastModule],
  providers: [MessageService],
  templateUrl: './journal-entry-form.html'
})
export class JournalEntryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private accountingService = inject(AccountingService);
  private msg = inject(MessageService);
  private router = inject(Router);

  accounts = signal<any[]>([]);
  form: FormGroup = this.fb.group({
    date: [new Date().toISOString().substring(0, 10), Validators.required],
    description: ['', Validators.required],
    reference: [''],
    lines: this.fb.array([this.createLine()])
  });

  ngOnInit() {
    this.accountingService.getAccounts({rows: 1000}).subscribe(a => {
      setTimeout(() => this.accounts.set(a.results));
    });
  }

  get lines(): FormArray {
    return this.form.get('lines') as FormArray;
  }

  createLine() {
    return this.fb.group({
      account_id: [null, Validators.required],
      debit: [0],
      credit: [0],
      description: ['']
    });
  }

  addLine() {
    this.lines.push(this.createLine());
  }

  removeLine(index: number) {
    this.lines.removeAt(index);
  }

  save() {
    if (this.form.invalid) {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'Formulario inválido' });
      return;
    }
    this.accountingService.createJournalEntry(this.form.value).subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'Asiento Creado' });
        this.router.navigate(['/accounting/entries']);
      },
      error: (err) => this.msg.add({ severity: 'error', summary: 'Error', detail: err.error.error })
    });
  }
}
