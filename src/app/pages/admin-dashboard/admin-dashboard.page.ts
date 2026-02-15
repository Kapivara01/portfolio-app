import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { AlertController, ToastController, NavController } from '@ionic/angular';

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
  filtroCategoria: string = 'Todos';

  nuevoProyecto = {
    title: '',
    category: '',
    description: '',
    image_url: ''
  };

  constructor(
    private supabaseService: SupabaseService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.cargarProyectos();
  }

  get proyectosFiltrados() {
    if (this.filtroCategoria === 'Todos') {
      return this.proyectos;
    }
    return this.proyectos.filter(p => p.category === this.filtroCategoria);
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

  // FUNCIÓN PARA CERRAR SESIÓN (LOGOUT)
  async cerrarSesion() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar Sesión',
      message: '¿Está seguro de que desea salir del panel administrativo?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salir',
          handler: async () => {
            await this.supabaseService.signOut();
            this.navCtrl.navigateRoot('/admin-login'); // Te manda de vuelta al login
          }
        }
      ]
    });
    await alert.present();
  }

  prepararEdicion(p: any) {
    this.editando = true;
    this.idProyectoAEditar = p.id;
    this.nuevoProyecto = { ...p };
    const content = document.querySelector('ion-content');
    if (content) content.scrollToTop(500);
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