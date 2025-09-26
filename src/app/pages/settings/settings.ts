import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccessibilityService } from '../../core/services/accessibility.service';
import { ProfileService, type StudentProfile } from '../../services/profile.service';
import { ActivityService, type ActivityEntry } from '../../core/services/activity.service';

interface CookiePrefs { analytics: boolean; marketing: boolean; necessary: boolean; }

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class SettingsPage implements OnInit {
  private a11y = inject(AccessibilityService);
  private profileSrv = inject(ProfileService);
  private activity = inject(ActivityService);

  // Accesibilidad (vinculado a servicio global)
  theme = this.a11y.theme;
  contrast = this.a11y.contrast;
  font = this.a11y.font;

  // Perfil público
  profile = signal<StudentProfile>(this.profileSrv.getProfile());
  displayName = signal<string>('');
  bio = signal<string>('');

  // Actividad
  entries = signal<ActivityEntry[]>([]);

  // Cookies/consentimiento
  cookiePrefs = signal<CookiePrefs>({ analytics: true, marketing: false, necessary: true });

  ngOnInit(): void {
    // Inicializar nombre público y bio con fallback a username
    const p = this.profile();
    this.displayName.set((p as any).displayName || p.username);
    this.bio.set((p as any).bio || '');

    // Cargar actividad
    this.entries.set(this.activity.getEntries());

    // Cargar preferencias de cookies previas
    try {
      const raw = localStorage.getItem('cookie_prefs');
      if (raw) this.cookiePrefs.set(JSON.parse(raw));
    } catch {}
  }

  // Guardar cambios en Accesibilidad (se actualiza en vivo por signals)
  setTheme(v: 'light'|'dark'|'system'){ this.a11y.setTheme(v); }
  setContrast(v: 'normal'|'high'){ this.a11y.setContrast(v); }
  setFont(v: 'md'|'lg'|'xl'){ this.a11y.setFont(v); }

  // Perfil público
  savePublicProfile(){
    const p = { ...this.profile() } as any;
    p.displayName = this.displayName();
    p.bio = this.bio();
    this.profileSrv.updateProfile(p as StudentProfile);
    this.profile.set(p as StudentProfile);
  }

  // Exportar datos (perfil + actividad) como JSON
  exportMyData(){
    const data = {
      profile: this.profileSrv.getProfile(),
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

  // Cookies y consentimiento (mock localStorage)
  saveCookiePrefs(){
    try { localStorage.setItem('cookie_prefs', JSON.stringify(this.cookiePrefs())); } catch {}
  }

  updateCookie(key: 'analytics'|'marketing', value: boolean){
    const next = { ...this.cookiePrefs(), [key]: value } as CookiePrefs;
    this.cookiePrefs.set(next);
  }
}
