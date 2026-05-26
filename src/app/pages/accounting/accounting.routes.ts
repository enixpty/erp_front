import { Routes } from '@angular/router';
import { ChartOfAccountsComponent } from './chart-of-accounts/chart-of-accounts';
import { JournalEntriesComponent } from './journal-entries/journal-entries';
import { JournalEntryFormComponent } from './journal-entries/journal-entry-form';
import { JournalEntryDetailComponent } from './journal-entries/journal-entry-detail';
import { FiscalPeriodsComponent } from './fiscal-periods/fiscal-periods';
import { FinancialReportsComponent } from './reports/financial-reports';
import { AccountingMappingsComponent } from './mappings/accounting-mappings';

export const accountingRoutes: Routes = [
  {
    path: 'accounts',
    component: ChartOfAccountsComponent
  },
  {
    path: 'mappings',
    component: AccountingMappingsComponent
  },
  {
    path: 'entries',
    component: JournalEntriesComponent
  },
  {
    path: 'entries/new',
    component: JournalEntryFormComponent
  },
  {
    path: 'entries/:id',
    component: JournalEntryDetailComponent
  },
  {
    path: 'periods',
    component: FiscalPeriodsComponent
  },
  {
    path: 'reports',
    component: FinancialReportsComponent
  }
];
