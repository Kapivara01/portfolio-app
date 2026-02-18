import { Component, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit { // <-- Ya corregí el doble "export" aquí
  perfil: any = null;
  cargando: boolean = true;

  // Estructura sincronizada con Supabase incluyendo el nuevo campo de cursos
  perfilForm: any = {
    nombres_apellidos: '',
    subtitulos: '',
    trayectoria: '',
    formacion: '',
    cursos: '', // <--- NUEVO CAMPO PARA CURSOS Y DIPLOMADOS
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
        // Cargamos los datos existentes y aseguramos que 'cursos' no sea nulo
        this.perfilForm = { ...this.perfil };
        if (!this.perfilForm.cursos) this.perfilForm.cursos = '';
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
      const errorToast = await this.toastCtrl.create({
        message: 'Error al guardar: verifica la conexión o la base de datos',
        duration: 3000,
        color: 'danger'
      });
      await errorToast.present();
    }
  }
}