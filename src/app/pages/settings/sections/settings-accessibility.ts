import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessibilityService } from '../../../core/services/accessibility.service';

@Component({
  selector: 'app-settings-accessibility',
  standalone: true,
  imports: [CommonModule],
  template: `
  <section class="card">
    <header class="card-header">
      <h2>Accesibilidad</h2>
      <p class="sub">Tema, tamaño de letra y contraste.</p>
    </header>
    <div class="card-body grid-3">
      <div class="field">
        <label>Tema</label>
        <div class="choices">
          <button class="btn" [class.active]="a11y.theme()==='light'" (click)="a11y.setTheme('light')">Claro</button>
          <button class="btn" [class.active]="a11y.theme()==='dark'" (click)="a11y.setTheme('dark')">Oscuro</button>
          <button class="btn" [class.active]="a11y.theme()==='system'" (click)="a11y.setTheme('system')">Sistema</button>
        </div>
      </div>
      <div class="field">
        <label>Letra</label>
        <div class="choices">
          <button class="btn" [class.active]="a11y.font()==='md'" (click)="a11y.setFont('md')">Normal</button>
          <button class="btn" [class.active]="a11y.font()==='lg'" (click)="a11y.setFont('lg')">Grande</button>
          <button class="btn" [class.active]="a11y.font()==='xl'" (click)="a11y.setFont('xl')">Muy grande</button>
        </div>
      </div>
      <div class="field">
        <label>Contraste</label>
        <div class="choices">
          <button class="btn" [class.active]="a11y.contrast()==='normal'" (click)="a11y.setContrast('normal')">Normal</button>
          <button class="btn" [class.active]="a11y.contrast()==='high'" (click)="a11y.setContrast('high')">Alto</button>
        </div>
      </div>
    </div>
  </section>
  `,
  styleUrls: ['../settings.css']
})
export class SettingsAccessibility {
  a11y = inject(AccessibilityService);
}
