import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: false,
})
export class AdminDashboardPage implements OnInit {

  nuevoProyecto = {
    title: '',
    description: '',
    category: 'Telecomunicaciones',
    image_url: '',
    project_url: '',
    user_id: '' // Se asigna automáticamente
  };

  constructor(
    private supabase: SupabaseService,
    private toastCtrl: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.verificarSesion();
  }

  async verificarSesion() {
    const { data: { user } } = await this.supabase.user;
    if (!user) {
      this.router.navigate(['/admin-login']);
    } else {
      this.nuevoProyecto.user_id = user.id;
    }
  }

  async guardarProyecto() {
    if (!this.nuevoProyecto.title || !this.nuevoProyecto.description) {
      this.mostrarToast('Por favor, completa título y descripción', 'warning');
      return;
    }

    const { error } = await this.supabase.addProyecto(this.nuevoProyecto);

    if (error) {
      this.mostrarToast('Error en base de datos: ' + error.message, 'danger');
    } else {
      this.mostrarToast('¡Proyecto guardado con éxito!', 'success');
      this.limpiarFormulario();
    }
  }

  limpiarFormulario() {
    const currentUid = this.nuevoProyecto.user_id;
    this.nuevoProyecto = {
      title: '',
      description: '',
      category: 'Telecomunicaciones',
      image_url: '',
      project_url: '',
      user_id: currentUid
    };
  }

  async salir() {
    await this.supabase.signOut();
    this.router.navigate(['/admin-login']);
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2500,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}
