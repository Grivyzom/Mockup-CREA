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

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'dashboard', component: Dashboard },
  { path: 'proyectos/nuevo', component: ProjectCreate },
  { path: 'login', component: Login },
  { path: 'perfil', component: Profile },
  { path: 'proyecto/:id', component: ProjectDetail },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: '404', component: NotFound },
  { path: '**', component: NotFound }
];
