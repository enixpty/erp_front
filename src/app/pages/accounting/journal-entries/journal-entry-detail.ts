import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AccountingService } from '@src/app/services/accounting.service';

@Component({
  selector: 'app-journal-entry-detail',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TableModule, DividerModule, TagModule, ToastModule, RouterLink],
  providers: [MessageService],
  templateUrl: './journal-entry-detail.html'
})
export class JournalEntryDetailComponent implements OnInit {
  private accountingService = inject(AccountingService);
  private route = inject(ActivatedRoute);
  private msg = inject(MessageService);

  entry = signal<any>(null);
  isPosting = signal<boolean>(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.accountingService.getJournalEntryById(id).subscribe(data => this.entry.set(data));
    }
  }

  get totalDebit(): number {
    return (this.entry()?.lines ?? []).reduce((s: number, l: any) => s + Number(l.debit || 0), 0);
  }

  get totalCredit(): number {
    return (this.entry()?.lines ?? []).reduce((s: number, l: any) => s + Number(l.credit || 0), 0);
  }

  get isBalanced(): boolean {
    return Math.abs(this.totalDebit - this.totalCredit) < 0.01;
  }

  postEntry() {
    if (!this.entry()) return;
    this.isPosting.set(true);
    this.accountingService.postJournalEntry(this.entry().id).subscribe({
      next: (res: any) => {
        this.msg.add({ severity: 'success', summary: 'Asentado', detail: res.message });
        this.entry.update(e => ({ ...e, status: 'POSTED' }));
        this.isPosting.set(false);
      },
      error: (err) => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'No se pudo asentar' });
        this.isPosting.set(false);
      }
    });
  }

  statusSeverity(s: string): 'success' | 'warn' | 'danger' {
    return s === 'POSTED' ? 'success' : s === 'DRAFT' ? 'warn' : 'danger';
  }

  statusLabel(s: string): string {
    return s === 'POSTED' ? 'Asentado' : s === 'DRAFT' ? 'Borrador' : 'Anulado';
  }
}
