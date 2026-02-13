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

  // Opción A: Enlace al correo
  async signInWithMagicLink(email: string) {
    return await this.supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: window.location.origin + '/admin-dashboard'
      }
    });
  }

  // Opción B: Contraseña tradicional
  async signInWithPassword(email: string, pass: string) {
    return await this.supabase.auth.signInWithPassword({
      email: email,
      password: pass,
    });
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  // --- BASE DE DATOS (PROYECTOS) ---
  async getProyectos() {
    return await this.supabase
      .from('proyectos')
      .select('*')
      .order('id', { ascending: false });
  }

  async addProyecto(proyecto: any) {
    // Importante: Enviar como array [proyecto]
    return await this.supabase
      .from('proyectos')
      .insert([proyecto]);
  }
}