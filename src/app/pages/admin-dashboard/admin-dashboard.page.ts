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
    const { data: pData } = await this.supabaseService.getPerfil();
    if (pData && pData.length > 0) {
      this.perfil = { ...this.perfil, ...pData[0] };
      this.reporte.titulo = this.perfil.nombres_apellidos;
      this.reporte.contenido_detalle = this.perfil.trayectoria;
      this.reporte.experiencia_profesional = this.perfil.experiencia_laboral;
    }
    const { data: prData } = await this.supabaseService.getProyectos();
    this.proyectos = prData || [];
    const { data: fData } = await this.supabaseService.listLinks('imagenes', 'uploads');
    if (fData) this.listaArchivosReales = fData.filter((f: any) => f.name !== '.emptyFolderPlaceholder');
  }

  // --- CRUD PERFIL ---
  async guardarPerfil() {
    const { id, ...datos } = this.perfil;
    await this.supabaseService.updatePerfil(id, datos);
    this.mostrarToast('✅ Perfil actualizado correctamente.');
    await this.cargarTodo();
  }

  // --- CRUD PROYECTOS ---
  async guardarProyecto() {
    if (this.editando) {
      await this.supabaseService.updateProyecto(this.nuevoProyecto.id, this.nuevoProyecto);
      this.mostrarToast('✅ Proyecto actualizado.');
    } else {
      await this.supabaseService.addProyecto(this.nuevoProyecto);
      this.mostrarToast('✅ Proyecto añadido.');
    }
    this.limpiarForm();
    await this.cargarTodo();
  }

  prepararEdicion(p: any) {
    this.nuevoProyecto = { ...p };
    this.editando = true;
    this.seccionActiva = 'portafolio';
  }

  async eliminarProyecto(id: any) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Estás seguro de eliminar este proyecto?',
      buttons: [
        { text: 'Cancelar' },
        { text: 'Eliminar', handler: async () => {
            await this.supabaseService.deleteProyecto(id);
            await this.cargarTodo();
          }
        }
      ]
    });
    await alert.present();
  }

  // --- CRUD REPORTES/PDF ---
  async guardarReporte() {
    const datosMapeados = {
      nombres_apellidos: this.reporte.titulo,
      trayectoria: this.reporte.contenido_detalle,
      experiencia_laboral: this.reporte.experiencia_profesional
    };
    await this.supabaseService.updatePerfil(this.perfil.id, datosMapeados);
    this.mostrarToast('✅ Reporte sincronizado con el perfil.');
    await this.cargarTodo();
  }

  async borrarArchivoDashboard(nombre: string) {
    await this.supabaseService.deleteFile('imagenes', [`uploads/${nombre}`]);
    await this.cargarTodo();
  }

  // --- LÓGICA DEL PDF (CORREGIDA) ---
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
      } catch (e) {
        doc.rect(marginX, y, 25, 30, 'S');
      }
    }

    const headerX = 45;
    doc.setFontSize(18);
    doc.setTextColor(0, 51, 153);
    doc.text((this.perfil.nombres_apellidos || 'ING. JORGE LINARES').toUpperCase(), headerX, y + 8);
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(this.perfil.subtitulos || 'INGENIERO', headerX, y + 14);
    
    doc.setFontSize(8.5);
    doc.setTextColor(0, 0, 0);
    doc.text(`Telf: ${this.perfil.telefono || ''} | Email: ${this.perfil.correo || ''}`, headerX, y + 20);
    const linesDir = doc.splitTextToSize(`Dirección: ${this.perfil.direccion || ''}`, 145);
    doc.text(linesDir, headerX, y + 25);

    y = 52;
    doc.setDrawColor(0, 51, 153);
    doc.line(marginX, y, 195, y);
    y += 8;

    const secciones = [
      { t: 'RESUMEN PROFESIONAL', c: this.perfil.trayectoria },
      { t: 'FORMACIÓN ACADÉMICA', c: this.perfil.formacion },
      { t: 'EXPERIENCIA LABORAL', c: this.perfil.experiencia_laboral },
      { t: 'CURSOS Y CERTIFICACIONES', c: this.perfil.cursos }
    ];

    secciones.forEach(s => {
      if (s.c) {
        if (y > 275) { doc.addPage(); y = 15; }
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 51, 153);
        doc.text(s.t, marginX, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        const lines = doc.splitTextToSize(s.c.trim(), contentWidth);
        doc.text(lines, marginX, y);
        y += (lines.length * 4.5) + 6; 
      }
    });

    doc.save(`CV_Jorge_Linares.pdf`);
  }

  // --- UTILIDADES ---
  limpiarForm() { 
    this.nuevoProyecto = { id: null, title: '', category: '', image_url: '', phase: '', description: '' }; 
    this.editando = false; 
  }

  async cerrarSesion() { 
    await this.supabaseService.signOut(); 
    this.navCtrl.navigateRoot('/home'); 
  }

  async mostrarToast(msj: string) { 
    const t = await this.toastCtrl.create({ message: msj, duration: 2000 }); 
    t.present(); 
  }
}