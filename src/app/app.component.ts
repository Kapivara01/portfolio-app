import { Component, OnInit, HostListener } from '@angular/core'; // Añadimos HostListener aquí

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

  // Variables para el calendario, reloj e instalación
  fechaActual: string = '';
  horaActual: string = '';
  deferredPrompt: any;
  showInstallButton = true; // Lo ponemos en true para que lo veas de una vez

  constructor() { }

  ngOnInit() {
    this.actualizarReloj();
    setInterval(() => {
      this.actualizarReloj();
    }, 1000);
  }

  actualizarReloj() {
    const ahora = new Date();
    const opciones: any = { weekday: 'long', day: 'numeric', month: 'long' };
    this.fechaActual = ahora.toLocaleDateString('es-VE', opciones);
    this.horaActual = ahora.toLocaleTimeString('es-VE', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  }

  // --- LÓGICA DE INSTALACIÓN PWA ---

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(e: any) {
    e.preventDefault();
    this.deferredPrompt = e;
    this.showInstallButton = true;
  }

  installPWA() {
    if (!this.deferredPrompt) {
      alert("El navegador aún está preparando la instalación. Por favor, intenta de nuevo en unos segundos.");
      return;
    }
    this.deferredPrompt.prompt();
    this.deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        this.showInstallButton = false;
      }
      this.deferredPrompt = null;
    });
  }
} // <--- Asegúrate de que esta llave cierre todo al final
