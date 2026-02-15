import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
})
export class AdminDashboardPage {
  // Esta variable es la "llave" que activa las pestañas
  seccionActiva: string = 'portafolio';

  constructor() {}
}