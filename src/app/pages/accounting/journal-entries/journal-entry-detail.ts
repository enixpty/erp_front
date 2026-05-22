import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AccountingService } from '@src/app/services/accounting.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-journal-entry-detail',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, RouterLink],
  templateUrl: './journal-entry-detail.html'
})
export class JournalEntryDetailComponent implements OnInit {
  private accountingService = inject(AccountingService);
  private route = inject(ActivatedRoute);
  
  entry$!: Observable<any>;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.entry$ = this.accountingService.getJournalEntryById(id);
    }
  }
}
