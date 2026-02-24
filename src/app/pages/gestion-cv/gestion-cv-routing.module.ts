import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GestionCvPage } from './gestion-cv.page';

const routes: Routes = [
  {
    path: '',
    component: GestionCvPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionCvPageRoutingModule {}