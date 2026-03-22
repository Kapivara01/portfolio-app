import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  public appPages = [
    { title: 'Inicio', url: '/home', icon: 'home' },
    { title: 'Perfil', url: '/profile', icon: 'person' },
    { title: 'Portafolio', url: '/portfolio', icon: 'briefcase' },
    { title: 'Motor IA', url: '/ai-engine', icon: 'hardware-chip' },
    { title: 'Administrador', url: '/admin/login', icon: 'lock-closed' },
  ];

  // Variables para el calendario y reloj
  fechaActual: string = '';
  horaActual: string = '';

  constructor() { }

  ngOnInit() {
    this.actualizarReloj();
    // Actualiza la hora cada segundo
    setInterval(() => {
      this.actualizarReloj();
    }, 1000);
  }

  actualizarReloj() {
    const ahora = new Date();
    // Formato de fecha para Venezuela
    const opciones: any = { weekday: 'long', day: 'numeric', month: 'long' };
    this.fechaActual = ahora.toLocaleDateString('es-VE', opciones);
    
    // Formato de hora (12 horas con AM/PM)
    this.horaActual = ahora.toLocaleTimeString('es-VE', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  }
}