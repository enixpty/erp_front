import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { SalesInvoiceService } from '@src/app/services/sales-invoice.service';
import { CreditNoteService } from '@src/app/services/credit-note.service';

@Component({
  selector: 'app-credit-note-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, Select, InputTextModule, TableModule, DividerModule, DatePickerModule, Toast, RouterLink],
  templateUrl: './credit-note-form.html'
})
export class CreditNoteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private invoiceService = inject(SalesInvoiceService);
  private creditNoteService = inject(CreditNoteService);
  private msg = inject(MessageService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  form: FormGroup = this.fb.group({
    invoice: [null, Validators.required],
    reason: ['', Validators.required],
    subtotal: [0],
    tax: [0],
    total: [0],
    details: this.fb.array([])
  });

  invoices: any[] = [];
  selectedInvoice: any = null;
  isLoaded = false;

  get details() {
    return this.form.get('details') as FormArray;
  }

  ngOnInit() {
    this.invoiceService.getInvoices({}).subscribe(data => {
        this.invoices = (data.results || data).map((inv: any) => ({
            ...inv,
            searchLabel: `${inv.document_number} - ${inv.client_name}`
        }));
        this.isLoaded = true;
    });
  }

  onInvoiceChange(event: any) {
    const invoiceId = event.value;
    this.selectedInvoice = this.invoices.find(inv => inv.id === invoiceId);
    if (this.selectedInvoice) {
      this.details.clear();
      this.selectedInvoice.details.forEach((detail: any) => {
        this.details.push(this.fb.group({
            invoice_detail: [detail.id],
            sku_name: [detail.sku_name],
            quantity: [detail.quantity, [Validators.required, Validators.min(0), Validators.max(detail.quantity)]],
            price: [detail.price],
            subtotal: [0]
        }));
      });
      this.calculateTotals();
    }
  }

  calculateTotals() {
    let subtotal = 0;
    this.details.controls.forEach((control: any) => {
        const qty = control.get('quantity').value || 0;
        const price = control.get('price').value || 0;
        const rowSubtotal = qty * price;
        control.get('subtotal').setValue(rowSubtotal);
        subtotal += rowSubtotal;
    });

    const tax = subtotal * 0.07;
    this.form.patchValue({ subtotal, tax, total: subtotal + tax });
  }

  save() {
    if (this.form.invalid) {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'Por favor complete los campos requeridos.' });
        return;
    }

    this.creditNoteService.createCreditNote(this.form.value).subscribe({
      next: (res) => {
        this.msg.add({ severity: 'success', summary: 'Éxito', detail: 'Nota de Crédito generada' });
        window.open(`/api/sales/credit-notes/${res.id}/print/`, '_blank');
        setTimeout(() => this.router.navigate(['/sales/invoices']), 1500);
      },
      error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Error al generar NC' })
    });
  }
}
