import { Routes } from '@angular/router';
import {Dashboard} from './dashboard/dashboard';
import {BlockWorkspace} from './block-workspace/block-workspace';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
  },
  {
    path: 'script/:id',
    component: BlockWorkspace,
  },
  {path: '**', redirectTo: '',},
];
