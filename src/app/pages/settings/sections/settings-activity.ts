import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityService, type ActivityEntry } from '../../../core/services/activity.service';

@Component({
  selector: 'app-settings-activity',
  standalone: true,
  imports: [CommonModule],
  template: `
  <section class="card">
    <header class="card-header">
      <h2>Actividad reciente</h2>
      <p class="sub">Historial de inicios de sesión con fecha, IP y navegador.</p>
    </header>
    <div class="card-body">
      <div class="activity-list" *ngIf="entries().length; else empty">
        <div class="activity-item" *ngFor="let e of entries()">
          <div class="row">
            <div class="cell time">{{ e.date | date:'medium' }}</div>
            <div class="cell ip">IP: {{ e.ip }}</div>
            <div class="cell ua">{{ e.userAgent }}</div>
          </div>
        </div>
      </div>
      <ng-template #empty>
        <p class="muted">Sin actividad registrada aún.</p>
      </ng-template>
    </div>
  </section>
  `,
  styleUrls: ['../settings.css']
})
export class SettingsActivity {
  private activity = inject(ActivityService);
  entries = signal<ActivityEntry[]>(this.activity.getEntries());
}
