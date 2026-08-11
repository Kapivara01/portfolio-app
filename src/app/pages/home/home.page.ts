import { Component, OnInit } from '@angular/core';
import { MongoService } from '../../services/mongo.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  cursos: any[] = [];
  datos: any = {
    cursos: [],
    proyectos: [],
    Educacion: [],
    hoja_de_vida: [],
    informatica: [],
    telecomunicacion: [],
    categories: []
  };

  constructor(private mongoService: MongoService) {}

  ngOnInit() {
    this.cargarTodo();
  }

  cargarTodo() {
    const colecciones = Object.keys(this.datos);
    colecciones.forEach(col => {
      this.mongoService.getCollection(col).subscribe(
        (data: any) => {
          this.datos[col] = data;
          if (col === 'cursos') {
            this.cursos = data;
          }
          console.log(`${col} cargados:`, data);
        },
        (error: any) => console.error(`Error cargando ${col}:`, error)
      );
    });
  }
}