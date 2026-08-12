import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MongoService } from 'src/app/services/mongo.service';

@Component({
  selector: 'app-portafolio',
  templateUrl: './portfolio.page.html',
  styleUrls: ['./portfolio.page.scss'],
  standalone: false,
})
export class PortafolioPage implements OnInit {
  proyectos: any[] = [];
  proyectosFiltrados: any[] = [];
  filtroCategoria: string = 'Todos';

  constructor(
    private mongoService: MongoService, 
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  async ionViewWillEnter() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    try {
      const response: any = await this.mongoService.getCollection('proyectos').toPromise();
      
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

      // Asignación directa basada en el título o categoría del documento
      this.proyectos = docs.map((p: any) => {
        const titulo = (p.titulo || p.title || '').toUpperCase();
        const categoria = (p.categoria || p.category || '').toUpperCase();

        let archivoImg = 'informatica.png';

        // Si es de telecomunicaciones o menciona GPON/Redes en el título o categoría
        if (titulo.includes('GPON') || titulo.includes('RED') || titulo.includes('TELECOM') || categoria.includes('TELECOM')) {
          archivoImg = 'telecomunicaciones.png';
        }

        return {
          ...p,
          imagenUrlLocal: 'assets/images/' + archivoImg
        };
      });

      this.aplicarFiltro();
    } catch (error) {
      console.error('Error al cargar los proyectos desde MongoDB:', error);
    }
    this.cdr.detectChanges();
  }

  segmentChanged(event: any) {
    this.filtroCategoria = event.detail.value;
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    if (this.filtroCategoria === 'Todos') {
      this.proyectosFiltrados = this.proyectos;
    } else {
      const buscado = this.filtroCategoria.toUpperCase().replace('.', '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      
      this.proyectosFiltrados = this.proyectos.filter(p => {
        const cat = (p.category || p.categoria || "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const desc = (p.description || p.descripcion || "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        return cat.includes(buscado) || desc.includes(buscado);
      });
    }
    this.cdr.detectChanges();
  }
}