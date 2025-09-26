import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface Section { path: string; label: string; }

@Component({
  selector: 'app-settings-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './settings-shell.html',
  styleUrls: ['./settings-shell.css']
})
export class SettingsShell {
  sections: Section[] = [
    { path: 'accesibilidad', label: 'Accesibilidad' },
  { path: 'perfil-publico', label: 'Apariencia' },
    { path: 'actividad', label: 'Actividad' },
    { path: 'datos', label: 'Mis datos' },
    { path: 'cookies', label: 'Cookies' },
  ];
  selected = this.sections[0].path;
}
