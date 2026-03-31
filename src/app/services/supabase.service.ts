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

  /* --- CRUD PERFIL PROFESIONAL --- */
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

  /* --- CRUD PORTAFOLIO / PROYECTOS --- */
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

  /* --- GESTIÓN DE REPORTE HOJA DE VIDA --- */
  async getHojaDeVida() {
    return await this.supabase
      .from('hoja_de_vida_pro')
      .select('*')
      .eq('user_id', this.MI_USER_ID)
      .maybeSingle(); 
  }

  async updateHojaDeVida(datos: any) {
    return await this.supabase
      .from('hoja_de_vida_pro')
      .upsert({ ...datos, user_id: this.MI_USER_ID });
  }

  /* --- SECCIÓN CURSOS NIOS --- */
  async getCursosNios() {
    return await this.supabase
      .from('cursos_nios')
      .select('*')
      .order('id', { ascending: true });
  }

  /* --- NUEVO: REGISTRO DE INTERACCIONES Y VISITAS --- */
  async registrarInteraccion(evento: string, detalles: any = {}) {
    return await this.supabase
      .from('interacciones')
      .insert([
        { 
          tipo_evento: evento, 
          user_id: this.MI_USER_ID,
          detalles: { 
            ...detalles,
            navegador: window.navigator.userAgent,
            fecha_local: new Date().toLocaleString()
          }
        }
      ]);
  }

  /* --- STORAGE Y OTROS --- */
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

  async signOut() {
    return await this.supabase.auth.signOut();
  }
  /* --- GESTIÓN DE INTERACCIONES WEB (SOLICITUDES Y CITAS) --- */

  // Esta función elimina el error de compilación del Dashboard
  async getInteracciones() {
    return await this.supabase
      .from('interacciones_web')
      .select('*')
      .order('fecha', { ascending: false });
  }

  // Esta función permite a los visitantes enviar datos desde la web
  async enviarSolicitudWeb(datos: any) {
    return await this.supabase
      .from('interacciones_web')
      .insert([datos]);
  }
}