import { Injectable, effect, signal } from '@angular/core';

type Theme = 'light' | 'dark' | 'system';
type Contrast = 'normal' | 'high';
type FontScale = 'md' | 'lg' | 'xl';

interface A11yPrefs { theme: Theme; contrast: Contrast; font: FontScale; }

@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  private readonly LS_KEY = 'a11y_prefs';
  theme = signal<Theme>('light');
  contrast = signal<Contrast>('normal');
  font = signal<FontScale>('md');

  constructor(){
    // Cargar preferencias guardadas
    try {
      const raw = localStorage.getItem(this.LS_KEY);
      if (raw) {
        const p: Partial<A11yPrefs> = JSON.parse(raw);
        if (p.theme) this.theme.set(p.theme);
        if (p.contrast) this.contrast.set(p.contrast);
        if (p.font) this.font.set(p.font);
      }
    } catch {}

    // Aplicar clases/effects al <html>
    effect(() => {
      const root = document.documentElement;
      const t = this.theme();
      const c = this.contrast();
      const f = this.font();

      // Tema
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const useDark = t === 'dark' || (t === 'system' && prefersDark);
      root.classList.toggle('theme-dark', useDark);
      root.classList.toggle('theme-light', !useDark);

      // Contraste
      root.classList.toggle('contrast-high', c === 'high');

      // Tamaño de fuente
      root.classList.remove('font-md','font-lg','font-xl');
      root.classList.add(`font-${f}`);

      // Persistir
      try { localStorage.setItem(this.LS_KEY, JSON.stringify({ theme: t, contrast: c, font: f })); } catch {}
    });
  }

  setTheme(t: Theme){ this.theme.set(t); }
  setContrast(c: Contrast){ this.contrast.set(c); }
  setFont(f: FontScale){ this.font.set(f); }
  toggleTheme(){ this.setTheme(this.theme() === 'dark' ? 'light' : 'dark'); }
}
