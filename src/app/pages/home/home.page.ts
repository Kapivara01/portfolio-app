import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, 
  IonButton, IonContent, IonDatetime 
} from '@ionic/angular/standalone';
import { MongoService } from '../../services/mongo.service';

@Component({
  selector: 'app-calendario-modal',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Agenda y Consulta</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrar()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding ion-text-center">
      <p style="color: #64748b; font-weight: 500; margin-bottom: 15px;">Selecciona una fecha para tu consulta:</p>
      <ion-datetime presentation="date" style="margin: 0 auto;"></ion-datetime>
    </ion-content>
  `,
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, 
    IonButton, IonContent, IonDatetime
  ]
})
export class CalendarioModalComponent {
  constructor(private modalController: ModalController) {}

  cerrar() {
    this.modalController.dismiss();
  }
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  // Nota: HomePage NO es standalone porque se declara en home.module.ts
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

  constructor(
    private mongoService: MongoService,
    private modalController: ModalController
  ) {}

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
        },
        (error: any) => console.error(`Error cargando ${col}:`, error)
      );
    });
  }

  async abrirCalendario() {
    const modal = await this.modalController.create({
      component: CalendarioModalComponent,
      cssClass: 'calendario-modal-class',
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint: 0.5
    });
    await modal.present();
  }
}