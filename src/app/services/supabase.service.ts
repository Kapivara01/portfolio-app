import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private readonly MI_USER_ID = '10cd155f-092d-481c-baae-f3adc02e5bc0';

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.key);
  }

  /* --- CRUD PERFIL PROFESIONAL (Sincronizado con todas las columnas) --- */
  async getPerfil() {
    return await this.supabase
      .from('perfil_profesional')
      .select('*')
      .eq('user_id', this.MI_USER_ID)
      .order('id', { ascending: false })
      .limit(1);
  }

  async addPerfil(datos: any) {
    return await this.supabase
      .from('perfil_profesional')
      .insert([{ ...datos, user_id: this.MI_USER_ID }]);
  }

  async updatePerfil(id: any, datos: any) {
    return await this.supabase
      .from('perfil_profesional')
      .update(datos)
      .eq('id', id);
  }

  /* --- CRUD PORTAFOLIO / PROYECTOS (No borrar para no dañar Dashboard) --- */
  async getProyectos() {
    return await this.supabase.from('portfolio_items').select('*').order('id', { ascending: false });
  }

  async addProyecto(proyecto: any) {
    const p = { ...proyecto, user_id: this.MI_USER_ID };
    return await this.supabase.from('portfolio_items').insert([p]);
  }

  async updateProyecto(id: any, datos: any) {
    const { id: _, created_at: __, ...soloDatos } = datos;
    return await this.supabase.from('portfolio_items').update(soloDatos).eq('id', id);
  }

  async deleteProyecto(id: any) {
    return await this.supabase.from('portfolio_items').delete().eq('id', id);
  }

  /* --- GESTIÓN DE ARCHIVOS Y STORAGE (Crucial para el Dashboard) --- */
  async listLinks(bucket: string, folder: string) {
    return await this.supabase.storage.from(bucket).list(folder);
  }

  async uploadFile(bucket: string, fileName: string, file: File) {
    return await this.supabase.storage.from(bucket).upload(fileName, file);
  }

  async deleteFile(bucket: string, paths: string[]) {
    return await this.supabase.storage.from(bucket).remove(paths);
  }

  getPublicUrl(bucket: string, fileName: string) {
    return this.supabase.storage.from(bucket).getPublicUrl(fileName);
  }

  /* --- AUTENTICACIÓN --- */
  async signOut() {
    return await this.supabase.auth.signOut();
  }
}