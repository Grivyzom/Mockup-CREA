import { Component, OnInit, HostListener, effect, inject, runInInjectionContext, AfterViewInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { NotificationService } from '../../core/services/notification.service';
import type { NotificationItem } from '../../pages/notifications/notifications';
import { ProfileService, type StudentProfile } from '../../services/profile.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar implements OnInit {
  isMobileMenuOpen = false;
  searchTerm = '';
  pageTitle = 'Bienvenido';
  
  // Estados para los dropdowns
  isNotificationDropdownOpen = false;
  isProfileDropdownOpen = false;

  // Estados para controlar si los dropdowns están "fijados" por click
  isNotificationDropdownPinned = false;
  isProfileDropdownPinned = false;

  // Datos útiles para el estudiante
  studentStats = {
    projectsActive: 3,
    projectsCompleted: 12,
    nextDeadline: 'Proyecto Angular - 15 Sep',
    currentSemester: '2025-2'
  };

  // Datos de notificaciones (se cargarán desde el servicio compartido)
  recentNotifications: NotificationItem[] = [];
  unreadTotal = 0;

  private clickTimeout: any = null; // para distinguir simple vs doble click
  private dblClickDelay = 240; // ms
  // Portal related
  private profileDropdownEl: HTMLElement | null = null;
  private notificationDropdownEl: HTMLElement | null = null;
  private portalHost = document.body;
  private resizeHandler = () => this.repositionOpenDropdowns();
  private scrollHandler = () => this.repositionOpenDropdowns();

  constructor(private router: Router, private notificationService: NotificationService, private profileService: ProfileService) {
    // Mover effect al constructor para asegurar el contexto de inyección
    effect(() => {
      const unread = this.notificationService.unreadCount();
      const recent = this.notificationService.getRecent(3);
      this.unreadTotal = unread;
      this.recentNotifications = recent;
    });
  }

  ngOnInit() {
    // Actualizar el título de la página basado en la ruta actual
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updatePageTitle(event.url);
      });
    
    // Establecer título inicial
    this.updatePageTitle(this.router.url);
    // Añadir listeners globales para reposicionar dropdowns cuando cambie el viewport
    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('orientationchange', this.resizeHandler);
    window.addEventListener('scroll', this.scrollHandler, true);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  // Métodos para manejar dropdowns con hover y click
  openNotificationDropdown() {
    // Solo abrir si no está fijado por otro dropdown
    if (!this.isProfileDropdownPinned) {
      this.isNotificationDropdownOpen = true;
      this.isProfileDropdownOpen = false;
      // Portal: move to body and position
      setTimeout(()=> this.attachAndPosition('notification'), 0);
    }
  }

  closeNotificationDropdown(ev?: MouseEvent) {
    // Si el dropdown está fijado por click, no lo cerramos
    if (this.isNotificationDropdownPinned) return;
    // Si viene un event, comprobar relatedTarget para evitar cerrar cuando el cursor
    // se mueve del botón al propio dropdown
    if (ev && ev.relatedTarget) {
      const related = ev.relatedTarget as Node;
      const dropdown = document.querySelector('.notification-dropdown');
      if (dropdown && dropdown.contains(related)) return;
    }
    this.isNotificationDropdownOpen = false;
  }

  openProfileDropdown() {
    // Solo abrir si no está fijado por otro dropdown
    if (!this.isNotificationDropdownPinned) {
      this.isProfileDropdownOpen = true;
      this.isNotificationDropdownOpen = false;
      // Portal: move to body and position
      setTimeout(()=> this.attachAndPosition('profile'), 0);
    }
  }

  closeProfileDropdown(ev?: MouseEvent) {
    // Si el dropdown está fijado por click, no lo cerramos
    if (this.isProfileDropdownPinned) return;
    if (ev && ev.relatedTarget) {
      const related = ev.relatedTarget as Node;
      const dropdown = document.querySelector('.profile-dropdown');
      if (dropdown && dropdown.contains(related)) return;
    }
    this.isProfileDropdownOpen = false;
  }

  // Métodos para manejar clicks (fijar/desfijar dropdowns)
  toggleNotificationDropdown() {
    if (this.isNotificationDropdownPinned) {
      // Si está fijado, desfijarlo y cerrarlo
      this.isNotificationDropdownPinned = false;
      this.isNotificationDropdownOpen = false;
    } else {
      // Fijar este dropdown y cerrar el otro
      this.isNotificationDropdownPinned = true;
      this.isProfileDropdownPinned = false;
      this.isNotificationDropdownOpen = true;
      this.isProfileDropdownOpen = false;
      setTimeout(()=> this.attachAndPosition('notification'), 0);
    }
  }

  toggleProfileDropdown() {
    if (this.isProfileDropdownPinned) {
      // Si está fijado, desfijarlo y cerrarlo
      this.isProfileDropdownPinned = false;
      this.isProfileDropdownOpen = false;
    } else {
      // Fijar este dropdown y cerrar el otro
      this.isProfileDropdownPinned = true;
      this.isNotificationDropdownPinned = false;
      this.isProfileDropdownOpen = true;
      this.isNotificationDropdownOpen = false;
      setTimeout(()=> this.attachAndPosition('profile'), 0);
    }
  }

  closeDropdowns() {
    // Cerrar todos los dropdowns y quitar fijación
    this.isNotificationDropdownOpen = false;
    this.isProfileDropdownOpen = false;
    this.isNotificationDropdownPinned = false;
    this.isProfileDropdownPinned = false;
    // detach portal elements if needed
    this.detachFromPortal('notification');
    this.detachFromPortal('profile');
  }

  // PORTAL HELPERS
  private attachAndPosition(kind: 'profile' | 'notification'){
    try{
      if(kind === 'profile'){
        if(!this.profileDropdownEl) this.profileDropdownEl = document.querySelector('.profile-dropdown') as HTMLElement;
        this.moveToBodyAndPosition(this.profileDropdownEl, '.user-avatar');
      } else {
        if(!this.notificationDropdownEl) this.notificationDropdownEl = document.querySelector('.notification-dropdown') as HTMLElement;
        this.moveToBodyAndPosition(this.notificationDropdownEl, '.notification-btn');
      }
    }catch(e){
      // si falla, no romper la UI
      console.warn('Portal attach error', e);
    }
  }

  private detachFromPortal(kind: 'profile' | 'notification'){
    try{
      const el = kind === 'profile' ? this.profileDropdownEl : this.notificationDropdownEl;
      if(!el) return;
      // intentamos regresar el elemento a su contenedor original en el header/sidebar
      const container = document.querySelector('.header-right');
      if(container) container.appendChild(el);
      // limpiar estilos inline
      el.style.position = '';
      el.style.top = '';
      el.style.left = '';
      el.style.right = '';
      el.style.width = '';
      el.style.maxWidth = '';
      el.style.setProperty('--dropdown-arrow-left', '');
    }catch(e){ console.warn('Portal detach error', e); }
  }

  private moveToBodyAndPosition(el: HTMLElement | null, anchorSelector: string){
    if(!el) return;
    const anchor = document.querySelector(anchorSelector) as HTMLElement | null;
    if(!anchor) return;
    // move to body if not already
    if(el.parentElement !== this.portalHost) this.portalHost.appendChild(el);
    // compute rects
    const aRect = anchor.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const headerHeight = getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '';
    const headerPx = headerHeight ? parseInt(headerHeight) : 70;
    // default right margin
    const rightMargin = 16; // 1rem

    // Prefer placing the dropdown using left (distance from viewport left).
    // Attempt to align the dropdown near the anchor.left but keep it inside the viewport.
    const viewportW = window.innerWidth;
    const margin = 12; // px margin to viewport edges
    el.style.position = 'fixed';
    el.style.top = (aRect.bottom + 8) + 'px'; // small gap under anchor
    // allow natural sizing first
    el.style.left = '0px';
    el.style.right = 'auto';
    el.style.maxWidth = 'calc(100% - 2rem)';
    // measure width
    const measured = el.getBoundingClientRect();
    const elWidth = measured.width || elRect.width || 240;
    // desired left attempts to align with anchor.left
    let leftVal = Math.round(aRect.left);
    // ensure dropdown doesn't overflow right edge
    if (leftVal + elWidth + margin > viewportW) {
      leftVal = Math.max(margin, viewportW - elWidth - margin);
    }
    // ensure dropdown doesn't overflow left edge
    if (leftVal < margin) leftVal = margin;
    el.style.left = leftVal + 'px';
    // compute arrow position relative to dropdown left edge
    const newRect = el.getBoundingClientRect();
    const anchorCenter = aRect.left + aRect.width / 2;
    const arrowLeft = Math.round(Math.max(12, Math.min(newRect.width - 12, anchorCenter - newRect.left)));
    el.style.setProperty('--dropdown-arrow-left', arrowLeft + 'px');
  }

  private repositionOpenDropdowns(){
    if(this.isProfileDropdownOpen) this.moveToBodyAndPosition(this.profileDropdownEl || document.querySelector('.profile-dropdown') as HTMLElement, '.user-avatar');
    if(this.isNotificationDropdownOpen) this.moveToBodyAndPosition(this.notificationDropdownEl || document.querySelector('.notification-dropdown') as HTMLElement, '.notification-btn');
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('orientationchange', this.resizeHandler);
    window.removeEventListener('scroll', this.scrollHandler, true);
  }

  // Interacción de ítems de notificación en dropdown
  onNotificationItemClick(ev: MouseEvent, notif: NotificationItem){
    ev.preventDefault();
    // Si ya hay timeout, aún no determinamos double click
    if(this.clickTimeout){
      // Interpreta como doble click
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
      this.navigateToNotifications();
      return;
    }
    // Programar acción de single click: marcar leída
    this.clickTimeout = setTimeout(()=>{
      this.notificationService.markRead(notif.id);
      this.clickTimeout = null;
    }, this.dblClickDelay);
  }

  navigateToNotifications(){
    this.closeDropdowns();
    this.router.navigate(['/notificaciones']);
  }

  // trackBy reutilizable para ngFor en dropdown
  trackById(_index: number, item: NotificationItem){ return item.id; }

  // Método para cerrar dropdowns al hacer click fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      // Solo cerrar si hay dropdowns fijados
      if (this.isNotificationDropdownPinned || this.isProfileDropdownPinned) {
        this.closeDropdowns();
      }
    }
  }

  private updatePageTitle(url: string) {
    switch (url) {
      case '/home':
      case '/':
        this.pageTitle = 'Dashboard';
        break;
      case '/about':
        this.pageTitle = 'Team';
        break;
      case '/contact':
        this.pageTitle = 'Projects';
        break;
      default:
        this.pageTitle = 'Dashboard';
    }
  }

  // Exponer nombre público para la vista
  get publicName(): string {
    const p = this.profileService.getProfile() as any;
    const display = p?.displayName as string | undefined;
    if (display && display.trim().length) return display.trim();
    if (p?.firstName || p?.lastName) return `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim();
    return p?.username ?? 'Estudiante INACAP';
  }

  get publicEmail(): string {
    const p = this.profileService.getProfile();
    return p?.institutionalEmail ?? 'correo@inacap.cl';
  }
}
