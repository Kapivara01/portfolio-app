import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  public appPages = [
    { title: 'Inicio', url: '/home', icon: 'home' },
    { title: 'Perfil', url: '/profile', icon: 'person' },
    { title: 'Portafolio', url: '/portfolio', icon: 'briefcase' },
    { title: 'Motor IA', url: '/ai-engine', icon: 'hardware-chip' },
    { title: 'Administrador', url: '/admin/login', icon: 'lock-closed' },
  ];
  constructor() { }
}
