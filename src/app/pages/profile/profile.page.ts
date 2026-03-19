import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  
  // Variables de Perfil (Sincronización Tabla perfil_profesional)
  perfil: any = null;
  loading: boolean = true;

  // Variables de Proyectos (Sincronización Tabla portfolio_items)
  registros: any[] = [];
  proyectosCargando: boolean = true;

  constructor(private supabaseService: SupabaseService) { }

  async ngOnInit() {
    console.log('Iniciando Sincronización Total: Perfil + Proyectos');
    // Ejecutamos ambas cargas en paralelo para mayor velocidad
    await Promise.all([
      this.cargarPerfilDesdeBD(),
      this.cargarProyectosDesdeBD()
    ]);
  }

  // --- CARGA DE PERFIL PROFESIONAL ---
  async cargarPerfilDesdeBD() {
    this.loading = true;
    try {
      // Usamos tu función getPerfil() del servicio
      const { data, error } = await this.supabaseService.getPerfil();
      
      if (error) throw error;

      if (data && data.length > 0) {
        this.perfil = data[0]; // Extraemos el primer registro del array
        console.log('Perfil sincronizado con éxito:', this.perfil.nombres_apellidos);
      }
    } catch (err) {
      console.error('Error al sincronizar Perfil:', err);
    } finally {
      this.loading = false;
    }
  }

  // --- CARGA DE PROYECTOS (VISTA ESPEJO DASHBOARD) ---
  async cargarProyectosDesdeBD() {
    this.proyectosCargando = true;
    try {
      const { data, error } = await this.supabaseService.getProyectos();
      
      if (error) throw error;

      if (data) {
        // Mapeamos los datos para que coincidan con la estructura de tu HTML
        this.registros = data.map(item => ({
          titulo: item.titulo || 'Proyecto sin título',
          descripcion: item.descripcion || 'Sin descripción disponible',
          categoria: item.categoria || 'General',
          estado: item.estado || 'Activo'
        }));
        console.log('Proyectos cargados para Vista Fiel:', this.registros.length);
      }
    } catch (err) {
      console.error('Error al cargar proyectos:', err);
    } finally {
      this.proyectosCargando = false;
    }
  }

  // --- ACCIONES DE USUARIO ---
  solicitarCV() {
    if (!this.perfil) {
      console.warn('Perfil no cargado, usando datos por defecto.');
      window.location.href = `mailto:jlinares7616@gmail.com?subject=Solicitud de Hoja de Vida`;
      return;
    }

    const email = this.perfil.correo || 'jlinares7616@gmail.com';
    const nombre = this.perfil.nombres_apellidos || 'Ing. Jorge Luis Linares';
    const subject = encodeURIComponent(`Solicitud de Hoja de Vida - ${nombre}`);
    const body = encodeURIComponent(`Estimado ${nombre},\n\nHe visto su portafolio profesional y me gustaría solicitar su Hoja de Vida actualizada.\n\nQuedo atento a su respuesta.`);

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  // Función para formatear fechas si las llegas a usar en el HTML
  formatFecha(fecha: string) {
    return new Date(fecha).toLocaleDateString('es-VE');
  }
}