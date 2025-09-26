import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../../services/profile.service';
import { ActivityService } from '../../../core/services/activity.service';

@Component({
  selector: 'app-settings-data',
  standalone: true,
  imports: [CommonModule],
  template: `
  <section class="card">
    <header class="card-header">
      <h2>Mis datos</h2>
      <p class="sub">Exporta tu información de cuenta.</p>
    </header>
    <div class="card-body">
      <button class="btn" (click)="exportMyData()">Descargar mis datos (JSON)</button>
    </div>
  </section>
  `,
  styleUrls: ['../settings.css']
})
export class SettingsData {
  private profile = inject(ProfileService);
  private activity = inject(ActivityService);

  exportMyData(){
    const data = {
      profile: this.profile.getProfile(),
      activity: this.activity.getEntries(),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mis-datos.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}
