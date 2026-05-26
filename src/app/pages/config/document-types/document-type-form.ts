import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { environment } from '@src/environments/environment';

@Component({
  selector: 'app-document-type-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, CheckboxModule, SelectModule, Toast, RouterLink],
  templateUrl: './document-type-form.html'
})
export class DocumentTypeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private msg = inject(MessageService);

  inventoryActions = [
    { label: 'Ninguna', value: 'NONE' },
    { label: 'Sumar (Entrada)', value: 'ADD' },
    { label: 'Restar (Salida)', value: 'SUBTRACT' }
  ];

  categories = [
    { label: 'Factura', value: 'INVOICE' },
    { label: 'Nota de Crédito', value: 'CREDIT_NOTE' },
    { label: 'Nota de Débito', value: 'DEBIT_NOTE' }
  ];

  paymentTerms = [
    { label: 'Contado', value: 'CASH' },
    { label: 'Crédito', value: 'CREDIT' }
  ];

  form = this.fb.group({
    id: [null],
    name: ['', Validators.required],
    prefix: ['FAC', Validators.required],
    code: ['', Validators.required],
    category: ['INVOICE', Validators.required],
    payment_term: ['CASH', Validators.required],
    affects_inventory: [true],
    inventory_action: ['SUBTRACT', Validators.required],
    ledger_account: ['']
  });

  ngOnInit() {
    this.updateInventoryActionState();
    this.form.get('affects_inventory')?.valueChanges.subscribe(() => this.updateInventoryActionState());

    const id = this.route.snapshot.params['id'];
    if (id) {
        this.http.get(`${environment.apiUrl}/api/sales/document-types/${id}/`).subscribe(data => this.form.patchValue(data));
    }
  }

  updateInventoryActionState() {
    const control = this.form.get('inventory_action');
    if (this.form.get('affects_inventory')?.value) {
      control?.enable();
    } else {
      control?.disable();
      control?.setValue('NONE');
    }
  }

  save() {
    if (this.form.invalid) return;
    const data = this.form.getRawValue();
    const req = data.id 
      ? this.http.put(`${environment.apiUrl}/api/sales/document-types/${data.id}/`, data)
      : this.http.post(`${environment.apiUrl}/api/sales/document-types/`, data);
    
    req.subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'Éxito', detail: 'Guardado correctamente' });
        setTimeout(() => this.router.navigate(['..'], { relativeTo: this.route }), 1000);
      },
      error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Fallo al guardar' })
    });
  }
}
