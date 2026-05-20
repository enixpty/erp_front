import { Routes } from '@angular/router';
import { ListLvalComponent } from './lval/list-lval/list-lval';
import { CompanyComponent } from './company/company';
import { ListDocumentTypeComponent } from './document-types/list-document-type';
import { DocumentTypeFormComponent } from './document-types/document-type-form';

export const configRoutes: Routes = [
    {
        path: 'lval',
        component: ListLvalComponent
    },
    {
        path: 'company',
        component: CompanyComponent
    },
    {
        path: 'document-types',
        component: ListDocumentTypeComponent
    },
    {
        path: 'document-types/new',
        component: DocumentTypeFormComponent
    },
    {
        path: 'document-types/:id',
        component: DocumentTypeFormComponent
    }
];
