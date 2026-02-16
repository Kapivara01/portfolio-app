import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { AlertController, ToastController, NavController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
})
export class AdminDashboardPage implements OnInit {
  seccionActiva: string = 'perfil'; // Iniciamos en perfil para probar los cambios
  proyectos: any[] = [];
  editando: boolean = false;
  idProyectoAEditar: number | null = null;
  filtroCategoria: string = 'Todos';

  archivoSeleccionado: File | null = null;
  nombreArchivo: string = '';
  listaArchivosReales: any[] = [];

  // ACTUALIZADO: Incluimos los nuevos campos de contacto
  perfil: any = {
    nombres_apellidos: '',
    subtitulos: '',
    trayectoria: '',
    formacion: '',
    foto_url: '',
    telefono: '',
    correo: '',
    direccion: ''
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
    this.cargarPerfil();
    this.obtenerArchivosDeBaseDeDatos();
  }

  async cargarPerfil() {
    try {
      const { data, error } = await this.supabaseService.getPerfil();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) this.perfil = data;
    } catch (error: any) {
      console.error('Error al cargar perfil:', error.message);
    }
  }

  // NUEVA FUNCIÓN: Para subir la foto profesional a la carpeta 'perfil'
  async subirFotoPerfil(event: any) {
    const file = event.target.files[0];
    if (file) {
      const loading = await this.loadingCtrl.create({ message: 'Subiendo foto...' });
      await loading.present();
      try {
        const filePath = `perfil/${Date.now()}_${file.name}`;
        const { data, error } = await this.supabaseService.uploadFile('imagenes', filePath, file);
        
        if (error) throw error;

        const { data: urlData } = await this.supabaseService.getPublicUrl('imagenes', filePath);
        this.perfil.foto_url = urlData.publicUrl;
        this.mostrarToast('📸 Foto actualizada visualmente', 'success');
      } catch (error: any) {
        this.mostrarToast('Error al subir foto: ' + error.message, 'danger');
      } finally {
        loading.dismiss();
      }
    }
  }

  async guardarPerfil() {
    const loading = await this.loadingCtrl.create({ message: 'Guardando datos...' });
    await loading.present();
    try {
      // El 'upsert' interno usará el user_id (Unique) para actualizar la fila
      const { error } = await this.supabaseService.updatePerfil(this.perfil);
      if (error) throw error;
      this.mostrarToast('✅ Hoja de Vida y contacto actualizados', 'success');
    } catch (error: any) {
      this.mostrarToast('❌ Error: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  // --- MÉTODOS DE PROYECTOS Y ARCHIVOS (SE MANTIENEN IGUAL) ---

  async obtenerArchivosDeBaseDeDatos() {
    try {
      const { data, error } = await this.supabaseService.listLinks('imagenes', 'uploads');
      if (error) throw error;
      this.listaArchivosReales = data ? data.filter(f => f.name !== '.emptyFolderPlaceholder') : [];
    } catch (error: any) {
      console.error('Error al listar archivos:', error.message);
    }
  }

  get proyectosFiltrados() {
    return this.filtroCategoria === 'Todos' ? this.proyectos : this.proyectos.filter(p => p.category === this.filtroCategoria);
  }

  async cargarProyectos() {
    const { data, error } = await this.supabaseService.getProyectos();
    if (!error) this.proyectos = data || [];
  }

  async guardarProyecto() {
    if (!this.nuevoProyecto.title || !this.nuevoProyecto.category) {
      this.mostrarToast('Completa los campos obligatorios', 'warning');
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
  }

  async eliminarProyecto(id: number) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar?',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        { text: 'No' },
        { text: 'Sí, borrar', handler: async () => {
            await this.supabaseService.deleteProyecto(id);
            this.cargarProyectos();
          }
        }
      ]
    });
    await alert.present();
  }

  async compartirArchivo(nombre: string) {
    const { data } = await this.supabaseService.getPublicUrl('imagenes', `uploads/${nombre}`);
    const url = data?.publicUrl;
    if (!url) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Archivo', text: nombre, url: url });
      } catch (err) { console.log(err); }
    } else {
      await navigator.clipboard.writeText(url);
      this.mostrarToast('🔗 Enlace copiado', 'info');
    }
  }

  async borrarArchivoDashboard(nombre: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: `¿Eliminar permanentemente ${nombre}?`,
      buttons: [
        { text: 'Cancelar' },
        { text: 'Eliminar', handler: async () => {
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      this.nombreArchivo = file.name;
    }
  }

  async subirArchivo() {
    if (!this.archivoSeleccionado) return;
    const loading = await this.loadingCtrl.create({ message: 'Subiendo...' });
    await loading.present();
    try {
      const filePath = `uploads/${Date.now()}_${this.nombreArchivo}`;
      const { error } = await this.supabaseService.uploadFile('imagenes', filePath, this.archivoSeleccionado);
      if (error) throw error;
      this.mostrarToast('¡Archivo subido!', 'success');
      this.archivoSeleccionado = null;
      this.nombreArchivo = '';
      this.obtenerArchivosDeBaseDeDatos();
    } catch (error: any) {
      this.mostrarToast('Error: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async cerrarSesion() {
    await this.supabaseService.signOut();
    this.navCtrl.navigateRoot('/admin-login');
  }

  limpiarFormulario() {
    this.editando = false;
    this.idProyectoAEditar = null;
    this.nuevoProyecto = { title: '', category: '', description: '', image_url: '' };
  }

  async mostrarToast(msg: string, color: string = 'dark') {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, color: color });
    toast.present();
  }
}