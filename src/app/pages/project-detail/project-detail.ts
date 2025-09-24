import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectData, ProjectMember } from '../../components/project-modal/project-modal';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-project-detail',
  imports: [CommonModule],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css'
})
export class ProjectDetail implements OnInit {
  project: ProjectData | null = null;
  isLoading = true;

  // Datos de ejemplo - en una app real vendrían de un servicio
  projectsData: ProjectData[] = [
    {
      id: 1,
      title: "Sistema de Gestión Hospitalaria",
      description: "Desarrollo de aplicación web para gestión integral de pacientes, citas médicas y historiales clínicos.",
      area: "informatica",
      areaDisplay: "Informática",
      areas: ["informatica", "salud"] as string[],
      duration: "8 semanas",
      difficulty: "Avanzado",
      students: 24,
      members: [
        { id: 1, name: "Ana García", role: "Project Lead", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 2, name: "Carlos López", role: "Developer", avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 3, name: "María González", role: "UX Designer", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 4, name: "Juan Pérez", role: "Backend Developer", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 5, name: "Sofia Ruiz", role: "QA Tester", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" }
      ],
      status: "En progreso",
      progress: 65,
      fullDescription: "Este proyecto busca modernizar el sistema de gestión hospitalaria mediante el desarrollo de una aplicación web integral. El sistema permitirá la gestión eficiente de pacientes, programación de citas médicas, mantenimiento de historiales clínicos digitales, y generación de reportes estadísticos. La solución incluye módulos para diferentes roles: médicos, enfermeros, personal administrativo y pacientes.",
      technologies: ["Angular", "Node.js", "PostgreSQL", "Express"],
      objectives: ["Digitalizar procesos hospitalarios", "Mejorar eficiencia operacional", "Reducir tiempos de espera", "Centralizar información médica"],
      startDate: "2025-07-15",
      endDate: "2025-09-30"
    },
    {
      id: 2,
      title: "Rediseño de Identidad Corporativa",
      description: "Creación de nueva identidad visual para empresa local, incluyendo logotipo, manual de marca y aplicaciones.",
      area: "diseño",
      areaDisplay: "Diseño Gráfico",
      areas: ["diseño"] as string[],
      duration: "6 semanas",
      difficulty: "Intermedio",
      students: 18,
      members: [
        { id: 6, name: "Valentina Castro", role: "Creative Director", avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 7, name: "Diego Morales", role: "Senior Designer", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 8, name: "Camila Herrera", role: "Brand Strategist", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 9, name: "Sebastián Torres", role: "UI Designer", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" }
      ],
      status: "Completado",
      progress: 100,
      fullDescription: "Proyecto de rediseño completo de identidad corporativa para una empresa del sector retail. Incluye investigación de mercado, análisis de competencia, desarrollo conceptual, diseño de logotipo, paleta cromática, tipografías corporativas, y manual de aplicación de marca. El proyecto abarca desde papelería institucional hasta señalética y presencia digital.",
      technologies: ["Adobe Illustrator", "Adobe Photoshop", "Adobe InDesign", "Figma"],
      objectives: ["Modernizar imagen corporativa", "Aumentar reconocimiento de marca", "Unificar comunicación visual", "Expandir presencia digital"],
      startDate: "2025-06-01",
      endDate: "2025-07-15"
    },
    {
      id: 3,
      title: "Sistema de Riego Automatizado",
      description: "Implementación de tecnología IoT para optimizar el riego en cultivos de invernadero.",
      area: "agricultura",
      areaDisplay: "Agricultura",
      areas: ["agricultura", "electronica"] as string[],
      duration: "10 semanas",
      difficulty: "Avanzado",
      students: 16,
      members: [
        { id: 10, name: "Roberto Silva", role: "IoT Engineer", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 11, name: "Andrea Mendoza", role: "Agriculture Specialist", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 12, name: "Felipe Vargas", role: "Software Developer", avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 13, name: "Constanza Muñoz", role: "Data Analyst", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" }
      ],
      status: "En progreso",
      progress: 45,
      fullDescription: "Sistema automatizado de riego inteligente diseñado para optimizar el uso del agua en cultivos de invernadero. Utiliza sensores de humedad del suelo, temperatura ambiente, y condiciones climáticas para determinar automáticamente cuándo y cuánto regar. El sistema incluye una interfaz web para monitoreo remoto y configuración de parámetros de riego.",
      technologies: ["Arduino", "Node.js", "React", "MongoDB", "Sensores IoT"],
      objectives: ["Optimizar uso del agua", "Aumentar productividad agrícola", "Reducir trabajo manual", "Implementar agricultura de precisión"],
      startDate: "2025-07-01",
      endDate: "2025-09-15"
    },
    {
      id: 4,
      title: "Prototipo de Robot Móvil",
      description: "Desarrollo de robot autónomo para tareas de limpieza industrial con sensores y navegación inteligente.",
      area: "mecanica",
      areaDisplay: "Mecánica",
      areas: ["mecanica"] as string[],
      duration: "12 semanas",
      difficulty: "Avanzado",
      students: 12,
      members: [
        { id: 14, name: "Cristián Ramírez", role: "Robotics Engineer", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 15, name: "Javiera Pinto", role: "Mechanical Engineer", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 16, name: "Nicolás Soto", role: "Software Engineer", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" }
      ],
      status: "En progreso",
      progress: 30,
      fullDescription: "Desarrollo de un prototipo de robot móvil autónomo especializado en tareas de limpieza industrial. El robot incorpora sistemas de navegación LIDAR, cámaras para reconocimiento de obstáculos, y un sistema de limpieza adaptable a diferentes tipos de superficies. Incluye programación de rutas automáticas y capacidad de retorno a estación de carga.",
      technologies: ["ROS", "Python", "LIDAR", "OpenCV", "Raspberry Pi"],
      objectives: ["Automatizar limpieza industrial", "Reducir riesgos laborales", "Mejorar eficiencia operacional", "Implementar navegación autónoma"],
      startDate: "2025-06-15",
      endDate: "2025-09-30"
    },
    {
      id: 5,
      title: "Sistema de Monitoreo Energético",
      description: "Diseño de circuitos para monitoreo en tiempo real del consumo energético en edificios comerciales.",
      area: "electronica",
      areaDisplay: "Electrónica",
      areas: ["electronica", "informatica"] as string[],
      duration: "9 semanas",
      difficulty: "Intermedio",
      students: 20,
      members: [
        { id: 17, name: "Matías Espinoza", role: "Electronics Engineer", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 18, name: "Fernanda Rojas", role: "Firmware Developer", avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 19, name: "Tomás Figueroa", role: "Systems Analyst", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 20, name: "Isidora Lagos", role: "Data Specialist", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 21, name: "Martín Contreras", role: "DevOps Engineer", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" }
      ],
      status: "Pausado",
      progress: 20,
      fullDescription: "Sistema de monitoreo energético en tiempo real para edificios comerciales. Incluye el diseño de circuitos sensores, desarrollo de firmware para microcontroladores, y una plataforma web para visualización de datos. El sistema permite identificar patrones de consumo, detectar anomalías, y generar reportes de eficiencia energética.",
      technologies: ["ESP32", "InfluxDB", "Grafana", "MQTT", "Vue.js"],
      objectives: ["Monitorear consumo energético", "Identificar eficiencias", "Reducir costos operacionales", "Generar reportes automáticos"],
      startDate: "2025-07-01",
      endDate: "2025-09-01"
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const rawId = params['id'];
      const numeric = parseInt(rawId, 10);
      if(!isNaN(numeric)) {
        this.loadProject(numeric);
      } else {
        // Buscar en proyectos locales simples
        const local = this.projectService.projects().find(p => p.id === rawId);
        if(local){
          // Adaptar a ProjectData mínimamente
            this.project = {
              id: local.id as any,
              title: local.name,
              description: local.description,
              fullDescription: local.description,
              duration: '—',
              difficulty: 'N/D',
              students: 0,
              members: [],
              area: 'informatica',
              areaDisplay: 'Informática',
              areas: ['informatica'],
              status: 'En progreso',
              progress: 0,
              technologies: [],
              objectives: []
            } as ProjectData;
            this.isLoading = false;
        } else {
          this.loadProject(numeric); // forzará 404 -> redirect
        }
      }
    });
  }

  loadProject(id: number) {
    this.isLoading = true;
    // Simular carga de datos
    setTimeout(() => {
      this.project = this.projectsData.find(p => p.id === id) || null;
      this.isLoading = false;
      
      if (!this.project) {
        this.router.navigate(['/']);
      }
    }, 500);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  // Métodos de utilidad (copiados del modal)
  getAreaColor(area: string): string {
    const colors: { [key: string]: string } = {
      'informatica': 'from-blue-500 to-cyan-500',
      'diseño': 'from-purple-500 to-pink-500',
      'agricultura': 'from-green-500 to-emerald-500',
      'mecanica': 'from-gray-600 to-slate-600',
      'electronica': 'from-yellow-500 to-orange-500'
    };
    return colors[area] || 'from-gray-400 to-gray-600';
  }

  getAreaIcon(area: string): string {
    const icons: { [key: string]: string } = {
      'informatica': 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'diseño': 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4m-6-6h.01M17 7v10',
      'agricultura': 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v-2a6 6 0 116 6v-2m6 0a2 2 0 100-4m0 4a2 2 0 100 4m0-4v-2a6 6 0 10-6 6v-2',
      'mecanica': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      'electronica': 'M13 10V3L4 14h7v7l9-11h-7z'
    };
    return icons[area] || 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
  }

  getAreaLabel(area: string): string {
    const labels: { [k: string]: string } = {
      'informatica': 'Informática',
      'diseño': 'Diseño Gráfico',
      'agricultura': 'Agricultura',
      'mecanica': 'Mecánica',
      'electronica': 'Electrónica',
      'salud': 'Salud'
    };
    return labels[area] ?? area;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'En progreso': 'bg-blue-100 text-blue-800',
      'Completado': 'bg-green-100 text-green-800',
      'Pausado': 'bg-yellow-100 text-yellow-800',
      'Cancelado': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
}