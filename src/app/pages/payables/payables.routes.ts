import { Routes } from "@angular/router";

export const PAYABLES_ROUTES: Routes = [
  {
    path: "list-payables",
    loadComponent: () => import("./list-payables.component").then(m => m.ListPayablesComponent)
  }
];
