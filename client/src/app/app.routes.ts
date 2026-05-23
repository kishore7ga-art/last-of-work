import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'editor/:id',
    loadComponent: () => import('./pages/editor-page/editor-page.component').then(m => m.EditorPageComponent)
  },
  {
    path: 'site/:slug',
    loadComponent: () => import('./pages/published-page/published-page.component').then(m => m.PublishedPageComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
