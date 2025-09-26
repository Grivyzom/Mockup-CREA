import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CookiePrefs { analytics: boolean; marketing: boolean; necessary: boolean; }

@Component({
  selector: 'app-settings-cookies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <section class="card">
    <header class="card-header">
      <h2>Cookies y consentimiento</h2>
      <p class="sub">Gestiona tus preferencias.</p>
    </header>
    <div class="card-body cookie-grid">
      <label class="cookie-item">
        <input type="checkbox" [ngModel]="prefs().necessary" disabled />
        <span>Necesarias (siempre activas)</span>
      </label>
      <label class="cookie-item">
        <input type="checkbox" [ngModel]="prefs().analytics" (ngModelChange)="update('analytics', $event)" />
        <span>Analíticas</span>
      </label>
      <label class="cookie-item">
        <input type="checkbox" [ngModel]="prefs().marketing" (ngModelChange)="update('marketing', $event)" />
        <span>Marketing</span>
      </label>
      <div class="actions">
        <button class="btn" (click)="save()">Guardar preferencias</button>
      </div>
    </div>
  </section>
  `,
  styleUrls: ['../settings.css']
})
export class SettingsCookies {
  prefs = signal<CookiePrefs>({ analytics: true, marketing: false, necessary: true });

  constructor(){
    try { const raw = localStorage.getItem('cookie_prefs'); if (raw) this.prefs.set(JSON.parse(raw)); } catch {}
  }

  update(key: 'analytics'|'marketing', value: boolean){
    this.prefs.set({ ...this.prefs(), [key]: value });
  }
  save(){
    try { localStorage.setItem('cookie_prefs', JSON.stringify(this.prefs())); } catch {}
  }
}
