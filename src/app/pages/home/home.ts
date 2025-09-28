import { Component, ElementRef, ViewChild, OnDestroy, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, NgIf, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProjectModal, ProjectData, ProjectMember } from '../../components/project-modal/project-modal';
import { MonthlyProjectsCarousel } from '../../components/monthly-projects-carousel/monthly-projects-carousel';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgIf, RouterLink, ProjectModal, MonthlyProjectsCarousel],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements AfterViewInit, OnDestroy {
  @ViewChild('projectCarousel', { static: false }) projectCarousel?: ElementRef<HTMLElement>;
  @ViewChild('metricsRef', { static: false }) metricsRef?: ElementRef<HTMLElement>;
  
  private carouselTimer: any;
  private isPaused = false;
  private mqMobile?: MediaQueryList;
  private mqReducedMotion?: MediaQueryList;
  private mqDarkMode?: MediaQueryList;
  private mqListener?: (e: MediaQueryListEvent) => void;
  private darkModeListener?: (e: MediaQueryListEvent) => void;
  private countersObserver?: IntersectionObserver;
  private isBrowser: boolean;
  
  areasDropdownOpenId: number | null = null;
  isModalOpen = false;
  selectedProject: ProjectData | null = null;
  isDarkMode = false;

  private onDocumentClick = (ev: MouseEvent) => {
    if (this.areasDropdownOpenId === null) return;
    const containers = document.querySelectorAll('.areas-dropdown-container');
    let clickedInside = false;
    containers.forEach((c) => {
      if ((c as HTMLElement).contains(ev.target as Node)) clickedInside = true;
    });
    if (!clickedInside) this.areasDropdownOpenId = null;
  };

  // Usar la lista centralizada de ProjectService (se mapea al formato local)
  // Nota: ProjectService almacena objetos `Project` con ids tipo string.

  // Estadísticas del usuario
  stats = { inProgress: 0, completed: 0, paused: 0 };
  lastInProgress: ProjectData | null = null;
  
  // Estado de carga y filtro
  isLoading = false;
  currentFilter: 'all' | 'active' | 'students' | 'completed' = 'all';
  lastActivityDays = 3;

  // Contadores para métricas
  activeProjectsTarget = 42000;
  participatingStudentsTarget = 3000;
  completedProjectsTarget = 1200;
  
  activeProjects = 0;
  participatingStudents = 0;
  completedProjects = 0;

  // Lista filtrada para el carrusel
  get filteredProjects(): ProjectData[] {
    // Mapear proyectos desde el servicio al shape que usa el carousel/modal
  const raw = this.projectService.projects();
  let list: ProjectData[] = raw.map((p: any) => ({
      // Mantener id como viene (string) para navegación; el template no requiere number estrictamente
      // usamos any para evitar fricciones de tipado entre interfaces locales
      id: (p.id as any),
      title: p.name,
      description: p.description,
      area: 'informatica',
      areaDisplay: this.getAreaLabel('informatica'),
      areas: [],
      duration: '',
      difficulty: '',
      students: p.members ?? 1,
      members: [],
      status: (p.progress >= 100 ? 'Completado' : (p.progress > 0 ? 'En progreso' : 'En progreso')),
      progress: p.progress ?? 0,
      fullDescription: p.description,
      technologies: [],
      objectives: [],
      startDate: p.createdAt?.toISOString?.(),
      endDate: undefined
    } as unknown as ProjectData));
    switch (this.currentFilter) {
      case 'active':
        list = list.filter(p => p.status?.toLowerCase().includes('progreso'));
        break;
      case 'completed':
        list = list.filter(p => p.status?.toLowerCase().includes('complet'));
        break;
      case 'students': {
        const counts = list.map(p => p.students ?? 0).sort((a, b) => a - b);
        const q = counts.length ? counts[Math.floor(0.75 * (counts.length - 1))] : 0;
        list = list.filter(p => (p.students ?? 0) >= q);
        list.sort((a, b) => (b.students ?? 0) - (a.students ?? 0));
        break;
      }
      default:
        break;
    }
    return list;
  }

  // Getters para valores formateados
  get activeProjectsDisplay(): string { return this.formatCompact(this.activeProjects); }
  get participatingStudentsDisplay(): string { return this.formatCompact(this.participatingStudents); }
  get completedProjectsDisplay(): string { return this.formatCompact(this.completedProjects); }
  
  // Tooltips
  get activeProjectsTooltip(): string { return `${this.formatCompact(this.activeProjectsTarget)} proyectos activos`; }
  get participatingStudentsTooltip(): string { return `${this.formatCompact(this.participatingStudentsTarget)} estudiantes participando`; }
  get completedProjectsTooltip(): string { return `${this.formatCompact(this.completedProjectsTarget)} proyectos concluidos`; }

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private projectService: ProjectService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    // Detectar modo oscuro inicial
    this.checkInitialDarkMode();
    
    // Configurar media queries
    this.setupMediaQueries();
    
    // Configurar observadores
    this.setupIntersectionObserver();
    
    // Configurar event listeners
    this.setupEventListeners();
    
    // Inicializar carrusel
    this.startCarousel();
    
    // Calcular estadísticas
    setTimeout(() => this.computeStats(), 0);
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private checkInitialDarkMode(): void {
    if (!this.isBrowser) return;
    
    // Verificar clase en html
    this.isDarkMode = document.documentElement.classList.contains('theme-dark');
    
    // También verificar preferencia del sistema como fallback
    if (!this.isDarkMode) {
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    this.applyDarkModeStyles();
  }

  private setupMediaQueries(): void {
    if (!this.isBrowser) return;

    this.mqMobile = window.matchMedia('(max-width: 768px)');
    this.mqReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.mqDarkMode = window.matchMedia('(prefers-color-scheme: dark)');

    // Listeners para cambios
    this.mqListener = (e: MediaQueryListEvent) => {
      if (e.matches) {
        this.startCarousel();
      } else {
        this.clearCarousel();
      }
    };

    this.darkModeListener = (e: MediaQueryListEvent) => {
      // Solo actualizar si no hay clase explícita theme-dark
      if (!document.documentElement.classList.contains('theme-dark')) {
        this.isDarkMode = e.matches;
        this.applyDarkModeStyles();
      }
    };

    this.mqMobile.addEventListener?.('change', this.mqListener);
    this.mqDarkMode.addEventListener?.('change', this.darkModeListener);
  }

  private setupIntersectionObserver(): void {
    if (!this.isBrowser) return;

    const metricsEl = this.metricsRef?.nativeElement;
    const reduceMotionCounters = this.mqReducedMotion?.matches ?? false;
    
    if (metricsEl) {
      if (reduceMotionCounters) {
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
  }

  private setupEventListeners(): void {
    if (!this.isBrowser) return;

    document.addEventListener('click', this.onDocumentClick, true);
    
    // Observer para cambios en la clase theme-dark
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('theme-dark');
          if (this.isDarkMode !== isDark) {
            this.isDarkMode = isDark;
            this.applyDarkModeStyles();
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  private applyDarkModeStyles(): void {
    if (!this.isBrowser) return;

    // Aplicar ajustes específicos si es necesario
    const homeRoot = document.querySelector('.home-root') as HTMLElement;
    if (homeRoot) {
      if (this.isDarkMode) {
        homeRoot.style.setProperty('--local-bg', 'var(--inacap-background)');
        homeRoot.style.setProperty('--local-text', 'var(--inacap-text-primary)');
      } else {
        homeRoot.style.removeProperty('--local-bg');
        homeRoot.style.removeProperty('--local-text');
      }
    }
  }

  private cleanup(): void {
    this.clearCarousel();
    
    if (this.isBrowser) {
      if (this.mqMobile && this.mqListener) {
        this.mqMobile.removeEventListener?.('change', this.mqListener);
      }
      if (this.mqDarkMode && this.darkModeListener) {
        this.mqDarkMode.removeEventListener?.('change', this.darkModeListener);
      }
      document.removeEventListener('click', this.onDocumentClick, true);
    }
    
    this.countersObserver?.disconnect();
  }

  // Métodos de carrusel (mantener iguales)
  private startCarousel() {
    this.clearCarousel();
    const el = this.projectCarousel?.nativeElement;
    if (!el || !this.isBrowser) return;

    const isMobile = this.mqMobile ? this.mqMobile.matches : false;
    const reduceMotion = this.mqReducedMotion ? this.mqReducedMotion.matches : false;
    if (!isMobile || reduceMotion) return;

    this.carouselTimer = setInterval(() => {
      if (this.isPaused) return;
      const first = el.firstElementChild as HTMLElement | null;
      if (!first) return;
      const gap = 24;
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

  // Métodos de estadísticas (mantener iguales)
  private computeStats() {
  const raw = this.projectService.projects();
  const list = raw.map((p: any) => ({ ...p, status: (p.progress >= 100 ? 'Completado' : (p.progress > 0 ? 'En progreso' : 'En progreso')) } as any));
  const inProgress = list.filter((p: any) => p.status?.toLowerCase().includes('progreso')).length;
  const completed = list.filter((p: any) => p.status?.toLowerCase().includes('complet')).length;
  const paused = list.filter((p: any) => p.status?.toLowerCase().includes('paus')).length;
  this.stats = { inProgress, completed, paused };
  const found = raw.find((p: any) => (p.progress ?? 0) > 0 && (p.progress ?? 0) < 100);
    this.lastInProgress = found ? ({ id: (found.id as any), title: found.name, description: found.description, area: 'informatica', areaDisplay: this.getAreaLabel('informatica'), areas: [], duration: '', difficulty: '', students: found.members ?? 1, members: [], status: 'En progreso', progress: found.progress ?? 0 } as unknown as ProjectData) : null;
  }

  // Métodos de contadores (mantener iguales)
  private setCountersInstant() {
    this.activeProjects = this.activeProjectsTarget;
    this.participatingStudents = this.participatingStudentsTarget;
    this.completedProjects = this.completedProjectsTarget;
  }

  private animateCounters() {
    const duration = 1200;
    const start = performance.now();
    const fromA = 0, toA = this.activeProjectsTarget;
    const fromB = 0, toB = this.participatingStudentsTarget;
    const fromC = 0, toC = this.completedProjectsTarget;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const e = easeOutCubic(t);
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
    return val.toLocaleString('es-CL', { 
      minimumFractionDigits: withDecimal ? 1 : 0, 
      maximumFractionDigits: withDecimal ? 1 : 0 
    });
  }

  // Métodos de utilidad para áreas (mantener iguales)
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

  // Control del dropdown de áreas
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
    if (this.isBrowser) {
      document.body.style.overflow = 'hidden';
    }
  }

  closeProjectModal() {
    this.isModalOpen = false;
    this.selectedProject = null;
    if (this.isBrowser) {
      document.body.style.overflow = 'auto';
    }
  }

  continueLastProject() {
    if (this.lastInProgress) {
      this.openProjectModal(this.lastInProgress);
    }
  }

  // Acciones de filtro desde métricas del hero
  filterBy(type: 'all' | 'active' | 'students' | 'completed') {
    this.currentFilter = type;
    if (this.isBrowser) {
      const el = document.getElementById('panel-proyectos');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  // CTA "Explorar proyectos"
  exploreProjects() {
    if (this.isBrowser) {
      const el = document.getElementById('panel-proyectos');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  // CTA "Iniciar proyecto"
  startNewProject() {
    this.router.navigate(['/proyectos/nuevo']);
  }
}
