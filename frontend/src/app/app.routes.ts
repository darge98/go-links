import { Routes } from '@angular/router';
import { GoLinkListComponent } from './features/golink/golink-list.component';

export const routes: Routes = [
  {
    path: '',
    component: GoLinkListComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
