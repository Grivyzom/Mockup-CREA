import { Component, OnInit, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
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

  constructor(private router: Router) {}

  ngOnInit() {
    // Actualizar el título de la página basado en la ruta actual
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updatePageTitle(event.url);
      });
    
    // Establecer título inicial
    this.updatePageTitle(this.router.url);
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
    }
  }

  closeNotificationDropdown() {
    // Solo cerrar si no está fijado por click
    if (!this.isNotificationDropdownPinned) {
      this.isNotificationDropdownOpen = false;
    }
  }

  openProfileDropdown() {
    // Solo abrir si no está fijado por otro dropdown
    if (!this.isNotificationDropdownPinned) {
      this.isProfileDropdownOpen = true;
      this.isNotificationDropdownOpen = false;
    }
  }

  closeProfileDropdown() {
    // Solo cerrar si no está fijado por click
    if (!this.isProfileDropdownPinned) {
      this.isProfileDropdownOpen = false;
    }
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
    }
  }

  closeDropdowns() {
    // Cerrar todos los dropdowns y quitar fijación
    this.isNotificationDropdownOpen = false;
    this.isProfileDropdownOpen = false;
    this.isNotificationDropdownPinned = false;
    this.isProfileDropdownPinned = false;
  }

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
}
