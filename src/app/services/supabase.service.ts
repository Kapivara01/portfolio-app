import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.key
    );
  }

  // --- AUTENTICACIÓN ---
  get user() {
    return this.supabase.auth.getUser();
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  async signInWithPassword(email: string, pass: string) {
    return await this.supabase.auth.signInWithPassword({
      email: email,
      password: pass,
    });
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  // --- BASE DE DATOS (GESTIÓN DE PORTAFOLIO) ---
  
  // 1. OBTENER: Trae todos los proyectos de la tabla
  async getProyectos() {
    return await this.supabase
      .from('portfolio_items')
      .select('*')
      .order('id', { ascending: false });
  }

  // 2. CREAR: Guarda un nuevo proyecto
  async addProyecto(proyecto: any) {
    return await this.supabase
      .from('portfolio_items')
      .insert([proyecto]);
  }

  // 3. ACTUALIZAR: Modifica un proyecto que ya existe (NUEVA FUNCIÓN)
  async updateProyecto(id: number, datosActualizados: any) {
    return await this.supabase
      .from('portfolio_items')
      .update(datosActualizados)
      .eq('id', id);
  }

  // 4. ELIMINAR: Borra un proyecto definitivamente
  async deleteProyecto(id: number) {
    return await this.supabase
      .from('portfolio_items')
      .delete()
      .eq('id', id);
  }
}