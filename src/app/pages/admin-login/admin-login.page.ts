import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.page.html', // Corregido: apunta al HTML, no al TS
  styleUrls: ['./admin-login.page.scss'],
})
export class AdminLoginPage implements OnInit {
  email = '';
  password = '';

  constructor(
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {}

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      color: color
    });
    await toast.present();
  }

  async onLogin() {
    // 1. Validación de campos vacíos
    if (!this.email || !this.password) {
      await this.mostrarToast('Por favor, completa todos los campos', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ 
      message: 'Validando acceso...' 
    });
    await loading.present();

    try {
      // 2. Simulación de validación (aquí conectarás Supabase después)
      const loginExitoso = true; 

      if (!loginExitoso) {
        await this.mostrarToast('Credenciales incorrectas', 'danger');
      } else {
        // 3. CORRECCIÓN CRÍTICA: Ruta ajustada a tu AppRoutingModule
        // Tu path es 'admin/dashboard', por lo tanto:
        console.log('Navegando a la ruta administrativa...');
        this.router.navigate(['/admin/dashboard']); 
      }
    } catch (e: any) {
      await this.mostrarToast('Error inesperado: ' + e.message, 'danger');
    } finally {
      // 4. Cerramos el indicador de carga
      await loading.dismiss();
    }
  }
}