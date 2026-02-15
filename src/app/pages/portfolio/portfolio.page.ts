import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service'; // Importamos el servicio

@Component({
  selector: 'app-portafolio',
  templateUrl: './portfolio.page.html',
  styleUrls: ['./portfolio.page.scss'],
})
export class PortafolioPage implements OnInit {

  categoriaActiva: string = 'Todas';
  
  // 1. Dejamos la lista vacía para que se llene con lo que hay en Supabase
  proyectos: any[] = [];

  // 2. Metemos el servicio en el constructor
  constructor(private supabaseService: SupabaseService) { }

  // 3. Al iniciar la página, llamamos a la nube
  ngOnInit() {
    this.obtenerDatosDeLaNube();
  }

  async obtenerDatosDeLaNube() {
    try {
      const { data, error } = await this.supabaseService.getProyectos();
      
      if (error) {
        console.error('Error al obtener datos:', error);
      } else {
        // 4. Aquí es donde ocurre la magia: 
        // 'proyectos' ahora tendrá lo que viste en el Table Editor
        this.proyectos = data || [];
      }
    } catch (err) {
      console.error('Error inesperado:', err);
    }
  }
}