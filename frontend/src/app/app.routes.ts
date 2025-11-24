import { Routes } from '@angular/router';
import { GoLinkListComponent } from './features/golink/pages/golink-list/golink-list.component';
import { CreateGoLinkComponent } from './features/golink/pages/create-golink/create-golink.component';
import { EditGoLinkComponent } from './features/golink/pages/edit-golink/edit-golink.component';

export const routes: Routes = [
  {
    path: '',
    component: GoLinkListComponent
  },
  {
    path: 'new',
    component: CreateGoLinkComponent
  },
  {
    path: 'edit/:id',
    component: EditGoLinkComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
