import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-portafolio',
  templateUrl: './portfolio.page.html',
  styleUrls: ['./portfolio.page.scss'],
})
export class PortafolioPage implements OnInit {
  proyectos: any[] = [];
  proyectosFiltrados: any[] = [];
  filtroCategoria: string = 'Todos';

  constructor(
    private supabaseService: SupabaseService, 
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  async ionViewWillEnter() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    const { data, error } = await this.supabaseService.getProyectos();
    if (!error) {
      this.proyectos = data || [];
      this.aplicarFiltro();
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
      // Normalizamos: quitamos puntos, tildes y pasamos a mayúsculas
      const buscado = this.filtroCategoria.toUpperCase().replace('.', '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      
      this.proyectosFiltrados = this.proyectos.filter(p => {
        const cat = (p.category || p.categoria || "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const desc = (p.description || "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        // Si el valor del botón está contenido en la categoría o descripción, lo muestra
        return cat.includes(buscado) || desc.includes(buscado);
      });
    }
    this.cdr.detectChanges();
  }
}