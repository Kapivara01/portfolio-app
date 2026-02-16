import { Component, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  perfil: any = null;
  cargando: boolean = true;

  // Estructura completa sincronizada con Supabase
  perfilForm: any = {
    nombres_apellidos: '',
    subtitulos: '',
    trayectoria: '',
    formacion: '',
    telefono: '',
    direccion: '',
    correo: '',
    linkedin: '',
    foto_url: ''
  };

  constructor(
    private supabaseService: SupabaseService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.cargarPerfil();
  }

  async cargarPerfil() {
    this.cargando = true;
    try {
      const { data } = await this.supabaseService.getPerfil();
      if (data && data.length > 0) {
        this.perfil = data[0];
        this.perfilForm = { ...this.perfil };
      }
    } catch (e) {
      console.error("Error al cargar:", e);
    } finally {
      this.cargando = false;
    }
  }

  async guardarCambios() {
    try {
      if (this.perfil && this.perfil.id) {
        // Actualizar registro existente
        await this.supabaseService.updatePerfil(this.perfil.id, this.perfilForm);
      } else {
        // Crear nuevo registro si no existe
        await this.supabaseService.addPerfil(this.perfilForm);
      }
      
      const toast = await this.toastCtrl.create({
        message: 'Hoja de Vida actualizada con éxito',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();
      await this.cargarPerfil(); // Refrescar vista
    } catch (e) {
      console.error("Error al sincronizar:", e);
    }
  }
}