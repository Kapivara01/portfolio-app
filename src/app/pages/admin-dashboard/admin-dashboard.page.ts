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
  seccionActiva: string = 'perfil';
  editando: boolean = false;

  // PERFIL COMPLETO: Restaurado según versión estable 44d7af4
  perfil: any = {
    id: null, nombres_apellidos: '', subtitulos: '', trayectoria: '', formacion: '',
    foto_url: '', telefono: '', direccion: '', correo: '', linkedin: '',
    cursos: '', experiencia_laboral: '', referencias_personales: ''
  };

  // PORTAFOLIO COMPLETO
  proyectos: any[] = [];
  nuevoProyecto: any = { id: null, title: '', category: '', image_url: '', phase: '', description: '' };
  
  // REPORTE COMPLETO
  reporte: any = { titulo: '', subtitulo: '', contenido_detalle: '', experiencia_profesional: '' };
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

    const { data: rData } = await this.supabaseService.getHojaDeVida();
    if (rData) this.reporte = { ...this.reporte, ...rData };

    const { data: fData } = await this.supabaseService.listLinks('imagenes', 'uploads');
    if (fData) this.listaArchivosReales = fData.filter((f: any) => f.name !== '.emptyFolderPlaceholder');
  }

  async guardarPerfil() {
    const { id, ...datos } = this.perfil;
    await this.supabaseService.updatePerfil(id, datos);
    this.mostrarToast('✅ Perfil Web actualizado.');
    await this.cargarTodo();
  }

  async guardarProyecto() {
    if (this.editando) await this.supabaseService.updateProyecto(this.nuevoProyecto.id, this.nuevoProyecto);
    else await this.supabaseService.addProyecto(this.nuevoProyecto);
    this.limpiarForm();
    await this.cargarTodo();
  }

  async guardarReporte() {
    await this.supabaseService.updateHojaDeVida(this.reporte);
    this.mostrarToast('✅ Reporte sincronizado.');
  }

  imprimirReporte() {
    const win = window.open('', '_blank');
    win?.document.write(`<html><body style="padding:40px;font-family:sans-serif;"><h1>${this.reporte.titulo}</h1><h3>${this.reporte.subtitulo}</h3><hr><p>${this.reporte.contenido_detalle}</p><p>${this.reporte.experiencia_profesional}</p></body></html>`);
    win?.document.close();
    win?.print();
  }

  async eliminarProyecto(id: any) {
    const alert = await this.alertCtrl.create({
      header: 'Borrar', message: '¿Eliminar proyecto?',
      buttons: [{ text: 'No' }, { text: 'Sí', handler: async () => {
        await this.supabaseService.deleteProyecto(id);
        await this.cargarTodo();
      }}]
    });
    await alert.present();
  }

  async borrarArchivoDashboard(nombre: string) {
    await this.supabaseService.deleteFile('imagenes', [`uploads/${nombre}`]);
    await this.cargarTodo();
  }

  prepararEdicion(p: any) { this.nuevoProyecto = { ...p }; this.editando = true; this.seccionActiva = 'portafolio'; }
  limpiarForm() { this.nuevoProyecto = { id: null, title: '', category: '', image_url: '', phase: '', description: '' }; this.editando = false; }
  async cerrarSesion() { await this.supabaseService.signOut(); this.navCtrl.navigateRoot('/home'); }
  async mostrarToast(msj: string) { const t = await this.toastCtrl.create({ message: msj, duration: 2000 }); t.present(); }
}