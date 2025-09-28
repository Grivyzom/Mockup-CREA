import { Component, EventEmitter, Input, Output, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverflowMarqueeDirective } from '../../directives/overflow-marquee.directive';
import { ProjectData } from '../project-modal/project-modal';

@Component({
  selector: 'app-monthly-projects-carousel',
  standalone: true,
  imports: [CommonModule, OverflowMarqueeDirective],
  templateUrl: './monthly-projects-carousel.html',
  styleUrls: ['./monthly-projects-carousel.css']
})
export class MonthlyProjectsCarousel implements OnInit, OnDestroy {
  @Input() projects: ProjectData[] = [];
  @Input() variant: 'standard' | 'compact' | 'showcase' = 'standard';
  @Input() autoplay = true; // Reproducción automática
  @Input() autoplayInterval = 5000; // ms
  @Input() pauseOnHover = true; // Pausar al pasar el mouse o enfocar
  @Input() isDarkMode: boolean = false; // Recibido desde Home para adaptar renderizado en modo oscuro
  @Output() viewMore = new EventEmitter<ProjectData>();

  currentIndex = 0;
  areasDropdownOpenId: number | null = null;
  descriptionOpenId: number | null = null; // Nueva propiedad para controlar descripción desplegable
  hasUserInteracted = false; // Para mostrar/ocultar hints de swipe

  // Variables para gestos touch en móvil
  private touchStartX = 0;
  private touchStartY = 0;
  private touchEndX = 0;
  private touchEndY = 0;
  private minSwipeDistance = 50; // píxeles mínimos para considerar swipe
  isAnimating = false; // Prevenir múltiples swipes rápidos - público para el template
  private autoplayTimer: any = null; // manejador del temporizador
  isAutoplaying = false; // estado actual del autoplay
  liveAnnouncement = ''; // texto para aria-live

  // Guardar si el usuario ha pausado manualmente para no reanudar automáticamente
  private userPaused = false;

  private onDocumentClick = (ev: MouseEvent) => {
    // Cerrar dropdown de áreas
    if (this.areasDropdownOpenId !== null) {
      const containers = document.querySelectorAll('.areas-dropdown-container');
      let clickedInside = false;
      containers.forEach((c) => {
        if ((c as HTMLElement).contains(ev.target as Node)) clickedInside = true;
      });
      if (!clickedInside) this.areasDropdownOpenId = null;
    }

    // Cerrar descripción desplegable
    if (this.descriptionOpenId !== null) {
      const descriptionContainers = document.querySelectorAll('.description-mobile');
      let clickedInsideDescription = false;
      descriptionContainers.forEach((c) => {
        if ((c as HTMLElement).contains(ev.target as Node)) clickedInsideDescription = true;
      });
      if (!clickedInsideDescription) this.descriptionOpenId = null;
    }
  };

  // Variante visual actual (interna) derivada de @Input variant
  currentVariant: 'standard' | 'compact' | 'showcase' = 'standard';

  // Opciones de variante para renderizado dinámico y accesible
  variantOptions: Array<{ id: 'standard' | 'compact' | 'showcase'; label: string; desc: string }> = [
    { id: 'standard', label: 'Amplia', desc: 'Tarjeta con contenido equilibrado' },
    { id: 'compact', label: 'Compacta', desc: 'Tarjeta más baja, vista rápida' },
    { id: 'showcase', label: 'Vitrina', desc: 'Tarjeta destacada con banner grande' }
  ];

  setVariant(v: 'standard' | 'compact' | 'showcase') {
    if (this.currentVariant === v) return;
    this.currentVariant = v;
    // Actualizar anuncio solo si cambia (evita ruido excesivo en lectores)
    this.liveAnnouncement = `Vista cambiada a ${this.variantOptions.find(o => o.id === v)?.label}`;
  }

  get visibleStack(): ProjectData[] {
    if (!this.projects || this.projects.length === 0) return [];
    const stackSize = Math.min(5, this.projects.length);
    const out: ProjectData[] = [];
    for (let i = 0; i < stackSize; i++) {
      const idx = (this.currentIndex + i) % this.projects.length;
      out.push(this.projects[idx]);
    }
    return out;
  }

  prev() {
    if (!this.projects?.length || this.isAnimating) return;
    this.isAnimating = true;
    this.currentIndex = (this.currentIndex - 1 + this.projects.length) % this.projects.length;
    // Liberar el bloqueo después de la animación
    setTimeout(() => { this.isAnimating = false; }, 350);
    this.updateLiveAnnouncement();
  }

  next() {
    if (!this.projects?.length || this.isAnimating) return;
    this.isAnimating = true;
    this.currentIndex = (this.currentIndex + 1) % this.projects.length;
    // Liberar el bloqueo después de la animación
    setTimeout(() => { this.isAnimating = false; }, 350);
    this.updateLiveAnnouncement();
  }

  // Navegar a un slide específico
  goToSlide(index: number) {
    if (!this.projects?.length || this.isAnimating || index === this.currentIndex) return;
    this.isAnimating = true;
    this.currentIndex = index;
    this.hasUserInteracted = true;
    setTimeout(() => { this.isAnimating = false; }, 350);
    this.updateLiveAnnouncement();
  }

  open(project: ProjectData) {
    this.viewMore.emit(project);
  }

  // Dropdown de áreas
  openAreasDropdown(id: number) {
    this.areasDropdownOpenId = id;
  }
  closeAreasDropdown(id: number) {
    if (this.areasDropdownOpenId === id) this.areasDropdownOpenId = null;
  }
  toggleAreasDropdown(id: number) {
    this.areasDropdownOpenId = this.areasDropdownOpenId === id ? null : id;
  }

  // Métodos para gestos touch en móvil
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
    this.hasUserInteracted = true; // Usuario ha interactuado
    // Pausar autoplay durante la interacción táctil
    this.pauseAutoplay();
  }

  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].clientX;
    this.touchEndY = event.changedTouches[0].clientY;
    this.handleSwipe();
    // Reanudar si corresponde
    this.resumeAutoplay();
  }

  private handleSwipe() {
    if (this.isAnimating) return; // Prevenir swipes durante animación
    
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;
    
    // Solo procesar si el movimiento horizontal es mayor que el vertical
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > this.minSwipeDistance) {
        if (deltaX > 0) {
          // Swipe hacia la derecha - ir al anterior
          this.prev();
        } else {
          // Swipe hacia la izquierda - ir al siguiente
          this.next();
        }
      }
    }
  }

  // Reutilizamos helpers de estilo para áreas
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

  // Accesibilidad: anunciar cambio de slide
  private updateLiveAnnouncement() {
    if (!this.projects?.length) return;
    const current = this.projects[this.currentIndex];
    const pos = this.currentIndex + 1;
    this.liveAnnouncement = `Slide ${pos} de ${this.projects.length}: ${current?.title ?? ''}`;
  }

  // Autoplay helpers
  private clearAutoplayTimer() {
    if (this.autoplayTimer) {
      clearTimeout(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  private canAutoplay(): boolean {
    return !!(this.autoplay && this.projects && this.projects.length > 1 && !this.userPaused);
  }

  startAutoplay() {
    if (!this.canAutoplay()) { this.isAutoplaying = false; return; }
    this.clearAutoplayTimer();
    const delay = Math.max(2000, this.autoplayInterval);
    const tick = () => {
      if (!this.canAutoplay()) { this.isAutoplaying = false; return; }
      if (!this.isAnimating) this.next();
      this.autoplayTimer = setTimeout(tick, delay);
    };
    this.autoplayTimer = setTimeout(tick, delay);
    this.isAutoplaying = true;
  }

  stopAutoplay() {
    this.clearAutoplayTimer();
    this.isAutoplaying = false;
  }

  toggleAutoplay() {
    if (this.isAutoplaying) {
      this.userPaused = true;
      this.stopAutoplay();
    } else {
      this.userPaused = false;
      this.startAutoplay();
    }
  }

  pauseAutoplay() {
    // Pausa temporal sin marcar userPaused
    this.clearAutoplayTimer();
    this.isAutoplaying = false;
  }

  resumeAutoplay() {
    if (!this.userPaused) {
      this.startAutoplay();
    }
  }

  // Handlers de UX
  onMouseEnter() {
    if (this.pauseOnHover) this.pauseAutoplay();
  }
  onMouseLeave() {
    if (this.pauseOnHover) this.resumeAutoplay();
  }

  onFocusIn() {
    this.pauseAutoplay();
  }
  onFocusOut() {
    this.resumeAutoplay();
  }

  onKeydown(ev: KeyboardEvent) {
    switch (ev.key) {
      case 'ArrowLeft': ev.preventDefault(); this.prev(); break;
      case 'ArrowRight': ev.preventDefault(); this.next(); break;
      case 'Home': ev.preventDefault(); this.goToSlide(0); break;
      case 'End': ev.preventDefault(); this.goToSlide(Math.max(0, (this.projects?.length ?? 1) - 1)); break;
      case ' ': // Space
      case 'Spacebar':
        ev.preventDefault();
        this.toggleAutoplay();
        break;
    }
  }

  // Navegación por teclado en el radiogrupo de variantes
  onVariantKeydown(ev: KeyboardEvent, index: number) {
    const key = ev.key;
    if (['ArrowLeft', 'ArrowRight'].includes(key)) {
      ev.preventDefault();
      const dir = key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (index + dir + this.variantOptions.length) % this.variantOptions.length;
      const next = this.variantOptions[nextIndex];
      this.setVariant(next.id);
      // Mover el foco al botón correspondiente
      const host = (ev.currentTarget as HTMLElement).parentElement;
      if (host) {
        const btns = host.querySelectorAll<HTMLButtonElement>('button[role="radio"]');
        btns[nextIndex]?.focus();
      }
    }
    if (['Home', 'End'].includes(key)) {
      ev.preventDefault();
      const targetIndex = key === 'Home' ? 0 : this.variantOptions.length - 1;
      const target = this.variantOptions[targetIndex];
      this.setVariant(target.id);
      const host = (ev.currentTarget as HTMLElement).parentElement;
      if (host) {
        const btns = host.querySelectorAll<HTMLButtonElement>('button[role="radio"]');
        btns[targetIndex]?.focus();
      }
    }
    if (key === ' ' || key === 'Spacebar' || key === 'Enter') {
      ev.preventDefault();
      const current = this.variantOptions[index];
      this.setVariant(current.id);
    }
  }

  // Navegación por clic en bordes del deck
  onDeckClick(ev: MouseEvent) {
    // Si el click vino de un botón/enlace/control interactivo, no navegar
    const target = ev.target as HTMLElement;
    const interactiveSelector = 'button, a, input, textarea, select, [role="button"], [data-no-nav]';
    if (target.closest(interactiveSelector)) {
      return;
    }
    // Determinar borde clicado relativo al contenedor .deck
    const deckEl = (ev.currentTarget as HTMLElement);
    if (!deckEl) return;
    const rect = deckEl.getBoundingClientRect();
    const x = ev.clientX - rect.left; // posición x dentro del deck
    const borderWidth = Math.max(40, rect.width * 0.15); // 15% o 40px mínimo
    // Clic en borde izquierdo
    if (x <= borderWidth) {
      this.prev();
      return;
    }
    // Clic en borde derecho
    if (x >= rect.width - borderWidth) {
      this.next();
      return;
    }
    // Clic en zona central: no hacer nada (permitir lectura del contenido)
  }

  // Click en card completa para mejorar CTR
  onCardClick(ev: MouseEvent, project: ProjectData, indexInStack: number) {
    // Solo permitir interacción en la carta superior
    if (indexInStack !== 0) return;
    const target = ev.target as HTMLElement;
    const interactiveSelector = 'button, a, input, textarea, select, [role="button"], [data-no-nav]';
    if (target.closest(interactiveSelector)) {
      return; // dejar que el control maneje su click
    }
    // Determinar si el click fue en los bordes, reutilizando lógica del deck
    const cardEl = (ev.currentTarget as HTMLElement);
    if (!cardEl) return;
    const rect = cardEl.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const borderWidth = Math.max(40, rect.width * 0.15);
    if (x <= borderWidth) { this.prev(); return; }
    if (x >= rect.width - borderWidth) { this.next(); return; }
    // Zona central: abrir detalle
    this.open(project);
  }

  // Métodos para manejar descripción desplegable en móvil
  isDescriptionOpen(projectId: number): boolean {
    return this.descriptionOpenId === projectId;
  }

  toggleDescription(projectId: number): void {
    this.descriptionOpenId = this.descriptionOpenId === projectId ? null : projectId;
  }

  ngOnInit(): void {
    // Inicializar variante a partir del @Input
    this.currentVariant = this.variant ?? 'standard';
    if (typeof document !== 'undefined') {
      document.addEventListener('click', this.onDocumentClick, true);
    }
    // Iniciar autoplay si corresponde
    this.updateLiveAnnouncement();
    this.userPaused = !this.autoplay; // si autoplay=false, considerar como pausado por usuario
    this.startAutoplay();

    // Pausar al cambiar visibilidad de la pestaña
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.onVisibilityChange, false);
    }
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', this.onDocumentClick, true);
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.onVisibilityChange, false);
    }
    this.stopAutoplay();
  }

  private onVisibilityChange = () => {
    if (typeof document === 'undefined') return;
    if ((document as Document).hidden) {
      this.pauseAutoplay();
    } else {
      this.resumeAutoplay();
    }
  };
}
