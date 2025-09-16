import { Directive, ElementRef, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[appOverflowMarquee]',
  standalone: true,
})
export class OverflowMarqueeDirective implements OnInit, OnDestroy {
  @Input('appOverflowMarquee') enabled = true;
  @HostBinding('class.marquee-enabled') isOverflowing = false;

  private resizeObserver?: ResizeObserver;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.check();
    // Observar cambios de tamaño del contenedor o contenido
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.check());
      this.resizeObserver.observe(this.el.nativeElement);
    } else {
      // Fallback simple
      window.addEventListener('resize', this.onWindowResize, { passive: true });
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.onWindowResize);
  }

  private onWindowResize = () => this.check();

  private check() {
    if (!this.enabled) { this.isOverflowing = false; return; }
    const host = this.el.nativeElement;
    // Si hay un hijo .marquee-content, medirlo; si no, medir el host directamente
    const content = host.querySelector('.marquee-content') as HTMLElement | null;
    const target = content ?? host;
    // Esperar a que el layout esté listo
    const client = target.clientWidth;
    const scroll = target.scrollWidth;
    this.isOverflowing = scroll > client + 2; // pequeño margen para antialiasing
  }
}
