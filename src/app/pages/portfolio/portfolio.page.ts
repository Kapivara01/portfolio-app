import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-portafolio',
  templateUrl: './portfolio.page.html',
  styleUrls: ['./portfolio.page.scss'],
})
export class PortafolioPage implements OnInit {
  proyectos: any[] = [];
  filtroCategoria: string = 'Todos';

  constructor(private supabaseService: SupabaseService) {}

  async ionViewWillEnter() {
    const { data, error } = await this.supabaseService.getProyectos();
    if (!error) {
      this.proyectos = data || [];
      console.log('Datos cargados de Supabase:', this.proyectos); // Esto nos dirá en consola qué llega exactamente
    }
  }

  ngOnInit() {
    this.ionViewWillEnter();
  }

  get proyectosFiltrados() {
    if (this.filtroCategoria === 'Todos') {
      return this.proyectos;
    }
    
    // Función mejorada para limpiar texto de tildes y espacios
    const normalizar = (texto: string) => 
      texto ? texto.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

    const categoriaBuscada = normalizar(this.filtroCategoria);

    return this.proyectos.filter(p => {
      // Comprobamos ambos campos posibles de la base de datos
      const catProyecto = normalizar(p.category || p.categoria || "");
      return catProyecto === categoriaBuscada;
    });
  }

  segmentChanged(event: any) {
    this.filtroCategoria = event.detail.value;
  }
}