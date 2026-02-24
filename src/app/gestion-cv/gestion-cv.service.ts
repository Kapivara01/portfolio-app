// Copia y pega esto dentro de gestion-cv.page.ts
import { Component, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service'; // Asegúrate que la ruta sea correcta

@Component({
  selector: 'app-gestion-cv',
  templateUrl: './gestion-cv.page.html',
  styleUrls: ['./gestion-cv.page.scss'],
})
export class GestionCvPage implements OnInit {

  constructor(private supabaseSvc: SupabaseService) { }

  ngOnInit() {
    this.cargarDatosActuales();
  }

  // Esta función llama al "Cerebro" (supabase.service.ts) para traer lo que ya guardaste
  async cargarDatosActuales() {
    const { data, error } = await this.supabaseSvc.getHojaDeVida();
    if (data) {
      console.log("Datos de la tabla hoja_de_vida_pro cargados", data);
      // Aquí el formulario se llenará automáticamente con lo que haya en la base de datos
    }
  }
}