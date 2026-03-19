import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GestionCvService {
  private supabase: SupabaseClient;

  constructor() {
    // CORRECCIÓN: Accedemos a .supabase.url y .supabase.key 
    // tal como aparecen en tu error de terminal.
    this.supabase = createClient(
      environment.supabase.url, 
      environment.supabase.key
    );
  }

  async getPerfilPrincipal(userId: string) {
    return await this.supabase
      .from('perfil_profesional')
      .select('*')
      .eq('user_id', userId)
      .single();
  }

  async actualizarPerfil(perfil: any) {
    return await this.supabase
      .from('perfil_profesional')
      .upsert(perfil);
  }
}