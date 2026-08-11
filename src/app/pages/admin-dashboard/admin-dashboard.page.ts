import { Component, OnInit } from '@angular/core';
import { MongoService } from 'src/app/services/mongo.service'; // Servicio adaptado para MongoDB
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

  // Datos del perfil (Sincronizados con la colección hoja_de_vida de MongoDB)
  perfil: any = {
    _id: null,
    foto_de_perfil: '',
    nombre_y_apellido: '',
    direccion_hab: '',
    Email: '',
    Telefonos_contacto: '',
    lugar_de_nacimiento: '',
    nacionalidad: '',
    fecha_de_nacimiento: '',
    Edad: 0,
    estado_civil: '',
    Hijos: 0,
    Licencia: '',
    Cedula: 0,
    perfil: '',
    aptitudes: '',
    Experiencia_laboral: '',
    civ: '',
    educacion: []
  };

  // Datos de Proyectos
  proyectos: any[] = [];
  nuevoProyecto: any = {
    title: '',
    category: '',
    image_url: ''
  };

  // Datos de Cursos (Colección independiente de MongoDB)
  cursos: any[] = [];

  // Gestión de archivos
  listaArchivosReales: any[] = [];

  constructor(
    private mongoService: MongoService, // Inyección del servicio de MongoDB
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    this.cargarDatosPerfil();
    this.cargarProyectos();
    this.cargarCursos(); // <-- Carga de la colección cursos
    this.cargarArchivos();
  }

  /* ==========================================================================
     1. SECCIÓN PERFIL (CRUD MONGODB - HOJA DE VIDA)
     ========================================================================== */
  async cargarDatosPerfil() {
    try {
      // Usamos getCollection con el nombre exacto de la colección en la base de datos
      const response: any = await this.mongoService.getCollection('hoja_de_vida').toPromise();
      
      let docs = [];
      if (Array.isArray(response)) {
        docs = response;
      } else if (response?.data && Array.isArray(response.data)) {
        docs = response.data;
      } else if (response?.documents && Array.isArray(response.documents)) {
        docs = response.documents;
      } else if (response && typeof response === 'object') {
        docs = [response];
      }

      if (docs.length > 0) {
        const registro = docs[0];
        
        // Función auxiliar para extraer valores primitivos o tipos especiales de Mongo ($numberLong, $oid)
        const unwrap = (val: any) => (val && typeof val === 'object' && (val.$oid || val.$numberLong)) ? (val.$oid || val.$numberLong) : (val !== undefined && val !== null ? val : '');

        this.perfil = {
          ...registro,
          idMongo: unwrap(registro._id),
          foto_de_perfil: unwrap(registro.foto_de_perfil || registro.foto_url),
          nombre_y_apellido: unwrap(registro.nombre_y_apellido || registro.nombres_apellidos),
          Cedula: unwrap(registro.Cedula || registro.cedula),
          civ: unwrap(registro.civ),
          Telefonos_contacto: unwrap(registro.Telefonos_contacto || registro.telefono),
          Email: unwrap(registro.Email || registro.correo),
          direccion_hab: unwrap(registro.direccion_hab || registro.direccion),
          lugar_de_nacimiento: unwrap(registro.lugar_de_nacimiento),
          nacionalidad: unwrap(registro.nacionalidad),
          fecha_de_nacimiento: unwrap(registro.fecha_de_nacimiento),
          Edad: unwrap(registro.Edad || registro.edad),
          estado_civil: unwrap(registro.estado_civil),
          Hijos: unwrap(registro.Hijos || registro.hijos),
          Licencia: unwrap(registro.Licencia),
          perfil: unwrap(registro.perfil || registro.subtitulos),
          aptitudes: unwrap(registro.aptitudes || registro.cursos),
          Experiencia_laboral: unwrap(registro.Experiencia_laboral || registro.trayectoria)
        };
      }
    } catch (error) {
      console.error('Error cargando hoja de vida desde MongoDB:', error);
    }
  }

  async guardarPerfil() {
    try {
      // Prepara el objeto asegurando la estructura compatible con MongoDB
      const datosAEnviar = { ...this.perfil };
      const idRegistro = datosAEnviar.idMongo || datosAEnviar._id;

      if (!idRegistro) {
        const res = await this.mongoService.addHojaDeVida(datosAEnviar).toPromise();
        this.mostrarToast('Perfil creado correctamente en MongoDB');
      } else {
        delete datosAEnviar._id;
        delete datosAEnviar.idMongo;
        const res = await this.mongoService.updateHojaDeVida(idRegistro, datosAEnviar).toPromise();
        this.mostrarToast('Perfil sincronizado con MongoDB exitosamente');
      }
      this.cargarDatosPerfil();
    } catch (error: any) {
      this.mostrarToast('Error al guardar: ' + (error.message || error));
    }
  }

  async subirFotoPerfil(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.perfil.foto_de_perfil = file.name;
      this.mostrarToast('Nombre de archivo actualizado en el perfil');
    }
  }

  /* ==========================================================================
     2. SECCIÓN PORTAFOLIO
     ========================================================================== */
  async cargarProyectos() {
    // Mantén tu lógica de proyectos conectada según corresponda
  }

  async guardarProyecto() {
    this.limpiarFormulario();
    this.cargarProyectos();
  }

  async eliminarProyecto(id: number) {
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
     3. SECCIÓN CURSOS (Colección MongoDB: cursos)
     ========================================================================== */
  async cargarCursos() {
    try {
      const data: any = await this.mongoService.getCursos().toPromise();
      this.cursos = data || [];
    } catch (error) {
      console.error('Error al cargar cursos desde MongoDB:', error);
    }
  }

  /* ==========================================================================
     4. SECCIÓN ARCHIVOS
     ========================================================================== */
  async cargarArchivos() {
    // Lógica de archivos
  }

  onFileSelected(event: any) {
    this.archivoSeleccionado = event.target.files[0];
  }

  async subirArchivo() {
    if (!this.archivoSeleccionado) return;
    this.mostrarToast('Archivo cargado con éxito');
    this.cargarArchivos();
  }

  async borrarArchivoDashboard(nombre: string) {
    this.mostrarToast('Archivo borrado');
    this.cargarArchivos();
  }

  compartirArchivo(nombre: string) {
    this.mostrarToast('URL copiada a consola');
  }

  /* ==========================================================================
     5. SESIÓN Y UTILS
     ========================================================================== */
  async cerrarSesion() {
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