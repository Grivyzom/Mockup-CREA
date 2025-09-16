import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';

@Component({
  selector: 'app-scroll-to-top',
  imports: [],
  templateUrl: './scroll-to-top.html',
  styleUrl: './scroll-to-top.css'
})
export class ScrollToTop implements OnInit, OnDestroy {
  isVisible = false;
  private scrollThreshold = 300; // Píxeles desde arriba para mostrar el botón

  ngOnInit() {
    this.checkScrollPosition();
  }

  ngOnDestroy() {
    // Limpieza si es necesaria
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkScrollPosition();
  }

  private checkScrollPosition() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isVisible = scrollPosition > this.scrollThreshold;
  }

  scrollToTop() {
    // Scroll suave hasta arriba
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
