import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AdminLoginPageRoutingModule } from './admin-login-routing.module';
import { AdminLoginPage } from './admin-login.page';
import { FooterComponent } from '../../components/footer/footer.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AdminLoginPageRoutingModule,
        FooterComponent
    ],
    declarations: [AdminLoginPage]
})
export class AdminLoginPageModule { }
