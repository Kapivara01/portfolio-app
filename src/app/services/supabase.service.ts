import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.key);
  }

  // Obtener proyectos
  async getProyectos() {
    return await this.supabase.from('portfolio_items').select('*').order('id', { ascending: false });
  }

  // Añadir proyecto
  async addProyecto(proyecto: any) {
    const p = { ...proyecto, user_id: '10cd155f-092d-481c-baae-f3adc02e5bc0' };
    return await this.supabase.from('portfolio_items').insert([p]);
  }

  // Actualizar proyecto (Limpia datos automáticos para evitar errores)
  async updateProyecto(id: number, datos: any) {
    const { id: _, created_at: __, ...soloDatos } = datos;
    return await this.supabase.from('portfolio_items').update(soloDatos).eq('id', id);
  }

  // Eliminar proyecto
  async deleteProyecto(id: number) {
    return await this.supabase.from('portfolio_items').delete().eq('id', id);
  }
}