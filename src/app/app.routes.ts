import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/landing/landing.component').then(m => m.LandingComponent),
  },
  {
    path: 'editor',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/editor/editor.component').then(m => m.EditorComponent),
  },
  {
    path: 'editor/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/editor/editor.component').then(m => m.EditorComponent),
  },
  { path: '**', redirectTo: '' },
];
