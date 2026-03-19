import { Component, OnInit } from '@angular/core';
import { GestionCvService } from './gestion-cv.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-gestion-cv',
  templateUrl: './gestion-cv.page.html',
  styleUrls: ['./gestion-cv.page.scss'],
})
export class GestionCvPage implements OnInit {
  
  // Objeto vinculado al CRUD (debe coincidir con Supabase)
  perfilData: any = {
    user_id: '10cd155f-092d-481c-baae-f3adc02e5bc0',
    nombres_apellidos: '',
    trayectoria: '',
    formacion: '',
    experiencia_laboral: '',
    cursos: '',
    referencias_personales: ''
  };

  constructor(
    private cvService: GestionCvService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) { }

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    try {
      const res = await this.cvService.getPerfilPrincipal(this.perfilData.user_id);
      if (res && res.data) {
        this.perfilData = { ...this.perfilData, ...res.data };
      }
    } catch (e) { console.error("Error al cargar:", e); }
  }

  // ESTA ES LA FUNCIÓN QUE FALTABA PARA EL CRUD
  async sincronizar() {
    const loader = await this.loadingCtrl.create({ message: 'Guardando datos...' });
    await loader.present();
    try {
      const { error } = await this.cvService.actualizarPerfil(this.perfilData);
      if (error) throw error;
      
      const toast = await this.toastCtrl.create({
        message: '¡Datos actualizados con éxito!',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (e: any) {
      alert("Error al guardar: " + e.message);
    } finally {
      loader.dismiss();
    }
  }

  imprimirPDF() {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(20);
    doc.text(this.perfilData.nombres_apellidos || 'HOJA DE VIDA', 15, y);
    y += 15;

    const secciones = [
      { titulo: 'TRAYECTORIA', contenido: this.perfilData.trayectoria },
      { titulo: 'FORMACIÓN', contenido: this.perfilData.formacion },
      { titulo: 'EXPERIENCIA', contenido: this.perfilData.experiencia_laboral },
      { titulo: 'CURSOS', contenido: this.perfilData.cursos }
    ];

    secciones.forEach(sec => {
      if (sec.contenido) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(sec.titulo, 15, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        const lines = doc.splitTextToSize(sec.contenido, 170);
        doc.text(lines, 15, y);
        y += (lines.length * 7) + 10;
      }
    });

    doc.save('Reporte_Final.pdf');
  }
}