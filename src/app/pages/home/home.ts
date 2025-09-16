import { Component, ElementRef, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectModal, ProjectData, ProjectMember } from '../../components/project-modal/project-modal';
import { MonthlyProjectsCarousel } from '../../components/monthly-projects-carousel/monthly-projects-carousel';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ProjectModal, MonthlyProjectsCarousel],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements AfterViewInit, OnDestroy {
  @ViewChild('projectCarousel', { static: false }) projectCarousel?: ElementRef<HTMLElement>;
  @ViewChild('metricsRef', { static: false }) metricsRef?: ElementRef<HTMLElement>;
  private carouselTimer: any;
  private isPaused = false;
  private mqMobile?: MediaQueryList;
  private mqReducedMotion?: MediaQueryList;
  private mqListener?: (e: MediaQueryListEvent) => void;
  private countersObserver?: IntersectionObserver;
  areasDropdownOpenId: number | null = null;
  isModalOpen = false;
  selectedProject: ProjectData | null = null;
  private onDocumentClick = (ev: MouseEvent) => {
    if (this.areasDropdownOpenId === null) return;
    const containers = document.querySelectorAll('.areas-dropdown-container');
    let clickedInside = false;
    containers.forEach((c) => {
      if ((c as HTMLElement).contains(ev.target as Node)) clickedInside = true;
    });
    if (!clickedInside) this.areasDropdownOpenId = null;
  };
  // Proyectos mensuales destacados
  monthlyProjects: ProjectData[] = [
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
        { id: 1, name: "Leslie Alexander", role: "Co-Founder / CEO", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 2, name: "Michael Foster", role: "Co-Founder / CTO", avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 3, name: "Dries Vincent", role: "Business Relations", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 4, name: "Lindsay Walton", role: "Front-end Developer", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 5, name: "Courtney Henry", role: "Designer", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" }
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
        { id: 6, name: "Emma Watson", role: "Creative Director", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 7, name: "James Wilson", role: "Senior Designer", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 8, name: "Sofia Rodriguez", role: "Brand Strategist", avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" }
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
        { id: 9, name: "Carlos Mendez", role: "IoT Engineer", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 10, name: "Ana Lopez", role: "Agriculture Specialist", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 11, name: "David Kim", role: "Software Developer", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 12, name: "Maria Garcia", role: "Data Analyst", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" }
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
        { id: 13, name: "Robert Chen", role: "Robotics Engineer", avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 14, name: "Isabella Martinez", role: "Mechanical Engineer", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 15, name: "Alex Thompson", role: "Software Engineer", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" }
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
        { id: 16, name: "Lisa Wang", role: "Electronics Engineer", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 17, name: "Marco Silva", role: "Firmware Developer", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
        { id: 18, name: "Emily Johnson", role: "Systems Analyst", avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" }
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

  // Resumen para usuario logueado
  stats = { inProgress: 0, completed: 0, paused: 0 };
  lastInProgress: ProjectData | null = null;

  // Estado de carga y filtro para la parrilla/carrusel
  isLoading = false;
  currentFilter: 'all' | 'active' | 'students' | 'completed' = 'all';
  lastActivityDays = 3; // valor mock, puedes calcular desde datos reales

  // Lista filtrada para pasar al carrusel
  get filteredProjects(): ProjectData[] {
    let list = [...this.monthlyProjects];
    switch (this.currentFilter) {
      case 'active':
        list = list.filter(p => p.status?.toLowerCase().includes('progreso'));
        break;
      case 'completed':
        list = list.filter(p => p.status?.toLowerCase().includes('complet'));
        break;
      case 'students': {
        // Filtrar por proyectos con estudiantes por sobre el percentil 75 de la distribución
        const counts = list.map(p => p.students ?? 0).sort((a, b) => a - b);
        const q = counts.length ? counts[Math.floor(0.75 * (counts.length - 1))] : 0;
        list = list.filter(p => (p.students ?? 0) >= q);
        // Ordenar descendente por estudiantes para mayor claridad visual
        list.sort((a, b) => (b.students ?? 0) - (a.students ?? 0));
        break;
      }
      default:
        break;
    }
    return list;
  }

  // (La búsqueda se mueve al sidebar)

  // Método para obtener el color del área
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

  // Método para obtener el ícono del área
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

  // Etiquetas legibles para las áreas (para el dropdown)
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

  // Control del dropdown de áreas por card
  openAreasDropdown(id: number) {
    this.areasDropdownOpenId = id;
  }
  closeAreasDropdown(id: number) {
    if (this.areasDropdownOpenId === id) this.areasDropdownOpenId = null;
  }
  toggleAreasDropdown(id: number) {
    this.areasDropdownOpenId = this.areasDropdownOpenId === id ? null : id;
  }

  // Control del modal de proyecto
  openProjectModal(project: ProjectData) {
    this.selectedProject = project;
    this.isModalOpen = true;
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  closeProjectModal() {
    this.isModalOpen = false;
    this.selectedProject = null;
    // Restaurar scroll del body
    document.body.style.overflow = 'auto';
  }

  // Carrusel móvil automático
  ngAfterViewInit(): void {
    // Configurar media queries
    if (typeof window !== 'undefined') {
      this.mqMobile = window.matchMedia('(max-width: 768px)');
      this.mqReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

      // Iniciar según el estado actual
      this.startCarousel();

      // Reaccionar a cambios de tamaño (activar/desactivar en vivo)
      this.mqListener = (e: MediaQueryListEvent) => {
        if (e.matches) {
          this.startCarousel();
        } else {
          this.clearCarousel();
        }
      };
      this.mqMobile.addEventListener?.('change', this.mqListener);

      // Cerrar dropdown de áreas al hacer clic fuera (móvil/desktop)
      document.addEventListener('click', this.onDocumentClick, true);

      // Inicializar contadores animados cuando las métricas entren al viewport
      const metricsEl = this.metricsRef?.nativeElement;
      const reduceMotionCounters = this.mqReducedMotion?.matches ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (metricsEl) {
        if (reduceMotionCounters) {
          // Sin animación: establecer valores directamente
          this.setCountersInstant();
        } else {
          this.countersObserver = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry && entry.isIntersecting) {
              this.animateCounters();
              this.countersObserver?.disconnect();
            }
          }, { threshold: 0.3 });
          this.countersObserver.observe(metricsEl);
        }
      }

      // Calcular estadísticas del usuario (mock desde monthlyProjects)
      this.computeStats();
    }
  }

  ngOnDestroy(): void {
    this.clearCarousel();
    if (this.mqMobile && this.mqListener) {
      this.mqMobile.removeEventListener?.('change', this.mqListener);
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', this.onDocumentClick, true);
    }
  }

  private startCarousel() {
    this.clearCarousel();
    const el = this.projectCarousel?.nativeElement;
    if (!el) return;

    // Auto-advance solo en móviles y si no se prefiere reducir movimiento
    const isMobile = this.mqMobile ? this.mqMobile.matches : (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches);
    const reduceMotion = this.mqReducedMotion ? this.mqReducedMotion.matches : (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (!isMobile || reduceMotion) return;

    this.carouselTimer = setInterval(() => {
      if (this.isPaused) return;
      const first = el.firstElementChild as HTMLElement | null;
      if (!first) return;
      const gap = 24; // separación estimada entre cards
      const delta = first.getBoundingClientRect().width + gap;
      el.scrollBy({ left: delta, behavior: 'smooth' });
    }, 3500);
  }


  private clearCarousel() {
    if (this.carouselTimer) {
      clearInterval(this.carouselTimer);
      this.carouselTimer = null;
    }
  }

  pauseCarousel() {
    this.isPaused = true;
  }

  resumeCarousel() {
    this.isPaused = false;
  }

  private computeStats() {
    const inProgress = this.monthlyProjects.filter(p => p.status?.toLowerCase().includes('progreso')).length;
    const completed = this.monthlyProjects.filter(p => p.status?.toLowerCase().includes('complet')).length;
    const paused = this.monthlyProjects.filter(p => p.status?.toLowerCase().includes('paus')).length;
    this.stats = { inProgress, completed, paused };
    this.lastInProgress = this.monthlyProjects.find(p => p.status?.toLowerCase().includes('progreso')) || null;
  }

  continueLastProject() {
    if (this.lastInProgress) {
      this.openProjectModal(this.lastInProgress);
    }
  }

  // =====================
  // Contadores animados
  // =====================

  // Valores objetivo (puedes ajustarlos a tus métricas reales)
  activeProjectsTarget = 42000;
  participatingStudentsTarget = 3000;
  completedProjectsTarget = 1200;

  // Valores actuales (se animan)
  activeProjects = 0;
  participatingStudents = 0;
  completedProjects = 0;

  // Valores formateados para el template
  get activeProjectsDisplay(): string { return this.formatCompact(this.activeProjects); }
  get participatingStudentsDisplay(): string { return this.formatCompact(this.participatingStudents); }
  get completedProjectsDisplay(): string { return this.formatCompact(this.completedProjects); }

  private setCountersInstant() {
    this.activeProjects = this.activeProjectsTarget;
    this.participatingStudents = this.participatingStudentsTarget;
  this.completedProjects = this.completedProjectsTarget;
  }

  private animateCounters() {
    const duration = 1200; // ms
    const start = performance.now();
    const fromA = 0, toA = this.activeProjectsTarget;
    const fromB = 0, toB = this.participatingStudentsTarget;
  const fromC = 0, toC = this.completedProjectsTarget;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const e = easeOutCubic(t);
      // Pequeño escalonado para sensación de conteo
      this.activeProjects = Math.round(fromA + (toA - fromA) * e);
      this.participatingStudents = Math.round(fromB + (toB - fromB) * e);
  this.completedProjects = Math.round(fromC + (toC - fromC) * e);
      if (t < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }

  private formatCompact(n: number): string {
    // Formato compacto es-CL: 39,5 mil / 1,1 mil / 2 millones
    const abs = Math.abs(n);
    if (abs >= 1_000_000) {
      const val = n / 1_000_000;
      const withDecimals = this.toEsCl(val, val % 1 !== 0);
      return `${withDecimals} ${val >= 2 ? 'millones' : 'millón'}`;
    }
    if (abs >= 1_000) {
      const val = n / 1_000;
      const withDecimals = this.toEsCl(val, val % 1 !== 0);
      return `${withDecimals} mil`;
    }
    return this.toEsCl(n, false);
  }

  private toEsCl(val: number, withDecimal: boolean): string {
    return val.toLocaleString('es-CL', { minimumFractionDigits: withDecimal ? 1 : 0, maximumFractionDigits: withDecimal ? 1 : 0 });
  }

  // Tooltips amigables para métricas
  get activeProjectsTooltip(): string { return `${this.formatCompact(this.activeProjectsTarget)} proyectos activos`; }
  get participatingStudentsTooltip(): string { return `${this.formatCompact(this.participatingStudentsTarget)} estudiantes participando`; }
  get completedProjectsTooltip(): string { return `${this.formatCompact(this.completedProjectsTarget)} proyectos concluidos`; }

  // Acciones de filtro desde métricas del hero
  filterBy(type: 'all' | 'active' | 'students' | 'completed') {
    this.currentFilter = type;
    // Scroll suave al panel de proyectos
    const el = document.getElementById('panel-proyectos');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // CTA "Iniciar proyecto" (placeholder)
  startNewProject() {
    // Aquí podrías navegar a una ruta de creación o abrir un modal
    // Por ahora, hacemos scroll al panel como fallback
    const el = document.getElementById('panel-proyectos');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
