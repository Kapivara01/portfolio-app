import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  // Guardamos tu ID de usuario como una constante para que sea más fácil de usar
  private readonly MI_USER_ID = '10cd155f-092d-481c-baae-f3adc02e5bc0';

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.key);
  }

  // --- NUEVAS FUNCIONES PARA EL PERFIL (HOJA DE VIDA) ---
  
  // Esta función sirve para traer tus datos desde la tabla perfil_profesional
  async getPerfil() {
    return await this.supabase
      .from('perfil_profesional')
      .select('*')
      .eq('user_id', this.MI_USER_ID)
      .single();
  }

  // Esta función sirve para guardar o actualizar tus datos en la tabla
  async updatePerfil(datos: any) {
    const datosCompletos = { ...datos, user_id: this.MI_USER_ID };
    return await this.supabase
      .from('perfil_profesional')
      .upsert(datosCompletos, { onConflict: 'user_id' });
  }

  // --- TUS FUNCIONES DE PROYECTOS (MANTENIDAS Y CORREGIDAS) ---

  async getProyectos() {
    return await this.supabase.from('portfolio_items').select('*').order('id', { ascending: false });
  }

  async addProyecto(proyecto: any) {
    const p = { ...proyecto, user_id: this.MI_USER_ID };
    return await this.supabase.from('portfolio_items').insert([p]);
  }

  async updateProyecto(id: number, datos: any) {
    const { id: _, created_at: __, ...soloDatos } = datos;
    return await this.supabase.from('portfolio_items').update(soloDatos).eq('id', id);
  }

  async deleteProyecto(id: number) {
    return await this.supabase.from('portfolio_items').delete().eq('id', id);
  }

  // --- GESTIÓN DE ARCHIVOS Y SESIÓN ---

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  async uploadFile(bucket: string, fileName: string, file: File) {
    return await this.supabase.storage.from(bucket).upload(fileName, file);
  }

  async listLinks(bucket: string, folder: string) {
    return await this.supabase.storage.from(bucket).list(folder, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });
  }

  getPublicUrl(bucket: string, fileName: string) {
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(fileName);
    return { data };
  }

  async deleteFile(bucket: string, paths: string[]) {
    return await this.supabase.storage.from(bucket).remove(paths);
  }
}