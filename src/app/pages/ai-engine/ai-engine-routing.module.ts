import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AIEnginePage } from './ai-engine.page';

const routes: Routes = [
    {
        path: '',
        component: AIEnginePage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AIEnginePageRoutingModule { }
