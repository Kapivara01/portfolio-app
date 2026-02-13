import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AdminDashboardPageRoutingModule } from './admin-dashboard-routing.module';
import { AdminDashboardPage } from './admin-dashboard.page';
import { FooterComponent } from '../../components/footer/footer.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AdminDashboardPageRoutingModule,
        FooterComponent
    ],
    declarations: [AdminDashboardPage]
})
export class AdminDashboardPageModule { }
