import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PortfolioPageRoutingModule } from './portfolio-routing.module';

// Importamos la página corregida
import { PortafolioPage } from './portfolio.page'; 

// 1. IMPORTAMOS EL COMPONENTE FOOTER AQUÍ
import { FooterComponent } from '../../components/footer/footer.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PortfolioPageRoutingModule,
    FooterComponent // 2. AGREGAMOS EL FOOTER AQUÍ EN IMPORTS
  ],
  declarations: [PortafolioPage] 
})
export class PortfolioPageModule {}