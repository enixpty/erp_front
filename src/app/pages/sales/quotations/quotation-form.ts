import { Component, inject, OnInit, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { QuotationService } from '@src/app/services/quotation.service';
import { ClientService } from '@src/app/services/client.service';
import { SkuService } from '@src/app/services/sku.service';
import { LvalService } from '@src/app/services/lval.service';
import { Quotation, QuotationDetail } from '@src/app/interfaces/quotation.interface';

@Component({
  selector: 'app-quotation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, Select, InputTextModule, TableModule, DividerModule, Toast, RouterLink, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './quotation-form.html'
})
export class QuotationFormComponent implements OnInit {
  @ViewChild('notesArea') notesArea!: ElementRef;
  @ViewChildren('discountInput') discountInputs!: QueryList<ElementRef>;
  
  private fb = inject(FormBuilder);
  private quotationService = inject(QuotationService);
  private clientService = inject(ClientService);
  private skuService = inject(SkuService);
  private lvalService = inject(LvalService);
  private msg = inject(MessageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private confirmationService = inject(ConfirmationService);

  form: FormGroup = this.fb.group({
    id: [null],
    client: [null, Validators.required],
    expiration_date: [null, Validators.required],
    status: ['DRAFT', Validators.required],
    global_discount: [0, [Validators.min(0)]],
    subtotal: [0],
    tax: [0],
    total: [0],
    notes: [''],
    details: this.fb.array([])
  });

  clients: any[] = [];
  skus: any[] = [];
  statusOptions = [
    { label: 'Borrador', value: 'DRAFT' },
    { label: 'Enviada', value: 'SENT' },
    { label: 'Aceptada', value: 'ACCEPTED' },
    { label: 'Rechazada', value: 'REJECTED' }
  ];

  isEdit = false;

  get details() {
    return this.form.get('details') as FormArray;
  }

  ngOnInit() {
    this.loadClients();
    this.loadSkus();
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.quotationService.getQuotationById(Number(id)).subscribe({
        next: (quotation) => {
          this.form.patchValue(quotation);
          quotation.details.forEach(detail => this.addDetail(detail));
        },
        error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la cotización' })
      });
    } else {
      this.setExpirationDate();
      this.addDetail(); // Iniciar con una fila vacía
    }
  }

  setExpirationDate() {
    this.lvalService.listLvals('dExpiration').subscribe(data => {
      const days = parseInt(data[0]?.value || '30', 10);
      const date = new Date();
      date.setDate(date.getDate() + days);
      this.form.patchValue({ expiration_date: date.toISOString().split('T')[0] });
    });
  }

  handleTabOnDiscount(event: Event, index: number) {
    if (index === this.details.length - 1) {
      event.preventDefault();
      this.confirmationService.confirm({
        message: '¿Deseas agregar otro material?',
        header: 'Confirmar',
        acceptLabel: 'Sí',
        rejectLabel: 'No',
        accept: () => {
          this.addDetail();
          setTimeout(() => {
              const inputs = this.discountInputs.toArray();
              inputs[inputs.length - 1].nativeElement.focus();
          }, 100);
        },
        reject: () => {
          this.notesArea.nativeElement.focus();
        }
      });
    }
  }

  loadClients() {
    this.clientService.getClients({}).subscribe(data => this.clients = data.results || data);
  }

  loadSkus() {
    this.skuService.getSkus({}).subscribe(data => this.skus = data.results || data);
  }

  addDetail(detail?: QuotationDetail) {
    const detailForm = this.fb.group({
      id: [detail?.id || null],
      sku: [detail?.sku || null, Validators.required],
      quantity: [detail?.quantity || 1, [Validators.required, Validators.min(0.1)]],
      price: [detail?.price || 0, [Validators.required, Validators.min(0)]],
      discount: [detail?.discount || 0, [Validators.min(0)]],
      tax_exempt: [detail?.tax_exempt || false],
      subtotal: [detail?.subtotal || 0]
    });
    this.details.push(detailForm);
  }

  removeDetail(index: number) {
    this.details.removeAt(index);
    this.calculateTotals();
  }

  onSkuChange(index: number) {
    const detail = this.details.at(index);
    const selectedSkuId = detail.get('sku')?.value;
    
    // Validar duplicados
    const isDuplicate = this.details.controls.some((ctrl, i) => i !== index && ctrl.get('sku')?.value === selectedSkuId);
    
    if (isDuplicate) {
        this.msg.add({ severity: 'warn', summary: 'Atención', detail: 'Este producto ya ha sido agregado.' });
        detail.patchValue({ sku: null, price: 0, tax_exempt: false, subtotal: 0 });
        return;
    }

    const selectedSku = this.skus.find(s => s.id === selectedSkuId);
    if (selectedSku) {
      detail.patchValue({
        price: selectedSku.sell_price,
        tax_exempt: selectedSku.tax_exempt
      });
      this.calculateRowSubtotal(index);
    }
  }

  calculateRowSubtotal(index: number) {
    const detail = this.details.at(index);
    const qty = detail.get('quantity')?.value || 0;
    const price = detail.get('price')?.value || 0;
    const disc = detail.get('discount')?.value || 0;
    const subtotal = (qty * price) - disc;
    detail.get('subtotal')?.setValue(subtotal);
    this.calculateTotals();
  }

  calculateTotals() {
    let subtotal = 0;
    let taxableAmount = 0;
    const globalDiscountPercent = this.form.get('global_discount')?.value || 0;

    this.details.controls.forEach(control => {
      const rowSubtotal = control.get('subtotal')?.value || 0;
      subtotal += rowSubtotal;
      
      if (!control.get('tax_exempt')?.value) {
        taxableAmount += rowSubtotal;
      }
    });

    const discountAmount = subtotal * (globalDiscountPercent / 100);
    const taxableAfterDiscount = Math.max(0, taxableAmount * (1 - (globalDiscountPercent / 100)));
    
    const tax = taxableAfterDiscount * 0.07;
    const total = (subtotal - discountAmount) + tax;
    
    this.form.patchValue({ subtotal, tax, total }, { emitEvent: false });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const quotation: Quotation = this.form.value;
    const action = this.isEdit 
      ? this.quotationService.updateQuotation(quotation) 
      : this.quotationService.createQuotation(quotation);

    action.subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'Éxito', detail: `Cotización ${this.isEdit ? 'actualizada' : 'registrada'}` });
        setTimeout(() => this.router.navigate(['/sales/quotations']), 1000);
      },
      error: (err) => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar la cotización' })
    });
  }
}
