import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // Agregamos una llave específica para que el token no se confunda al cambiar de página
        storageKey: 'supabase.auth.token', 
        storage: window.localStorage 
      }
    });
  }

  // Mejoramos esta función para que devuelva la sesión activa directamente
  async getSession() {
    const { data } = await this.supabase.auth.getSession();
    return data.session;
  }

  async getProyectos() {
    return await this.supabase.from('portfolio_items').select('*').order('id', { ascending: false });
  }

  async addProyecto(proyecto: any) {
    const p = { ...proyecto, user_id: '10cd155f-092d-481c-baae-f3adc02e5bc0' };
    return await this.supabase.from('portfolio_items').insert([p]);
  }

  async updateProyecto(id: number, datos: any) {
    const { id: _, created_at: __, ...soloDatos } = datos;
    return await this.supabase.from('portfolio_items').update(soloDatos).eq('id', id);
  }

  async deleteProyecto(id: number) {
    return await this.supabase.from('portfolio_items').delete().eq('id', id);
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }
}