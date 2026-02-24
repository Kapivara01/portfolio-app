import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController } from '@ionic/angular';
import { SupabaseService } from 'src/app/services/supabase.service';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-gestion-cv',
  templateUrl: './gestion-cv.page.html',
  styleUrls: ['./gestion-cv.page.scss'],
  standalone: false,
})
export class GestionCvPage implements OnInit {
  perfil: any = {};

  constructor(
    private supabaseService: SupabaseService,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController
  ) {}

  async ngOnInit() {
    const { data } = await this.supabaseService.getPerfil();
    if (data && data.length > 0) {
      this.perfil = data[0];
    }
  }

  async generarPDF() {
    const loader = await this.loadingCtrl.create({ message: 'Creando reporte final...' });
    await loader.present();

    const dd: any = {
      pageSize: 'A4',
      content: [
        { text: (this.perfil.nombres_apellidos || 'ING. JORGE LINARES').toUpperCase(), fontSize: 22, bold: true, color: '#1a5276' },
        { text: (this.perfil.subtitulos || 'Ingeniero').toUpperCase(), fontSize: 12, bold: true, color: '#444' },
        { canvas: [{ type: 'line', x1: 0, y1: 15, x2: 515, y2: 15, lineWidth: 2, lineColor: '#1a5276' }] },
        { text: '\nRESUMEN', style: 'tit' },
        { text: this.perfil.trayectoria || 'Sin datos', fontSize: 10 },
        { text: '\nEXPERIENCIA', style: 'tit' },
        { text: this.perfil.experiencia_laboral || 'Sin datos', fontSize: 10 },
        { text: '\nREFERENCIAS', style: 'tit' },
        { text: this.perfil.referencias_personales || 'Sin datos', fontSize: 10 }
      ],
      styles: { tit: { fontSize: 12, bold: true, color: '#1a5276', margin: [0, 10, 0, 5] } }
    };

    pdfMake.createPdf(dd).download(`CV_LINARES_FINAL.pdf`);
    await loader.dismiss();
  }

  regresar() {
    this.navCtrl.back();
  }
}