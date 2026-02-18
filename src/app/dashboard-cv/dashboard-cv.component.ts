import { Component, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ToastController } from '@ionic/angular';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-dashboard-cv',
  templateUrl: './dashboard-cv.component.html'
})
export class DashboardCvComponent implements OnInit {
  
  registros: any[] = [];
  editando: boolean = false;
  datoForm: any = { id: null, seccion: 'TEC_RADIOS', titulo: '', contenido_detalle: '', periodo_fecha: '' };

  constructor(private supabaseService: SupabaseService, private toastCtrl: ToastController) {}

  ngOnInit() { this.cargarDatosCV(); }

  async cargarDatosCV() {
    // 1. CARGA GARANTIZADA: Traemos todo de la tabla hoja_de_vida_pro
    const { data, error } = await (this.supabaseService as any).supabase
      .from('hoja_de_vida_pro')
      .select('*')
      .order('id', { ascending: true });
    
    if (!error) {
      this.registros = data || [];
    }
  }

  async guardar() {
    const cliente = (this.supabaseService as any).supabase;
    try {
      if (this.editando) {
        await cliente.from('hoja_de_vida_pro').update({
          seccion: this.datoForm.seccion,
          titulo: this.datoForm.titulo,
          contenido_detalle: this.datoForm.contenido_detalle,
          periodo_fecha: this.datoForm.periodo_fecha
        }).eq('id', this.datoForm.id);
        this.mostrarToast('✅ Registro actualizado');
      } else {
        await cliente.from('hoja_de_vida_pro').insert([this.datoForm]);
        this.mostrarToast('✅ Guardado exitosamente');
      }
      this.limpiar();
      await this.cargarDatosCV(); // Refresco inmediato
    } catch (err: any) { alert('Error: ' + err.message); }
  }

  prepararEdicion(item: any) { this.editando = true; this.datoForm = { ...item }; }

  async eliminar(id: any) {
    await (this.supabaseService as any).supabase.from('hoja_de_vida_pro').delete().eq('id', id);
    this.cargarDatosCV();
  }

  limpiar() { this.editando = false; this.datoForm = { id: null, seccion: 'TEC_RADIOS', titulo: '', contenido_detalle: '', periodo_fecha: '' }; }

  // --- REPORTE MAQUILLADO CON FOTO RECTANGULAR Y CARGA TOTAL ---
  async descargarPDF() {
    // Aseguramos que la lista esté actualizada antes de generar
    await this.cargarDatosCV();

    const doc = new jsPDF();
    const azulIngenieria = [0, 43, 91]; 

    // 1. ENCABEZADO AZUL PROFESIONAL
    doc.setFillColor(azulIngenieria[0], azulIngenieria[1], azulIngenieria[2]);
    doc.rect(0, 0, 210, 55, 'F'); 
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('ING. JORGE LINARES', 15, 20);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Especialista en Telecomunicaciones, Informática y Gerencia', 15, 28);
    doc.setFontSize(10);
    doc.text('Consultoría Técnica y Supervisión de Proyectos de Ingeniería', 15, 34);

    // 2. FOTO RECTANGULAR BIEN ENMARCADA
    try {
      const imgPath = 'assets/images/profile.jpg';
      // Marco blanco fino para la foto
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(1);
      doc.rect(154, 8, 38, 40, 'D'); // Dibuja solo el borde
      
      // La foto (Ajustada para que no se vea deforme)
      doc.addImage(imgPath, 'JPEG', 155, 9, 36, 38); 
    } catch (e) {
      console.warn('Imagen profile.jpg no encontrada');
    }

    let posicionY = 70;

    // 3. SECCIONES DINÁMICAS (Si no hay datos en una, no se muestra)
    const categorias = [
      { id: 'GERENCIA', nombre: 'EXPERIENCIA EN GERENCIA Y SUPERVISIÓN' },
      { id: 'TEC_RADIOS', nombre: 'TELECOMUNICACIONES E INFORMÁTICA' },
      { id: 'REFERENCIA', nombre: 'REFERENCIAS PROFESIONALES' }
    ];

    categorias.forEach(cat => {
      const itemsDeSeccion = this.registros.filter(r => r.seccion === cat.id);

      if (itemsDeSeccion.length > 0) {
        doc.setTextColor(azulIngenieria[0], azulIngenieria[1], azulIngenieria[2]);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(cat.nombre, 15, posicionY);
        
        doc.setDrawColor(azulIngenieria[0], azulIngenieria[1], azulIngenieria[2]);
        doc.setLineWidth(0.5);
        doc.line(15, posicionY + 2, 195, posicionY + 2);

        autoTable(doc, {
          startY: posicionY + 5,
          head: [['Título / Cargo', 'Institución / Detalle de Actividades', 'Año']],
          body: itemsDeSeccion.map(i => [i.titulo, i.contenido_detalle, i.periodo_fecha]),
          theme: 'striped',
          styles: { fontSize: 9, cellPadding: 4 },
          headStyles: { fillColor: [240, 240, 240], textColor: [40, 40, 40], fontStyle: 'bold' },
          columnStyles: {
            0: { cellWidth: 50, fontStyle: 'bold' },
            1: { cellWidth: 100 },
            2: { cellWidth: 30, halign: 'center' }
          },
          margin: { left: 15, right: 15 }
        });

        posicionY = (doc as any).lastAutoTable.finalY + 15;
      }
    });

    // Pie de página
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Portafolio Profesional Nattier 2026 - Generado Automáticamente', 15, 285);

    doc.save('Hoja_de_Vida_Ing_Jorge_Linares.pdf');
  }

  async mostrarToast(msj: string) {
    const toast = await this.toastCtrl.create({ message: msj, duration: 2500, position: 'top' });
    toast.present();
  }
}