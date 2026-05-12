import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DebitNoteService } from '@src/app/services/debit-note.service';
import { VendorInvoiceService } from '@src/app/services/vendor-invoice.service';

@Component({
  selector: 'app-debit-note-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    CardModule, 
    ButtonModule, 
    SelectModule, 
    InputTextModule, 
    TextareaModule, 
    ToastModule, 
    RouterLink
  ],
  providers: [MessageService],
  templateUrl: './debit-note-form.html'
})
export class DebitNoteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private debitNoteService = inject(DebitNoteService);
  private invoiceService = inject(VendorInvoiceService);
  private msg = inject(MessageService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    invoice: [null, Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    reason: ['', Validators.required]
  });

  invoices: any[] = [];
  returns: any[] = [];

  constructor() {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.invoiceService.getInvoices({}).subscribe((data: any) => this.invoices = data.results);
  }

  save() {
    if (this.form.valid) {
      this.debitNoteService.createDebitNote(this.form.value).subscribe({
        next: () => {
          this.msg.add({ severity: 'success', summary: 'Nota de Débito creada' });
          this.router.navigate(['/purchases/debit-notes']);
        },
        error: (err: any) => {
          const detail = err.error?.error || 'Error desconocido';
          this.msg.add({ severity: 'error', summary: 'Error al registrar', detail: detail });
        }
      });
    }
  }
}
