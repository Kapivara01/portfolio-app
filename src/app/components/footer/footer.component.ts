import { Component } from '@angular/core';
import { IonFooter, IonIcon, IonText } from '@ionic/angular/standalone'; // Se agregó IonText aquí
import { addIcons } from 'ionicons';
import { logoWhatsapp, paperPlane, logoLinkedin, logoGithub } from 'ionicons/icons';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [IonFooter, IonIcon, IonText] // Se agregó IonText aquí para quitar el error
})
export class FooterComponent {
  constructor() {
    addIcons({ logoWhatsapp, paperPlane, logoLinkedin, logoGithub });
  }
}

