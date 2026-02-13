import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// CAMBIA ESTO: De PortfolioPage a PortafolioPage
import { PortafolioPage } from './portfolio.page'; 

const routes: Routes = [
  {
    path: '',
    component: PortafolioPage // CAMBIA ESTO
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PortfolioPageRoutingModule {}
