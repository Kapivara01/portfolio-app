import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PortfolioPageRoutingModule } from './portfolio-routing.module';

// CAMBIA ESTO: De PortfolioPage a PortafolioPage
import { PortafolioPage } from './portfolio.page'; 

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PortfolioPageRoutingModule
  ],
  declarations: [PortafolioPage] // CAMBIA ESTO TAMBIÉN
})
export class PortfolioPageModule {}
