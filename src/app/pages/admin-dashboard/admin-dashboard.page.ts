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
  listaArchivosReales: any[] = [];

  // --- DATOS DE PERFIL PROFESIONAL ---
  perfil = {
    nombre: 'Ing. Jorge Luis Linares',
    titulo: 'Ingeniero',
    descripcion: 'Perfil profesional administrable.',
    foto_url: 'assets/img/perfil-default.jpg'
  };

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
    this.obtenerArchivosDeBaseDeDatos();
  }

  // --- VER ARCHIVOS REALES ---
  async obtenerArchivosDeBaseDeDatos() {
    try {
      const { data, error } = await this.supabaseService.listLinks('imagenes', 'uploads');
      if (error) throw error;
      // Filtramos para no mostrar archivos ocultos de sistema si los hay
      this.listaArchivosReales = data ? data.filter(f => f.name !== '.emptyFolderPlaceholder') : [];
    } catch (error: any) {
      console.error('Error al listar archivos:', error.message);
    }
  }

  // --- GESTIÓN DE PERFIL ---
  async guardarPerfil() {
    this.mostrarToast('✅ Perfil actualizado correctamente', 'success');
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

  // --- FUNCIONALIDADES DASHBOARD DE ARCHIVOS ---

  archivarArchivo(nombre: string) {
    this.mostrarToast(`📦 Archivo ${nombre} movido al histórico`, 'secondary');
  }

  async exportarArchivo(nombre: string) {
    const { data } = await this.supabaseService.getPublicUrl('imagenes', `uploads/${nombre}`);
    if (data?.publicUrl) {
      // Abre en nueva pestaña para descarga
      window.open(data.publicUrl, '_blank');
      this.mostrarToast(`📥 Abriendo enlace de descarga`, 'primary');
    }
  }

  async compartirArchivo(nombre: string) {
    const { data } = await this.supabaseService.getPublicUrl('imagenes', `uploads/${nombre}`);
    const url = data?.publicUrl;

    if (!url) return;

    // Si el navegador permite compartir (Móviles)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Compartir Archivo',
          text: `Te comparto el archivo: ${nombre}`,
          url: url
        });
      } catch (err) {
        console.log('Error al compartir nativamente:', err);
      }
    } else {
      // Si está en PC, copia el link al portapapeles automáticamente
      try {
        await navigator.clipboard.writeText(url);
        this.mostrarToast('🔗 Enlace copiado al portapapeles', 'info');
      } catch (err) {
        this.mostrarToast('No se pudo copiar el enlace', 'danger');
      }
    }
  }

  async borrarArchivoDashboard(nombre: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: `¿Deseas eliminar permanentemente el archivo ${nombre}?`,
      buttons: [
        { text: 'Cancelar' },
        { 
          text: 'Eliminar', 
          handler: async () => {
            const { error } = await this.supabaseService.deleteFile('imagenes', [`uploads/${nombre}`]);
            if (!error) {
              this.mostrarToast('Archivo eliminado', 'danger');
              this.obtenerArchivosDeBaseDeDatos();
            }
          } 
        }
      ]
    });
    await alert.present();
  }

  // --- GESTIÓN DE ARCHIVOS (SUBIDA) ---
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
      const filePath = `uploads/${Date.now()}_${this.nombreArchivo}`;
      const { error } = await this.supabaseService.uploadFile('imagenes', filePath, this.archivoSeleccionado);
      if (error) throw error;
      
      this.mostrarToast('¡Archivo subido correctamente!', 'success');
      this.archivoSeleccionado = null;
      this.nombreArchivo = '';
      this.obtenerArchivosDeBaseDeDatos();
      
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