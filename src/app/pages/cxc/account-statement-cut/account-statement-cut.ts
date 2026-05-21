import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-account-statement-cut',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, DatePicker, Toast, TableModule],
  providers: [MessageService],
  templateUrl: './account-statement-cut.html'
})
export class AccountStatementCutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private msg = inject(MessageService);

  form: FormGroup = this.fb.group({
    cut_date: [null, Validators.required]
  });

  cuts: any[] = [];

  ngOnInit() {
    this.loadCuts();
  }

  loadCuts() {
    this.http.get<any[]>('/api/sales/account-statement-cuts/').subscribe(data => {
      this.cuts = data;
    });
  }

  generateCut() {
    if (this.form.invalid) return;

    const date = this.form.value.cut_date;
    const formattedDate = date.toISOString().split('T')[0];

    this.http.post('/api/sales/account-statement-cuts/generate/', { cut_date: formattedDate }).subscribe({
      next: (res: any) => {
        this.msg.add({ severity: 'success', summary: 'Éxito', detail: res.message });
        this.loadCuts();
      },
      error: (err) => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'Error al generar el corte' });
      }
    });
  }
}
