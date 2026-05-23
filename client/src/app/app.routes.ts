import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  { 
    path: 'editor/new', 
    loadComponent: () => import('./pages/editor-page/editor-page.component').then(m => m.EditorPageComponent)
  },
  { 
    path: 'editor/:id', 
    loadComponent: () => import('./pages/editor-page/editor-page.component').then(m => m.EditorPageComponent)
  },
  { 
    path: 'preview/:id', 
    loadComponent: () => import('./components/preview/preview.component').then(m => m.PreviewComponent) 
  },
  { 
    path: 'site/:slug', 
    loadComponent: () => import('./pages/published-page/published-page.component').then(m => m.PublishedPageComponent) 
  },
  { 
    path: 'workspace/:id', 
    loadComponent: () => import('./pages/workspace-dashboard/workspace-dashboard.component').then(m => m.WorkspaceDashboardComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
