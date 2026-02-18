import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
// Importamos el componente que creamos en VSC
import { DashboardCvComponent } from './dashboard-cv/dashboard-cv.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule)
  },
  {
    path: 'portfolio',
    loadChildren: () => import('./pages/portfolio/portfolio.module').then(m => m.PortfolioPageModule)
  },
  {
    path: 'ai-engine',
    loadChildren: () => import('./pages/ai-engine/ai-engine.module').then(m => m.AIEnginePageModule)
  },
  {
    path: 'admin/login',
    loadChildren: () => import('./pages/admin-login/admin-login.module').then(m => m.AdminLoginPageModule)
  },
  {
    path: 'admin/dashboard',
    loadChildren: () => import('./pages/admin-dashboard/admin-dashboard.module').then(m => m.AdminDashboardPageModule)
  },
  // --- NUEVA RUTA PARA TU HOJA DE VIDA ---
  {
    path: 'gestion-cv',
    component: DashboardCvComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
