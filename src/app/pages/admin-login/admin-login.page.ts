import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { SupabaseService } from '../../services/supabase.service';

@Component({
    selector: 'app-admin-login',
    templateUrl: './admin-login.page.html',
    styleUrls: ['./admin-login.page.scss'],
    standalone: false,
})
export class AdminLoginPage implements OnInit {

    email = '';
    password = '';

    constructor(
        private supabaseService: SupabaseService,
        private router: Router,
        private loadingController: LoadingController,
        private alertController: AlertController
    ) { }

    ngOnInit() {
    }

    async onLogin() {
        const loading = await this.loadingController.create();
        await loading.present();

        const { error } = await this.supabaseService.signIn(this.email);

        await loading.dismiss();

        if (error) {
            const alert = await this.alertController.create({
                header: 'Error',
                message: error.message,
                buttons: ['OK']
            });
            await alert.present();
        } else {
            const alert = await this.alertController.create({
                header: 'Enlace enviado',
                message: 'Revisa tu correo electrónico para ingresar.',
                buttons: ['OK']
            });
            await alert.present();
        }
    }
}
