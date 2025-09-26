import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { NotFound } from './pages/not-found/not-found';
import { ProjectDetail } from './pages/project-detail/project-detail';
import { Dashboard } from './pages/dashboard/dashboard';
import { ProjectCreate } from './pages/project-create/project-create';
import { Login } from './pages/login/login';
import { Profile } from './pages/profile/profile';
import { Help } from './pages/help/help';
import { NotificationsPage } from './pages/notifications/notifications';
import { SettingsShell } from './pages/settings/settings-shell';
import { SettingsAccessibility } from './pages/settings/sections/settings-accessibility';
import { SettingsPublicProfile } from './pages/settings/sections/settings-public-profile';
import { SettingsActivity } from './pages/settings/sections/settings-activity';
import { SettingsData } from './pages/settings/sections/settings-data';
import { SettingsCookies } from './pages/settings/sections/settings-cookies';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'dashboard', component: Dashboard },
  { path: 'proyectos/nuevo', component: ProjectCreate },
  { path: 'login', component: Login },
  { path: 'perfil', component: Profile },
  { path: 'ayuda', component: Help },
  { path: 'notificaciones', component: NotificationsPage },
  { path: 'settings', component: SettingsShell, children: [
    { path: '', pathMatch: 'full', redirectTo: 'accesibilidad' },
    { path: 'accesibilidad', component: SettingsAccessibility },
    { path: 'perfil-publico', component: SettingsPublicProfile },
    { path: 'actividad', component: SettingsActivity },
    { path: 'datos', component: SettingsData },
    { path: 'cookies', component: SettingsCookies },
  ]},
  { path: 'configuracion', redirectTo: '/settings', pathMatch: 'full' },
  // Alias para usuarios que escriben la ruta con mayúscula inicial (evita 404)
  { path: 'Notificaciones', redirectTo: '/notificaciones', pathMatch: 'full' },
  { path: 'help', redirectTo: '/ayuda', pathMatch: 'full' },
  { path: 'proyecto/:id', component: ProjectDetail },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: '404', component: NotFound },
  { path: '**', component: NotFound }
];
