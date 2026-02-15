import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
})
export class AdminDashboardPage implements OnInit {
  seccionActiva: string = 'portafolio';
  proyectos: any[] = [];
  editando: boolean = false;
  idProyectoAEditar: number | null = null;

  nuevoProyecto = {
    title: '',
    category: '',
    description: '',
    image_url: ''
  };

  constructor(
    private supabaseService: SupabaseService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.cargarProyectos();
  }

  async cargarProyectos() {
    const { data, error } = await this.supabaseService.getProyectos();
    if (!error) {
      this.proyectos = data || [];
    }
  }

  async guardarProyecto() {
    if (!this.nuevoProyecto.title || !this.nuevoProyecto.category) {
      this.mostrarToast('Por favor completa los campos obligatorios');
      return;
    }

    if (this.editando && this.idProyectoAEditar) {
      const { error } = await this.supabaseService.updateProyecto(this.idProyectoAEditar, this.nuevoProyecto);
      if (!error) {
        this.mostrarToast('✅ Proyecto actualizado');
        this.limpiarFormulario();
      }
    } else {
      const { error } = await this.supabaseService.addProyecto(this.nuevoProyecto);
      if (!error) {
        this.mostrarToast('🚀 Proyecto creado');
        this.limpiarFormulario();
      }
    }
    this.cargarProyectos();
  }

  prepararEdicion(p: any) {
    this.editando = true;
    this.idProyectoAEditar = p.id;
    this.nuevoProyecto = {
      title: p.title,
      category: p.category,
      description: p.description,
      image_url: p.image_url
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async eliminarProyecto(id: number) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar?',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        { text: 'No' },
        {
          text: 'Sí, borrar',
          handler: async () => {
            await this.supabaseService.deleteProyecto(id);
            this.cargarProyectos();
          }
        }
      ]
    });
    await alert.present();
  }

  limpiarFormulario() {
    this.editando = false;
    this.idProyectoAEditar = null;
    this.nuevoProyecto = { title: '', category: '', description: '', image_url: '' };
  }

  async mostrarToast(msg: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000 });
    toast.present();
  }
}