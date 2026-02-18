import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CvDataService {
  private supabase: SupabaseClient;

  constructor() {
    // Corregido: accedemos a environment.supabase.url y .key
    this.supabase = createClient(environment.supabase.url, environment.supabase.key);
  }

  async agregarDatoCV(dato: any) {
    const { data, error } = await this.supabase
      .from('hoja_de_vida_pro')
      .insert([dato]);
    if (error) throw error;
    return data;
  }
}