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

  // Estructura completa sincronizada con Supabase (Actualizada con 3 nuevos campos)
  perfilForm: any = {
    nombres_apellidos: '',
    subtitulos: '',
    trayectoria: '',
    experiencia_laboral: '', // <-- Agregado
    formacion: '',
    cursos: '',              // <-- Agregado
    referencias_personales: '', // <-- Agregado
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
        // Al usar el operador spread (...), Angular tomará automáticamente
        // los valores de los nuevos campos desde la base de datos.
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
        // Actualizar registro existente incluyendo los nuevos campos
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
      await this.cargarPerfil(); // Refrescar vista para asegurar sincronización
    } catch (e) {
      console.error("Error al sincronizar:", e);
      const toast = await this.toastCtrl.create({
        message: 'Error al guardar los cambios',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }
}