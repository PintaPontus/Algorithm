import { Routes } from '@angular/router';
import {Dashboard} from './dashboard/dashboard';
import {Editor} from './editor/editor';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
  },
  {
    path: 'script/:id',
    component: Editor,
  },
  {path: '**', redirectTo: '',},
];
