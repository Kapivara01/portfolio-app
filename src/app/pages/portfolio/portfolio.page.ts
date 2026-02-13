import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-portafolio',
  templateUrl: './portfolio.page.html',
  styleUrls: ['./portfolio.page.scss'],
})
export class PortafolioPage implements OnInit {

  categoriaActiva: string = 'Telecomunicaciones';
  
  // Datos ficticios siguiendo la estructura de tu tabla en Supabase
  proyectos: any[] = [
    {
      id: 1,
      title: 'Instalación de Nodo de Fibra Óptica',
      description: 'Implementación y configuración de nodos de transporte para la red interurbana, optimizando la latencia en un 20%.',
      category: 'Telecomunicaciones',
      image_url: 'https://picsum.photos/id/101/800/400',
      project_url: '#'
    },
    {
      id: 2,
      title: 'Mantenimiento de Sistemas Radio SDH',
      description: 'Mantenimiento correctivo y preventivo de radioenlaces digitales para asegurar la continuidad del servicio de voz y datos.',
      category: 'Telecomunicaciones',
      image_url: 'https://picsum.photos/id/102/800/400',
      project_url: '#'
    },
    {
      id: 3,
      title: 'Sistema de Gestión de Inventarios',
      description: 'Desarrollo de una aplicación web para el control de activos técnicos utilizando Angular y Supabase.',
      category: 'Informática',
      image_url: 'https://picsum.photos/id/103/800/400',
      project_url: '#'
    },
    {
      id: 4,
      title: 'Dashboard de Monitoreo en Tiempo Real',
      description: 'Creación de un panel de visualización de métricas de red para supervisión técnica regional.',
      category: 'Informática',
      image_url: 'https://picsum.photos/id/104/800/400',
      project_url: '#'
    }
  ];

  constructor() { }

  ngOnInit() {
  }

}