import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./pages/auth/register.component').then(m => m.RegisterComponent) 
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'editor/new', 
    loadComponent: () => import('./pages/editor-page/editor-page.component').then(m => m.EditorPageComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'editor/:id', 
    loadComponent: () => import('./pages/editor-page/editor-page.component').then(m => m.EditorPageComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'preview/:id', 
    loadComponent: () => import('./components/preview/preview.component').then(m => m.PreviewComponent) 
  },
  { 
    path: 'site/:slug', 
    loadComponent: () => import('./pages/published-page/published-page.component').then(m => m.PublishedPageComponent) 
  },
  { path: '**', redirectTo: 'login' }
];
