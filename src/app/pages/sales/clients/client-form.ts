import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ClientService } from '@src/app/services/client.service';
import { Client } from '@src/app/interfaces/client.interface';

export function panamaIdentificationValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    // Patrones Panamá: 
    // Provincial: 1-13 (1-9 o 10-13)
    // Especiales: E, N, PE, PI
    // Formato general: X-XXX-XXXX
    const cedulaRegex = /^(?:(?:[1-9]|1[0-3])|[EN]|(?:PE)|(?:PI))-\d{1,4}-\d{1,6}$/;
    
    // Pasaporte: Alfanumérico (ej: PA123456, A1234567, etc)
    const passportRegex = /^[A-Z0-9]{5,20}$/i;

    const isValid = cedulaRegex.test(value) || passportRegex.test(value);
    return isValid ? null : { invalidIdentification: true };
  };
}

import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, Select, InputTextModule, Toast, RouterLink, DividerModule],
  providers: [MessageService],
  templateUrl: './client-form.html'
})
export class ClientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private msg = inject(MessageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  form: FormGroup = this.fb.group({
    id: [null],
    identification: ['', [Validators.required, panamaIdentificationValidator()]],
    first_name: ['', Validators.required],
    last_name: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    client_type: ['NATURAL', Validators.required],
    parent: [null],
    payment_term: ['CASH', Validators.required],
    credit_days: [0],
    credit_limit: [0, Validators.required],
    require_authorization: [false],
    status: ['ACTIVE', Validators.required]
  });

  clientTypes = [
    { label: 'Natural', value: 'NATURAL' },
    { label: 'Jurídico', value: 'JURIDICO' }
  ];

  clientOptions: any[] = [];

  paymentTerms = [
    { label: 'Contado', value: 'CASH' },
    { label: 'Crédito', value: 'CREDIT' }
  ];

  creditDaysOptions = [
    { label: '30 Días', value: 30 },
    { label: '60 Días', value: 60 },
    { label: '90 Días', value: 90 },
    { label: '120 Días', value: 120 }
  ];

  statusOptions = [
    { label: 'Activo', value: 'ACTIVE' },
    { label: 'Inactivo', value: 'INACTIVE' }
  ];

  isEdit = false;

  ngOnInit() {
    this.loadClientOptions();
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.clientService.getClientById(Number(id)).subscribe({
        next: (client) => this.form.patchValue(client),
        error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el cliente' })
      });
    }
  }

  loadClientOptions() {
    this.clientService.getClients({}).subscribe(data => {
        setTimeout(() => {
            this.clientOptions = (data.results || data).filter((c: any) => 
                c.id !== this.form.get('id')?.value && c.payment_term === 'CREDIT'
            );
            this.cdr.markForCheck();
        });
    });
  }


  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const client: Client = this.form.value;
    const action = this.isEdit 
      ? this.clientService.updateClient(client) 
      : this.clientService.createClient(client);

    action.subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'Éxito', detail: `Cliente ${this.isEdit ? 'actualizado' : 'creado'}` });
        setTimeout(() => this.router.navigate(['/sales/clients']), 1000);
      },
      error: (err) => this.msg.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al guardar' })
    });
  }
}
