import { Component, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { AlertController, ToastController, NavController } from '@ionic/angular';

// --- MOTOR DE PDF ---
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: false,
})
export class AdminDashboardPage implements OnInit {
  
  seccionActiva: string = 'perfil';
  editando: boolean = false;
  archivoSeleccionado: File | null = null;

  perfil: any = {
    id: null, nombres_apellidos: '', subtitulos: '', trayectoria: '', formacion: '',
    foto_url: '', user_id: null, telefono: '', direccion: '', correo: '',
    linkedin: '', cursos: '', experiencia_laboral: '', referencias_personales: ''
  };

  proyectos: any[] = [];
  nuevoProyecto: any = { title: '', category: '', image_url: '' };
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
    if (pData && pData.length > 0) this.perfil = { ...this.perfil, ...pData[0] };
    const { data: prData } = await this.supabaseService.getProyectos();
    this.proyectos = prData || [];
    const { data: fData } = await this.supabaseService.listLinks('imagenes', 'uploads');
    if (fData) this.listaArchivosReales = fData.filter((f: any) => f.name !== '.emptyFolderPlaceholder');
  }

  async exportarPDF() {
    this.mostrarToast('Generando reporte con estilos profesionales...');
    await this.cargarTodo();

    try {
      const motor: any = pdfMake;
      motor.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : (pdfFonts as any).vfs;
      let fotoBase64 = null;
      if (this.perfil.foto_url) {
        try { fotoBase64 = await this.getBase64ImageFromURL(this.perfil.foto_url); } catch (e) {}
      }

      const docDefinition: any = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        content: [
          {
            columns: [
              ...(fotoBase64 ? [{ image: fotoBase64, width: 85 }] : [{ canvas: [{ type: 'rect', x: 0, y: 0, w: 85, h: 85, color: '#f0f0f0' }] }]),
              {
                stack: [
                  { text: (this.perfil.nombres_apellidos || 'JORGE LUIS LINARES').toUpperCase(), style: 'headerMain' },
                  { text: (this.perfil.subtitulos || 'Ingeniero').toUpperCase(), style: 'subheader' },
                  { text: `\n✉️ Correo: ${this.perfil.correo || ''}`, fontSize: 10 },
                  { text: `🔗 LinkedIn: ${this.perfil.linkedin || ''}`, fontSize: 10, color: '#1a5276' },
                  { text: `📍 ${this.perfil.direccion || ''}`, fontSize: 8, color: '#666' }
                ], margin: [20, 0, 0, 0]
              }
            ]
          },
          { canvas: [{ type: 'line', x1: 0, y1: 15, x2: 515, y2: 15, lineWidth: 2, lineColor: '#1a5276' }] },
          { text: '', margin: [0, 10] },
          ...this.dibujarSeccion('TRAYECTORIA LABORAL (RESUMEN)', this.perfil.trayectoria),
          ...this.dibujarSeccion('EXPERIENCIA PROFESIONAL (DETALLES)', this.perfil.experiencia_laboral),
          ...this.dibujarSeccion('FORMACIÓN ACADÉMICA', this.perfil.formacion),
          ...this.dibujarSeccion('CURSOS Y CERTIFICACIONES', this.perfil.cursos),
          ...this.dibujarSeccion('REFERENCIAS PERSONALES', this.perfil.referencias_personales)
        ],
        styles: {
          headerMain: { fontSize: 22, bold: true, color: '#1a5276' },
          subheader: { fontSize: 12, bold: true, color: '#444', margin: [0, 2, 0, 5] },
          tituloSeccion: { fontSize: 12, bold: true, color: '#1a5276', decoration: 'underline', margin: [0, 15, 0, 5] },
          textoSeccion: { fontSize: 10, alignment: 'justify', lineHeight: 1.3 }
        }
      };
      motor.createPdf(docDefinition).download(`HV_FINAL_${this.perfil.nombres_apellidos}.pdf`);
    } catch (e) { this.mostrarToast('Error al procesar el diseño del PDF.'); }
  }

  private dibujarSeccion(titulo: string, contenido: string) {
    return [
      { text: titulo, style: 'tituloSeccion' },
      { text: contenido || 'Información no disponible.', style: 'textoSeccion' }
    ];
  }
async guardarPerfil() {
    const { id, ...datos } = this.perfil;
    const { error } = await this.supabaseService.updatePerfil(id, datos);
    if (!error) { this.mostrarToast('Perfil actualizado en la nube.'); await this.cargarTodo(); }
  }

  async subirFotoPerfil(event: any) {
    const file = event.target.files[0];
    if (file) {
      const path = `perfiles/${Date.now()}_${file.name}`;
      await this.supabaseService.uploadFile('imagenes', path, file);
      const { data } = this.supabaseService.getPublicUrl('imagenes', path);
      this.perfil.foto_url = data.publicUrl;
      this.mostrarToast('Foto vinculada correctamente.');
    }
  }

  async guardarProyecto() {
    if (this.editando) await this.supabaseService.updateProyecto(this.nuevoProyecto.id, this.nuevoProyecto);
    else await this.supabaseService.addProyecto(this.nuevoProyecto);
    this.limpiarFormulario(); await this.cargarTodo();
  }

  async eliminarProyecto(id: number) { await this.supabaseService.deleteProyecto(id); await this.cargarTodo(); }
  prepararEdicion(p: any) { this.nuevoProyecto = { ...p }; this.editando = true; this.seccionActiva = 'portafolio'; }
  limpiarFormulario() { this.nuevoProyecto = { title: '', category: '', image_url: '' }; this.editando = false; }
  onFileSelected(event: any) { this.archivoSeleccionado = event.target.files[0]; }

  async subirArchivo() {
    if (!this.archivoSeleccionado) return;
    const nombre = `uploads/${Date.now()}_${this.archivoSeleccionado.name}`;
    await this.supabaseService.uploadFile('imagenes', nombre, this.archivoSeleccionado);
    await this.cargarTodo();
    this.mostrarToast('Archivo cargado al storage.');
  }

  async borrarArchivoDashboard(nombre: string) {
    await this.supabaseService.deleteFile('imagenes', [`uploads/${nombre}`]);
    await this.cargarTodo();
  }

  compartirArchivo(nombre: string) {
    const { data } = this.supabaseService.getPublicUrl('imagenes', `uploads/${nombre}`);
    if (data?.publicUrl) window.open(data.publicUrl, '_blank');
  }

  private getBase64ImageFromURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext('2d')?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = (e) => reject(e);
      img.src = url;
    });
  }

  async cerrarSesion() { await this.supabaseService.signOut(); this.navCtrl.navigateRoot('/home'); }
  async mostrarToast(msj: string) {
    const toast = await this.toastCtrl.create({ message: msj, duration: 2500, position: 'bottom' });
    toast.present();
  }
}