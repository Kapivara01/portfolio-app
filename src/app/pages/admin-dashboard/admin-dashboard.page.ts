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
  cargando: boolean = false;

  perfil: any = {
    id: null, nombres_apellidos: '', subtitulos: '', trayectoria: '', formacion: '',
    foto_url: '', telefono: '', direccion: '', correo: '', linkedin: '',
    github: '', disponibilidad: '', cursos: '', experiencia_laboral: '', referencias_personales: ''
  };

  proyectos: any[] = [];
  nuevoProyecto: any = { id: null, title: '', category: '', image_url: '', phase: 'Planificación' };
  reporte: any = { titulo: '', contenido_detalle: '' };
  listaArchivosReales: any[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) {}

  async ngOnInit() { await this.cargarTodo(); }

  async cargarTodo() {
    this.cargando = true;
    try {
      const { data: pData } = await this.supabaseService.getPerfil();
      if (pData && pData.length > 0) {
        this.perfil = { ...this.perfil, ...pData[0] };
        this.reporte.titulo = this.perfil.nombres_apellidos;
        this.reporte.contenido_detalle = this.perfil.trayectoria;
      }
      const { data: prData } = await this.supabaseService.getProyectos();
      this.proyectos = prData || [];
      const { data: fData } = await this.supabaseService.listLinks('imagenes', 'uploads');
      if (fData) {
        this.listaArchivosReales = fData.filter((f: any) => f.name !== '.emptyFolderPlaceholder')
          .map((f: any) => {
            const { data } = this.supabaseService.getPublicUrl('imagenes', `uploads/${f.name}`);
            return { ...f, url: data.publicUrl, nombreMostrar: f.name.split('_').pop() };
          });
      }
    } finally { this.cargando = false; }
  }
  async guardarPerfil() {
    const { id, ...datos } = this.perfil;
    await this.supabaseService.updatePerfil(id, datos);
    this.mostrarToast('✅ Perfil Actualizado');
    await this.cargarTodo();
  }

  async guardarProyecto() {
    this.editando ? await this.supabaseService.updateProyecto(this.nuevoProyecto.id, this.nuevoProyecto) 
                  : await this.supabaseService.addProyecto(this.nuevoProyecto);
    this.limpiarForm();
    await this.cargarTodo();
    this.mostrarToast('✅ Portafolio Actualizado');
  }

  prepararEdicion(p: any) { this.nuevoProyecto = { ...p }; this.editando = true; this.seccionActiva = 'portafolio'; }
  async eliminarProyecto(id: any) { await this.supabaseService.deleteProyecto(id); await this.cargarTodo(); }

  async guardarReporte() {
    const datos = { nombres_apellidos: this.reporte.titulo, trayectoria: this.reporte.contenido_detalle };
    await this.supabaseService.updatePerfil(this.perfil.id, datos);
    this.mostrarToast('✅ Sincronizado');
    await this.cargarTodo();
  }

  async imprimirReporte() {
    const doc = new jsPDF();
    let y = 20;
    doc.setFillColor(0, 45, 91); doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255); doc.setFontSize(18);
    doc.text((this.perfil.nombres_apellidos || 'ING. JORGE LINARES').toUpperCase(), 15, 20);
    doc.setFontSize(10); doc.text(this.perfil.subtitulos || '', 15, 28);
    y = 55;
    const secciones = [
      { t: 'RESUMEN PROFESIONAL', c: this.perfil.trayectoria },
      { t: 'EXPERIENCIA LABORAL', c: this.perfil.experiencia_laboral },
      { t: 'FORMACIÓN ACADÉMICA', c: this.perfil.formacion },
      { t: 'REFERENCIAS', c: this.perfil.referencias_personales }
    ];
    secciones.forEach(s => {
      if (s.c) {
        doc.setFontSize(12); doc.setTextColor(0, 45, 91); doc.text(s.t, 15, y); y += 7;
        doc.setFontSize(9); doc.setTextColor(33);
        const lines = doc.splitTextToSize(s.c, 180); doc.text(lines, 15, y);
        y += (lines.length * 5) + 10;
        if (y > 275) { doc.addPage(); y = 20; }
      }
    });
    doc.save('CV_Jorge_Linares.pdf');
  }

  async subirArchivoDashboard(event: any) {
    const file = event.target.files[0]; if (!file) return;
    await this.supabaseService.uploadFile('imagenes', `uploads/${Date.now()}_${file.name}`, file);
    await this.cargarTodo();
    this.mostrarToast('✅ Archivo Subido');
  }

  async borrarArchivoDashboard(n: string) { await this.supabaseService.deleteFile('imagenes', [`uploads/${n}`]); await this.cargarTodo(); }
  incorporarAFuncionalidad(a: any) { this.nuevoProyecto.image_url = a.url; this.seccionActiva = 'portafolio'; this.mostrarToast('🔗 Vinculado'); }
  compartirArchivo(a: any) { window.open(a.url, '_blank'); }
  limpiarForm() { this.nuevoProyecto = { id: null, title: '', category: '', image_url: '', phase: 'Planificación' }; this.editando = false; }
  async cerrarSesion() { await this.supabaseService.signOut(); this.navCtrl.navigateRoot('/home'); }
  async mostrarToast(m: string) { const t = await this.toastCtrl.create({ message: m, duration: 2500 }); t.present(); }
}