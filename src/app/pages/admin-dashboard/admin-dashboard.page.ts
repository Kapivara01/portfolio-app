import { Component, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { AlertController, ToastController, NavController } from '@ionic/angular';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: false,
})
export class AdminDashboardPage implements OnInit {
  seccionActiva: string = 'perfil';
  editando: boolean = false;

  perfil: any = {
    id: null, nombres_apellidos: '', subtitulos: '', trayectoria: '', formacion: '',
    foto_url: '', telefono: '', direccion: '', correo: '', linkedin: '',
    cursos: '', experiencia_laboral: '', referencias_personales: ''
  };

  proyectos: any[] = [];
  // Estructura interna para el formulario
  nuevoProyecto: any = { id: null, title: '', category: '', image_url: '', phase: '', description: '' };
  reporte: any = { titulo: '', contenido_detalle: '', experiencia_profesional: '' };
  listaArchivosReales: any[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) {}

  async ngOnInit() { await this.cargarTodo(); }

  async cargarTodo() {
    // 1. Cargar Perfil
    const { data: pData } = await this.supabaseService.getPerfil();
    if (pData && pData.length > 0) {
      this.perfil = { ...this.perfil, ...pData[0] };
      this.reporte.titulo = this.perfil.nombres_apellidos;
      this.reporte.contenido_detalle = this.perfil.trayectoria;
      this.reporte.experiencia_profesional = this.perfil.experiencia_laboral;
    }

    // 2. Cargar Proyectos desde la tabla portfolio_items
    const { data: prData } = await this.supabaseService.getProyectos();
    this.proyectos = prData || [];

    // 3. Cargar Archivos con Limpieza de Nombre
    const { data: fData } = await this.supabaseService.listLinks('imagenes', 'uploads');
    if (fData) {
      this.listaArchivosReales = fData
        .filter((f: any) => f.name !== '.emptyFolderPlaceholder')
        .map((f: any) => {
          const { data } = this.supabaseService.getPublicUrl('imagenes', `uploads/${f.name}`);
          const partes = f.name.split('_');
          const nombreLimpio = partes.length > 1 ? partes.slice(1).join('_') : f.name;

          return { 
            ...f, 
            url: data.publicUrl,
            nombreMostrar: nombreLimpio 
          };
        });
    }
  }

  // --- GESTIÓN DE ARCHIVOS ---
  async subirArchivoDashboard(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const loader = await this.toastCtrl.create({ message: 'Subiendo archivo...', duration: 1000 });
    await loader.present();

    const filePath = `uploads/${Date.now()}_${file.name}`;
    const { error } = await this.supabaseService.uploadFile('imagenes', filePath, file);

    if (error) {
      this.mostrarToast('❌ Error al subir: ' + error.message);
    } else {
      this.mostrarToast('✅ Archivo subido con éxito.');
      await this.cargarTodo();
    }
  }

  async borrarArchivoDashboard(nombreReal: string) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Archivo',
      message: `¿Deseas borrar definitivamente este archivo?`,
      buttons: [
        { text: 'Cancelar' },
        { text: 'Borrar', handler: async () => {
            await this.supabaseService.deleteFile('imagenes', [`uploads/${nombreReal}`]);
            this.mostrarToast('Archivo eliminado.');
            await this.cargarTodo();
          }
        }
      ]
    });
    await alert.present();
  }

  compartirArchivo(archivo: any) {
    const shareData = {
      title: 'Archivo de ' + this.perfil.nombres_apellidos,
      text: `Te comparto: ${archivo.nombreMostrar}`,
      url: archivo.url
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => this.fallbackCompartir(archivo.url));
    } else {
      this.fallbackCompartir(archivo.url);
    }
  }

  private fallbackCompartir(url: string) {
    window.open(`mailto:?subject=Archivo Compartido&body=Puedes verlo aquí: ${url}`, '_self');
  }

  incorporarAFuncionalidad(archivo: any) {
    this.nuevoProyecto.image_url = archivo.url;
    this.seccionActiva = 'portafolio';
    this.mostrarToast('URL vinculada al formulario de Proyecto.');
  }

  // --- CRUD PERFIL Y PROYECTOS ---
  async guardarPerfil() {
    const { id, ...datos } = this.perfil;
    await this.supabaseService.updatePerfil(id, datos);
    this.mostrarToast('✅ Perfil actualizado.');
    await this.cargarTodo();
  }

  async guardarProyecto() {
    if (!this.nuevoProyecto.title || !this.nuevoProyecto.category) {
      this.mostrarToast('⚠️ Título y Categoría son obligatorios.');
      return;
    }

    // MAPEO QUIRÚRGICO: Aseguramos que los nombres coincidan con las columnas de tu imagen
    const datosParaSupabase = {
      title: this.nuevoProyecto.title,
      description: this.nuevoProyecto.description || '',
      category: this.nuevoProyecto.category, // 'INFORMATICA' o 'TELECOM'
      image_url: this.nuevoProyecto.image_url || '',
      project_url: this.nuevoProyecto.phase || '' // Usamos el campo phase para project_url
    };

    try {
      if (this.editando) {
        await this.supabaseService.updateProyecto(this.nuevoProyecto.id, datosParaSupabase);
        this.mostrarToast('✅ Proyecto actualizado.');
      } else {
        const { error } = await this.supabaseService.addProyecto(datosParaSupabase);
        if (error) throw error;
        this.mostrarToast('✅ Proyecto guardado en portfolio_items.');
      }
      this.limpiarForm();
      await this.cargarTodo();
    } catch (error: any) {
      this.mostrarToast('❌ Error al guardar: ' + error.message);
      console.error(error);
    }
  }

  prepararEdicion(p: any) {
    // Mapeo inverso para que el formulario reconozca los datos de la DB
    this.nuevoProyecto = { 
      id: p.id,
      title: p.title,
      category: p.category,
      image_url: p.image_url,
      phase: p.project_url, // project_url vuelve al campo de fase
      description: p.description
    };
    this.editando = true;
    this.seccionActiva = 'portafolio';
  }

  async eliminarProyecto(id: any) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Estás seguro de eliminar este proyecto?',
      buttons: [ { text: 'Cancelar' }, { text: 'Eliminar', handler: async () => { 
        await this.supabaseService.deleteProyecto(id); await this.cargarTodo(); 
      } } ]
    });
    await alert.present();
  }

  async guardarReporte() {
    const datosMapeados = {
      nombres_apellidos: this.reporte.titulo,
      trayectoria: this.reporte.contenido_detalle,
      experiencia_laboral: this.reporte.experiencia_profesional
    };
    await this.supabaseService.updatePerfil(this.perfil.id, datosMapeados);
    this.mostrarToast('✅ Reporte sincronizado.');
    await this.cargarTodo();
  }

  private getImageDataUrl(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      img.onerror = (err) => reject(err);
      img.src = url;
    });
  }

  async imprimirReporte() {
    const doc = new jsPDF();
    let y = 15;
    const marginX = 15;
    const contentWidth = 175;

    if (this.perfil.foto_url) {
      try {
        const base64Img = await this.getImageDataUrl(this.perfil.foto_url);
        doc.addImage(base64Img, 'JPEG', marginX, y, 25, 30);
      } catch (e) { doc.rect(marginX, y, 25, 30, 'S'); }
    }

    const headerX = 45;
    doc.setFontSize(18);
    doc.setTextColor(0, 51, 153);
    doc.text((this.perfil.nombres_apellidos || 'ING. JORGE LINARES').toUpperCase(), headerX, y + 8);
    doc.setFontSize(10);
    doc.text(this.perfil.subtitulos || 'INGENIERO', headerX, y + 14);
    
    y = 52;
    doc.setDrawColor(0, 51, 153);
    doc.line(marginX, y, 195, y);
    y += 10;

    const secciones = [
      { t: 'RESUMEN PROFESIONAL', c: this.perfil.trayectoria },
      { t: 'FORMACIÓN ACADÉMICA', c: this.perfil.formacion },
      { t: 'EXPERIENCIA LABORAL', c: this.perfil.experiencia_laboral },
      { t: 'CURSOS Y CERTIFICACIONES', c: this.perfil.cursos }
    ];

    secciones.forEach(s => {
      if (s.c) {
        if (y > 270) { doc.addPage(); y = 15; }
        doc.setFontSize(12); doc.setFont("helvetica", "bold");
        doc.text(s.t, marginX, y);
        y += 5;
        doc.setFont("helvetica", "normal"); doc.setFontSize(9);
        const lines = doc.splitTextToSize(s.c.trim(), contentWidth);
        doc.text(lines, marginX, y);
        y += (lines.length * 4.5) + 6; 
      }
    });

    doc.save(`CV_Jorge_Linares.pdf`);
  }

  limpiarForm() { 
    this.nuevoProyecto = { id: null, title: '', category: '', image_url: '', phase: '', description: '' }; 
    this.editando = false; 
  }

  async cerrarSesion() { await this.supabaseService.signOut(); this.navCtrl.navigateRoot('/home'); }

  async mostrarToast(msj: string) { 
    const t = await this.toastCtrl.create({ message: msj, duration: 2000 }); 
    t.present(); 
  }
}



