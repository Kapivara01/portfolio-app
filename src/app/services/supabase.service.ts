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
  
  // Trae todos los proyectos de la tabla
  async getProyectos() {
    return await this.supabase
      .from('portfolio_items')
      .select('*')
      .order('id', { ascending: false });
  }

  // Guarda un nuevo proyecto (recuerda que el RLS debe estar desactivado o con permiso)
  async addProyecto(proyecto: any) {
    return await this.supabase
      .from('portfolio_items')
      .insert([proyecto]);
  }

  // --- FUNCIÓN AÑADIDA: Para eliminar proyectos ---
  async deleteProyecto(id: number) {
    return await this.supabase
      .from('portfolio_items')
      .delete()
      .eq('id', id);
  }
}