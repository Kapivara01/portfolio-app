import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionCvPageRoutingModule } from './gestion-cv-routing.module';

import { GestionCvPage } from './gestion-cv.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestionCvPageRoutingModule
  ],
  declarations: [GestionCvPage]
})
export class GestionCvPageModule {}
