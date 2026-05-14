import { Routes } from "@angular/router";

export const PAYABLES_ROUTES: Routes = [
  {
    path: "aging-report",
    loadComponent: () => import("./aging-report.component").then(m => m.DebtMaturityComponent)
  },
  {
    path: "list-payables",
    loadComponent: () => import("./list-payables.component").then(m => m.ListPayablesComponent)
  }
];
