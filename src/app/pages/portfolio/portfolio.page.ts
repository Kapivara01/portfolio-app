import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-portafolio',
  templateUrl: './portfolio.page.html',
  styleUrls: ['./portfolio.page.scss'],
  standalone: false // Asegúrate de tener esto si no usas componentes standalone
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

  // CRUCIAL: Este evento de Ionic recarga los datos cada vez que entras a la pestaña
  async ionViewWillEnter() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    try {
      const { data, error } = await this.supabaseService.getProyectos();
      if (!error) {
        this.proyectos = data || [];
        this.aplicarFiltro();
      } else {
        console.error('Error de Supabase:', error.message);
      }
    } catch (err) {
      console.error('Error inesperado:', err);
    } finally {
      this.cdr.detectChanges();
    }
  }

  segmentChanged(event: any) {
    this.filtroCategoria = event.detail.value;
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    if (this.filtroCategoria === 'Todos') {
      this.proyectosFiltrados = this.proyectos;
    } else {
      // Filtramos comparando directamente con 'Informatica' o 'Telecomunicaciones'
      // que son los valores que configuramos en el ion-select del Dashboard
      this.proyectosFiltrados = this.proyectos.filter(p => {
        // Buscamos en 'category' (que es el campo que usa tu Dashboard)
        const categoriaProyecto = p.category || '';
        return categoriaProyecto === this.filtroCategoria;
      });
    }
    this.cdr.detectChanges();
  }
}