import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
})
export class AdminDashboardPage implements OnInit {
  seccionActiva: string = 'portafolio';
  proyectos: any[] = [];
  cargando: boolean = false;
  
  // Variables para controlar la edición
  editando: boolean = false;
  idProyectoAEditar: number | null = null;

  nuevoProyecto = {
    title: '',
    category: '',
    description: '',
    image_url: ''
  };

  constructor(
    private supabaseService: SupabaseService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.cargarProyectos();
  }

  async cargarProyectos() {
    this.cargando = true;
    const { data, error } = await this.supabaseService.getProyectos();
    if (!error) {
      this.proyectos = data || [];
    }
    this.cargando = false;
  }

  async guardarProyecto() {
    if (!this.nuevoProyecto.title) {
      this.mostrarToast('El título es obligatorio');
      return;
    }

    this.cargando = true;

    if (this.editando && this.idProyectoAEditar) {
      // Lógica de ACTUALIZAR
      const { error } = await this.supabaseService.updateProyecto(this.idProyectoAEditar, this.nuevoProyecto);
      if (!error) {
        this.mostrarToast('Proyecto actualizado con éxito');
        this.limpiarFormulario();
      } else {
        this.mostrarToast('Error al actualizar');
      }
    } else {
      // Lógica de CREAR NUEVO
      const { error } = await this.supabaseService.addProyecto(this.nuevoProyecto);
      if (!error) {
        this.mostrarToast('Proyecto guardado correctamente');
        this.limpiarFormulario();
      } else {
        this.mostrarToast('Error al guardar');
      }
    }
    
    this.cargarProyectos();
    this.cargando = false;
  }

  prepararEdicion(proyecto: any) {
    this.editando = true;
    this.idProyectoAEditar = proyecto.id;
    // Copiamos los datos al formulario
    this.nuevoProyecto = {
      title: proyecto.title,
      category: proyecto.category,
      description: proyecto.description,
      image_url: proyecto.image_url
    };
    // Subimos el scroll al formulario
    this.seccionActiva = 'portafolio';
    this.mostrarToast('Editando: ' + proyecto.title);
  }

  async eliminarProyecto(id: number) {
    const alert = await this.alertCtrl.create({
      header: '¿Dar de baja?',
      message: '¿Estás seguro de que deseas eliminar este proyecto definitivamente?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            const { error } = await this.supabaseService.deleteProyecto(id);
            if (!error) {
              this.mostrarToast('Proyecto eliminado');
              this.cargarProyectos();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  limpiarFormulario() {
    this.editando = false;
    this.idProyectoAEditar = null;
    this.nuevoProyecto = { title: '', category: '', description: '', image_url: '' };
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}