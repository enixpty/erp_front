import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FileUploadModule } from 'primeng/fileupload';
import { DividerModule } from 'primeng/divider';
import { CiaService } from '@src/app/services/cia.service';
import { Cia } from '@src/app/interfaces/cia.interface';
import { environment } from '@src/environments/environment';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    FileUploadModule,
    DividerModule
  ],
  templateUrl: './company.html'
})
export class CompanyComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ciaService = inject(CiaService);
  private messageService = inject(MessageService);

  form: FormGroup;
  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);
  logoPreview = signal<string | null>(null);
  selectedFile: File | null = null;
  baseUrl = environment.apiUrl;

  constructor() {
    this.form = this.fb.group({
      id: [null],
      name: ['', [Validators.required]],
      ruc: [''],
      dv: [''],
      email: ['', [Validators.email]],
      phone: [''],
      address: ['']
    });
  }

  ngOnInit(): void {
    this.loadCompanyData();
  }

  loadCompanyData() {
    this.loading.set(true);
    this.ciaService.getMyCompany().subscribe({
      next: (resp) => {
        if (resp.data) {
          this.form.patchValue(resp.data);
          if (resp.data.logo) {
            // Si el logo es una URL relativa, completarla
            const logoPath = resp.data.logo as string;
            this.logoPreview.set(logoPath.startsWith('http') ? logoPath : `${this.baseUrl}${logoPath}`);
          }
        }
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la información de la empresa' });
        this.loading.set(false);
      }
    });
  }

  onSelectLogo(event: any) {
    this.selectedFile = event.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.logoPreview.set(e.target.result);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  save() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const formData = new FormData();
    
    // Agregar campos del formulario al FormData
    Object.keys(this.form.value).forEach(key => {
      const value = this.form.value[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    // Agregar logo si se seleccionó uno nuevo
    if (this.selectedFile) {
      formData.append('logo', this.selectedFile);
    }

    this.ciaService.saveCompanyInfo(formData).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Configuración guardada correctamente' });
        this.submitting.set(false);
        this.loadCompanyData(); // Recargar para obtener URLs limpias
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ocurrió un error al guardar' });
        this.submitting.set(false);
      }
    });
  }
}
