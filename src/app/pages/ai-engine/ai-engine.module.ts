import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AIEnginePageRoutingModule } from './ai-engine-routing.module';
import { AIEnginePage } from './ai-engine.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AIEnginePageRoutingModule
    ],
    declarations: [AIEnginePage]
})
export class AIEnginePageModule { }
