import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { MongoService } from 'src/app/services/mongo.service';

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
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private mongoService: MongoService
  ) {}

  ngOnInit() {
    this.email = '';
    this.password = '';
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      color: color
    });
    await toast.present();
  }

  async onLogin() {
    if (!this.email || !this.password) {
      await this.mostrarToast('Por favor, completa todos los campos', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ 
      message: 'Validando acceso...' 
    });
    await loading.present();

    // Consumo directo mediante Observable para capturar la respuesta limpia del servidor
    this.mongoService.loginAdmin({
      email: this.email,
      password: this.password
    }).subscribe({
      next: async (response: any) => {
        await loading.dismiss();
        if (response && response.success) {
          await this.mostrarToast('¡Acceso autorizado!', 'success');
          this.email = '';
          this.password = '';
          this.router.navigate(['/admin/dashboard']);
        } else {
          await this.mostrarToast('Credenciales incorrectas', 'danger');
        }
      },
      error: async (err) => {
        await loading.dismiss();
        console.error('Error en el servidor:', err);
        // Si el servidor responde 401, informamos claramente
        if (err.status === 401) {
          await this.mostrarToast('Correo o contraseña incorrectos', 'danger');
        } else {
          await this.mostrarToast('Error de conexión con el backend', 'danger');
        }
      }
    });
  }
}