import { Component, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  currentYear = new Date().getFullYear();

  // Definición de secciones (podrían moverse a configuración)
  sections = [
    {
      id: 'quick',
      title: 'Enlaces Rápidos',
      links: [
        { label: 'Inicio', routerLink: '/' },
        { label: 'Proyectos', href: '#proyectos' },
        { label: 'Mi Historial', href: '#historial' },
        { label: 'Configuración', href: '#config' }
      ]
    },
    {
      id: 'recursos',
      title: 'Recursos',
      links: [
        { label: 'Soporte', href: '#soporte' },
        { label: 'Documentación', href: '#docs' },
        { label: 'Comunidad', href: '#comunidad' },
        { label: 'API', href: '#api' }
      ]
    },
    {
      id: 'legal',
      title: 'Legal',
      links: [
        { label: 'Términos', href: '#terminos' },
        { label: 'Privacidad', href: '#privacidad' },
        { label: 'Cookies', href: '#cookies' }
      ]
    }
  ];

  // Estado colapsado por sección en móvil
  collapsedMap = signal<Record<string, boolean>>({});
  isMobile = false;

  constructor() {
    this.updateIsMobile();
    this.initCollapsedState();
  }

  private initCollapsedState() {
    // En móvil: colapsar todas menos la primera
    const initial: Record<string, boolean> = {};
    this.sections.forEach((s, idx) => {
      initial[s.id] = this.isMobile ? idx !== 0 : false;
    });
    this.collapsedMap.set(initial);
  }

  toggleSection(id: string) {
    if (!this.isMobile) return; // Solo colapsable en móvil
    const next = { ...this.collapsedMap() };
    next[id] = !next[id];
    this.collapsedMap.set(next);
  }

  isCollapsed(id: string): boolean {
    return !!this.collapsedMap()[id];
  }

  @HostListener('window:resize')
  onResize() {
    const prevMobile = this.isMobile;
    this.updateIsMobile();
    if (prevMobile !== this.isMobile) {
      this.initCollapsedState();
    }
  }

  private updateIsMobile() {
    if (typeof window === 'undefined') { this.isMobile = false; return; }
    this.isMobile = window.innerWidth < 768; // breakpoint tailwind md
  }
}
