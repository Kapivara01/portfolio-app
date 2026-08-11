import { Component, OnInit } from '@angular/core';
import { MongoService } from 'src/app/services/mongo.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  perfil: any = {};
  cursos: any[] = [];
  cargando: boolean = true;

  constructor(private mongoService: MongoService) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    try {
      this.cargando = true;
      
      // 1. Cargar Perfil de la Hoja de Vida
      const response: any = await this.mongoService.getCollection('hoja_de_vida').toPromise();
      let docs = Array.isArray(response) ? response : (response?.data || response?.documents || [response]);
      
      if (docs.length > 0) {
        const doc = docs[0];
        const unwrap = (val: any) => (val && typeof val === 'object' && (val.$oid || val.$numberLong)) ? (val.$oid || val.$numberLong) : (val !== undefined && val !== null ? val : '');

        this.perfil = {
          ...doc,
          nombre_y_apellido: unwrap(doc.nombre_y_apellido),
          Cedula: unwrap(doc.Cedula),
          civ: unwrap(doc.civ),
          Telefonos_contacto: unwrap(doc.Telefonos_contacto),
          Email: unwrap(doc.Email),
          direccion_hab: unwrap(doc.direccion_hab),
          lugar_de_nacimiento: unwrap(doc.lugar_de_nacimiento),
          nacionalidad: unwrap(doc.nacionalidad),
          fecha_de_nacimiento: unwrap(doc.fecha_de_nacimiento),
          Edad: unwrap(doc.Edad),
          estado_civil: unwrap(doc.estado_civil),
          Hijos: unwrap(doc.Hijos),
          Licencia: unwrap(doc.Licencia),
          perfil: unwrap(doc.perfil),
          aptitudes: unwrap(doc.aptitudes),
          Experiencia_laboral: unwrap(doc.Experiencia_laboral),
          // Carga el valor de la BD y si está vacío, asigna por defecto 'foto_url.jpg'
          foto_de_perfil: unwrap(doc.foto_de_perfil || doc.foto_url || doc.foto || doc.imagen) || 'foto_url.jpg'
        };
      }

      // 2. Cargar Cursos apuntando directamente al campo exacto de MongoDB
      const cursosData: any = await this.mongoService.getCursos().toPromise();
      let listaCursos = Array.isArray(cursosData) ? cursosData : (cursosData?.data || cursosData?.documents || []);

      this.cursos = listaCursos.map((c: any) => ({
        nombre: c['Nombre del evento'] || c.nombre || c.titulo || c.curso || 'Evento sin nombre'
      }));

    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      this.cargando = false;
    }
  }
}