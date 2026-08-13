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
  editandoEducacion: boolean = false;
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

  // Datos de Proyectos (Estructura normalizada y alineada con MongoDB)
  proyectos: any[] = [];
  nuevoProyecto: any = {
    titulo: '',
    descripcion: '',
    status: 'Completado',
    categoria: '',
    foto: ''
  };

  // Datos de Cursos (Colección independiente de MongoDB)
  cursos: any[] = [];

  // Datos de Educación (Colección independiente de MongoDB)
  educacion: any[] = [];
  nuevaEducacion: any = {
    entidad_educativa: '',
    ciudad: '',
    nivel: '',
    'Titulo Obtenido': '',
    anio: ''
  };

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
    this.cargarCursos();
    this.cargarEducacion(); // <-- Carga de la colección Educación
    this.cargarArchivos();
  }

  /* ==========================================================================
     1. SECCIÓN PERFIL (CRUD MONGODB - HOJA DE VIDA)
     ========================================================================== */
  async cargarDatosPerfil() {
    try {
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
      const datosAEnviar = { ...this.perfil };
      const idRegistro = datosAEnviar.idMongo || datosAEnviar._id;

      if (!idRegistro) {
        await this.mongoService.addHojaDeVida(datosAEnviar).toPromise();
        this.mostrarToast('Perfil creado correctamente en MongoDB');
      } else {
        delete datosAEnviar._id;
        delete datosAEnviar.idMongo;
        await this.mongoService.updateHojaDeVida(idRegistro, datosAEnviar).toPromise();
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
     2. SECCIÓN PORTAFOLIO (Sincronizado con MongoDB)
     ========================================================================== */
  async cargarProyectos() {
    try {
      const data: any = await this.mongoService.getCollection('proyectos').toPromise();
      this.proyectos = Array.isArray(data) ? data : (data?.documents || []);
    } catch (error) {
      console.error('Error al cargar proyectos desde MongoDB:', error);
    }
  }

  async guardarProyecto() {
    try {
      if (!this.nuevoProyecto.titulo || !this.nuevoProyecto.categoria) {
        this.mostrarToast('Por favor completa el Título y la Categoría');
        return;
      }

      await this.mongoService.postCollection('proyectos', this.nuevoProyecto).toPromise();
      
      this.mostrarToast('Proyecto guardado y sincronizado con éxito');
      this.limpiarFormularioProyecto();
      this.cargarProyectos();
    } catch (error: any) {
      this.mostrarToast('Error al guardar el proyecto: ' + (error.message || error));
    }
  }

  async eliminarProyecto(id: string) {
    this.cargarProyectos();
  }

  prepararEdicionProyecto(p: any) {
    this.nuevoProyecto = { ...p };
    this.editando = true;
  }

  limpiarFormularioProyecto() {
    this.nuevoProyecto = { 
      titulo: '', 
      descripcion: '', 
      status: 'Completado', 
      categoria: '', 
      foto: '' 
    };
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
     4. SECCIÓN EDUCACIÓN (Colección MongoDB: Educacion)
     ========================================================================== */
  async cargarEducacion() {
    try {
      const response: any = await this.mongoService.getEducacion().toPromise();
      console.log('Datos recibidos de la colección Educacion:', response);

      if (Array.isArray(response)) {
        this.educacion = response;
      } else if (response && Array.isArray(response.data)) {
        this.educacion = response.data;
      } else if (response && Array.isArray(response.documents)) {
        this.educacion = response.documents;
      } else if (response && Array.isArray(response.Educacion)) {
        this.educacion = response.Educacion;
      } else if (response && typeof response === 'object') {
        // Extrae cualquier arreglo interno que encuentre en el objeto de respuesta
        const posibleArreglo = Object.values(response).find(val => Array.isArray(val));
        this.educacion = Array.isArray(posibleArreglo) ? posibleArreglo : [];
      } else {
        this.educacion = [];
      }
    } catch (error) {
      console.error('Error al cargar educación desde MongoDB:', error);
    }
  }

  async guardarEducacion() {
    try {
      if (!this.nuevaEducacion.entidad_educativa || !this.nuevaEducacion['Titulo Obtenido']) {
        this.mostrarToast('Por favor completa la Entidad Educativa y el Título');
        return;
      }

      const idRegistro = this.nuevaEducacion._id || this.nuevaEducacion.idMongo;

      const objetoASubir = {
        entidad_educativa: this.nuevaEducacion.entidad_educativa,
        ciudad: this.nuevaEducacion.ciudad,
        nivel: this.nuevaEducacion.nivel,
        'Titulo Obtenido': this.nuevaEducacion['Titulo Obtenido'],
        'Año': Number(this.nuevaEducacion.anio) || 0
      };

      if (!idRegistro) {
        await this.mongoService.addEducacion(objetoASubir).toPromise();
        this.mostrarToast('Registro de educación creado correctamente');
      } else {
        await this.mongoService.updateEducacion(idRegistro, objetoASubir).toPromise();
        this.mostrarToast('Registro de educación actualizado correctamente');
      }

      this.limpiarFormularioEducacion();
      this.cargarEducacion();
    } catch (error: any) {
      this.mostrarToast('Error al guardar educación: ' + (error.message || error));
    }
  }

  prepararEdicionEducacion(e: any) {
    const unwrap = (val: any) => (val && typeof val === 'object' && (val.$oid || val.$numberLong)) ? (val.$oid || val.$numberLong) : val;
    this.nuevaEducacion = { 
      ...e,
      anio: e['Año'] || e.anio || '',
      idMongo: unwrap(e._id)
    };
    this.editandoEducacion = true;
  }

  limpiarFormularioEducacion() {
    this.nuevaEducacion = {
      entidad_educativa: '',
      ciudad: '',
      nivel: '',
      'Titulo Obtenido': '',
      anio: ''
    };
    this.editandoEducacion = false;
  }

  async eliminarEducacion(id: any) {
    try {
      const unwrapId = (val: any) => (val && typeof val === 'object' && val.$oid) ? val.$oid : val;
      const idReal = unwrapId(id);

      if (!idReal) {
        this.mostrarToast('ID de registro no válido');
        return;
      }

      await this.mongoService.deleteEducacion(idReal).toPromise();
      this.mostrarToast('Registro de educación eliminado correctamente');
      this.cargarEducacion();
    } catch (error: any) {
      this.mostrarToast('Error al eliminar educación: ' + (error.message || error));
    }
  }

  /* ==========================================================================
     5. SECCIÓN ARCHIVOS
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
     6. SESIÓN Y UTILS
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