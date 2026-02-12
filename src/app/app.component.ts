import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  public appPages = [
    { title: 'Home', url: '/home', icon: 'home' },
    { title: 'Profile', url: '/profile', icon: 'person' },
    { title: 'Portfolio', url: '/portfolio', icon: 'briefcase' },
    { title: 'AI Engine', url: '/ai-engine', icon: 'hardware-chip' },
    { title: 'Admin', url: '/admin/login', icon: 'lock-closed' },
  ];
  constructor() { }
}
