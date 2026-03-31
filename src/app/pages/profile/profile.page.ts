import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  
  perfil: any = null;
  loading: boolean = true;

  constructor(
    private supabaseService: SupabaseService,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    await this.cargarPerfil();
    this.supabaseService.registrarInteraccion('VISITA_PERFIL');
  }

  async cargarPerfil() {
    this.loading = true;
    try {
      const { data, error } = await this.supabaseService.getPerfil();
      if (error) throw error;
      if (data && data.length > 0) {
        this.perfil = data[0];
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      this.loading = false;
    }
  }

  // NUEVA FUNCIÓN: Formulario interno para evitar que el usuario se pierda
  async solicitarCV() {
    const alert = await this.alertController.create({
      header: 'Solicitar Información',
      subHeader: 'Deje sus datos y el Ing. Linares le contactará',
      inputs: [
        { name: 'nombre', type: 'text', placeholder: 'Su nombre completo' },
        { name: 'contacto', type: 'text', placeholder: 'Correo o Teléfono' },
        { name: 'mensaje', type: 'textarea', placeholder: '¿Qué necesita? (CV, Cita, etc.)' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Enviar Solicitud',
          handler: async (data) => {
            if (!data.nombre || !data.contacto) {
              this.mostrarToast('Por favor, complete su nombre y contacto', 'warning');
              return false;
            }

            // Guardamos la solicitud directamente en Supabase
            const { error } = await this.supabaseService.registrarInteraccion('FORMULARIO_CONTACTO', {
              nombre: data.nombre,
              contacto: data.contacto,
              mensaje: data.mensaje
            });

            if (!error) {
              this.mostrarToast('¡Solicitud enviada con éxito! El Ing. le contactará pronto.', 'success');
            } else {
              this.mostrarToast('Error al enviar. Intente más tarde.', 'danger');
            }
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async mostrarToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }
}