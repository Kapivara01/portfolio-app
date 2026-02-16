import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { AlertController, ToastController, NavController, LoadingController } from '@ionic/angular';

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

  // Variables para Gestión de Archivos e IA
  archivoSeleccionado: File | null = null;
  nombreArchivo: string = '';

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
    private navCtrl: NavController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.cargarProyectos();
  }

  // --- GESTIÓN DE PROYECTOS ---
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
      this.mostrarToast('Por favor completa los campos obligatorios', 'warning');
      return;
    }

    if (this.editando && this.idProyectoAEditar) {
      const { error } = await this.supabaseService.updateProyecto(this.idProyectoAEditar, this.nuevoProyecto);
      if (!error) {
        this.mostrarToast('✅ Proyecto actualizado', 'success');
        this.limpiarFormulario();
      }
    } else {
      const { error } = await this.supabaseService.addProyecto(this.nuevoProyecto);
      if (!error) {
        this.mostrarToast('🚀 Proyecto creado', 'success');
        this.limpiarFormulario();
      }
    }
    this.cargarProyectos();
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

  // --- GESTIÓN DE ARCHIVOS (SUBIDA A STORAGE) ---
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      this.nombreArchivo = file.name;
    }
  }

  async subirArchivo() {
    if (!this.archivoSeleccionado) {
      this.mostrarToast('Selecciona un archivo primero', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Subiendo a la nube...' });
    await loading.present();

    try {
      // Creamos una ruta única en el Storage
      const filePath = `uploads/${Date.now()}_${this.nombreArchivo}`;
      
      const { data, error } = await this.supabaseService.uploadFile(
        'imagenes', // Asegúrate de que el Bucket en Supabase se llame 'imagenes'
        filePath, 
        this.archivoSeleccionado
      );

      if (error) throw error;

      this.mostrarToast('¡Archivo subido correctamente!', 'success');
      this.archivoSeleccionado = null;
      this.nombreArchivo = '';
      
    } catch (error: any) {
      this.mostrarToast('Error en la carga: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  // --- UTILIDADES ---
  async cerrarSesion() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar Sesión',
      message: '¿Desea salir del panel?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salir',
          handler: async () => {
            await this.supabaseService.signOut();
            this.navCtrl.navigateRoot('/admin-login');
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

  async mostrarToast(msg: string, color: string = 'dark') {
    const toast = await this.toastCtrl.create({ 
      message: msg, 
      duration: 2000,
      color: color 
    });
    toast.present();
  }
}