import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AIEnginePageRoutingModule } from './ai-engine-routing.module';
import { AIEnginePage } from './ai-engine.page';

// 1. IMPORTA EL COMPONENTE FOOTER AQUÍ
import { FooterComponent } from '../../components/footer/footer.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AIEnginePageRoutingModule,
        FooterComponent // 2. AGRÉGALO AQUÍ EN LOS IMPORTS
    ],
    declarations: [AIEnginePage]
})
export class AIEnginePageModule { }
