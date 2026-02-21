import { Component, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { AlertController, ToastController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: false,
})
export class AdminDashboardPage implements OnInit {
  
  // Variables de control de interfaz
  seccionActiva: string = 'perfil';
  editando: boolean = false;
  archivoSeleccionado: File | null = null;

  // Datos del perfil (CRUD Hoja de Vida) - ACTUALIZADO CON CAMPOS NUEVOS
  perfil: any = {
    id: null,
    nombres_apellidos: '',
    subtitulos: '',
    trayectoria: '',
    experiencia_laboral: '',    // <-- Agregado
    formacion: '',
    cursos: '',                 // <-- Agregado
    referencias_personales: '', // <-- Agregado
    telefono: '',               // Agregado para consistencia
    correo: '',                 // Agregado para consistencia
    direccion: '',              // Agregado para consistencia
    foto_url: ''
  };

  // Datos de Proyectos
  proyectos: any[] = [];
  nuevoProyecto: any = {
    title: '',
    category: '',
    image_url: ''
  };

  // Gestión de archivos
  listaArchivosReales: any[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    this.cargarDatosPerfil();
    this.cargarProyectos();
    this.cargarArchivos();
  }

  /* ==========================================================================
     1. SECCIÓN PERFIL (CRUD)
     ========================================================================== */
  async cargarDatosPerfil() {
    const { data } = await this.supabaseService.getPerfil();
    if (data && data.length > 0) {
      // Al usar Object.assign nos aseguramos de no perder los campos nuevos 
      // si la base de datos trae un registro antiguo que no los tenía.
      this.perfil = { ...this.perfil, ...data[0] }; 
    }
  }

  async guardarPerfil() {
    try {
      if (!this.perfil.id) {
        const { error } = await this.supabaseService.addPerfil(this.perfil);
        this.manejarRespuesta(error, 'Perfil creado correctamente');
      } else {
        const { id, ...datosSinId } = this.perfil;
        const { error } = await this.supabaseService.updatePerfil(id, datosSinId);
        this.manejarRespuesta(error, 'Perfil actualizado correctamente');
      }
      // Recargamos para asegurar que tenemos los datos frescos de la BD
      await this.cargarDatosPerfil(); 
    } catch (e) {
      this.mostrarToast('Error inesperado al guardar');
    }
  }

  async subirFotoPerfil(event: any) {
    const file = event.target.files[0];
    if (file) {
      const nombreArchivo = `${Date.now()}_${file.name}`;
      const { data, error } = await this.supabaseService.uploadFile('imagenes', `perfiles/${nombreArchivo}`, file);
      if (data) {
        const { data: urlData } = this.supabaseService.getPublicUrl('imagenes', `perfiles/${nombreArchivo}`);
        this.perfil.foto_url = urlData.publicUrl;
        this.mostrarToast('Foto de perfil cargada');
      }
    }
  }

  /* ==========================================================================
     2. SECCIÓN PORTAFOLIO (Sin cambios, manteniendo estabilidad)
     ========================================================================== */
  async cargarProyectos() {
    const { data } = await this.supabaseService.getProyectos();
    this.proyectos = data || [];
  }

  async guardarProyecto() {
    if (this.editando) {
      const { error } = await this.supabaseService.updateProyecto(this.nuevoProyecto.id, this.nuevoProyecto);
      this.manejarRespuesta(error, 'Proyecto actualizado');
    } else {
      const { error } = await this.supabaseService.addProyecto(this.nuevoProyecto);
      this.manejarRespuesta(error, 'Proyecto publicado');
    }
    this.limpiarFormulario();
    this.cargarProyectos();
  }

  async eliminarProyecto(id: number) {
    const { error } = await this.supabaseService.deleteProyecto(id);
    this.manejarRespuesta(error, 'Proyecto eliminado');
    this.cargarProyectos();
  }

  prepararEdicion(p: any) {
    this.nuevoProyecto = { ...p };
    this.editando = true;
  }

  limpiarFormulario() {
    this.nuevoProyecto = { title: '', category: '', image_url: '' };
    this.editando = false;
  }

  /* ==========================================================================
     3. SECCIÓN ARCHIVOS (Sin cambios)
     ========================================================================== */
  async cargarArchivos() {
    const { data } = await this.supabaseService.listLinks('imagenes', 'uploads');
    if (data) {
      this.listaArchivosReales = data.filter((f: any) => f.name !== '.emptyFolderPlaceholder');
    }
  }

  onFileSelected(event: any) {
    this.archivoSeleccionado = event.target.files[0];
  }

  async subirArchivo() {
    if (!this.archivoSeleccionado) return;
    const nombre = `${Date.now()}_${this.archivoSeleccionado.name}`;
    const { error } = await this.supabaseService.uploadFile('imagenes', `uploads/${nombre}`, this.archivoSeleccionado);
    if (!error) {
      this.mostrarToast('Archivo cargado con éxito');
      this.cargarArchivos();
    }
  }

  async borrarArchivoDashboard(nombre: string) {
    const { error } = await this.supabaseService.deleteFile('imagenes', [`uploads/${nombre}`]);
    if (!error) {
      this.mostrarToast('Archivo borrado');
      this.cargarArchivos();
    }
  }

  compartirArchivo(nombre: string) {
    const { data } = this.supabaseService.getPublicUrl('imagenes', `uploads/${nombre}`);
    console.log('URL para compartir:', data.publicUrl);
    this.mostrarToast('URL copiada a consola');
  }

  /* ==========================================================================
     4. SESIÓN Y UTILS
     ========================================================================== */
  async cerrarSesion() {
    await this.supabaseService.signOut();
    this.navCtrl.navigateRoot('/home');
  }

  async manejarRespuesta(error: any, msj: string) {
    if (error) {
      this.mostrarToast('Error: ' + error.message);
    } else {
      this.mostrarToast(msj);
    }
  }

  async mostrarToast(msj: string) {
    const toast = await this.toastCtrl.create({ message: msj, duration: 2000 });
    toast.present();
  }
}