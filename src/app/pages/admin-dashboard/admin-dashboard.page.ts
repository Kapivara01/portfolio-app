import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
})
export class AdminDashboardPage implements OnInit {
  seccionActiva: string = 'portafolio';
  cargando: boolean = false;
  proyectos: any[] = []; // Lista de proyectos

  nuevoProyecto = {
    title: '',
    category: '',
    description: '',
    image_url: ''
  };

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.cargarProyectos();
  }

  async cargarProyectos() {
    const { data, error } = await this.supabaseService.getProyectos();
    if (error) {
      console.error('Error al obtener proyectos:', error);
    } else {
      this.proyectos = data || [];
    }
  }

  async guardarProyecto() {
    if (!this.nuevoProyecto.title) {
      alert('Por favor, ingresa un título.');
      return;
    }

    this.cargando = true;
    const proyectoParaGuardar = {
      ...this.nuevoProyecto,
      user_id: '10cd155f-092d-481c-baae-f3adc02e5bc0' // Tu ID de Admin
    };

    try {
      const { error } = await this.supabaseService.addProyecto(proyectoParaGuardar);
      if (error) {
        alert('Error al guardar: ' + error.message);
      } else {
        alert('¡Proyecto guardado con éxito!');
        this.limpiarFormulario();
        this.cargarProyectos(); 
      }
    } catch (err) {
      alert('Error inesperado.');
    } finally {
      this.cargando = false;
    }
  }

  // ESTA ES LA FUNCIÓN QUE FALTABA Y CAUSABA EL ERROR
  async eliminarProyecto(id: any) {
    if (confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      try {
        // Nota: Por ahora solo avisamos, para borrar de la DB 
        // necesitaríamos una función extra en el servicio.
        alert('Botón de borrar presionado para el ID: ' + id);
        
        // Refrescamos para asegurar que el error visual desaparezca
        this.cargarProyectos();
      } catch (err) {
        console.error(err);
      }
    }
  }

  limpiarFormulario() {
    this.nuevoProyecto = { title: '', category: '', description: '', image_url: '' };
  }
}