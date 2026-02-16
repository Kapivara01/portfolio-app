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

  // Soporte para archivos y perfil
  async uploadFile(bucket: string, fileName: string, file: File) {
    return await this.supabase.storage.from(bucket).upload(fileName, file);
  }

  getPublicUrl(bucket: string, fileName: string) {
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  }
}