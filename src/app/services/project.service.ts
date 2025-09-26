import { Injectable, signal } from '@angular/core';

export interface Project {
  id: string;
  name: string;
  description: string;
  template?: string; // id de plantilla usada
  createdAt: Date;
  progress: number; // 0-100
  members: number;  // número de integrantes
  leaderName?: string; // nombre del líder del proyecto
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private storageKey = 'app-projects';
  private firstVisitKey = 'app-projects-first-visit';

  projects = signal<Project[]>(this.load());
  pendingTemplate = signal<{ id:string; name:string; description:string } | null>(null);

  constructor(){
    if(!localStorage.getItem(this.firstVisitKey)){
      localStorage.setItem(this.firstVisitKey, 'true');
    }
  }

  isFirstVisit(): boolean {
    return localStorage.getItem(this.firstVisitKey) === 'true';
  }

  acknowledgeVisit(){
    localStorage.setItem(this.firstVisitKey, 'false');
  }

  private load(): Project[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if(!raw) return [];
      const parsed = JSON.parse(raw) as any[];
      return parsed.map(p => ({
        ...p,
        createdAt: new Date(p.createdAt),
        progress: typeof p.progress === 'number' ? p.progress : 0,
        members: typeof p.members === 'number' ? p.members : 1,
        leaderName: typeof p.leaderName === 'string' ? p.leaderName : '—'
      }));
    } catch { return []; }
  }

  private persist(){
    try { localStorage.setItem(this.storageKey, JSON.stringify(this.projects())); } catch {}
  }

  createFromTemplate(template: { id:string; name:string; description:string; }){
    // Guardar plantilla pendiente para que el formulario se inicialice y usuario lo edite antes de persistir
    this.pendingTemplate.set({ id: template.id, name: template.name, description: template.description });
  }

  createEmpty(){
    const proj: Project = {
      id: crypto.randomUUID(),
      name: 'Nuevo Proyecto',
      description: 'Descripción pendiente',
      createdAt: new Date(),
      progress: 0,
      members: 1,
      leaderName: '—'
    };
    this.projects.update(list => [...list, proj]);
    this.persist();
  }

  consumePendingTemplate(){
    const tpl = this.pendingTemplate();
    if(!tpl) return null;
    this.pendingTemplate.set(null);
    return tpl;
  }

  updateProject(id: string, changes: Partial<Pick<Project,'name'|'description'>>){
    let changed = false;
    this.projects.update(list => list.map(p => {
      if(p.id === id){
        changed = true;
        return { ...p, ...changes };
      }
      return p;
    }));
    if(changed) this.persist();
  }

  // Permite simular persistencia remota con rollback ante error
  updateProjectOptimistic(id: string, changes: Partial<Pick<Project,'name'|'description'>>, simulateDelay = 650, failChance = 0){
    const before = this.projects();
    let applied = false;
    this.projects.update(list => list.map(p => p.id === id ? (applied = true, { ...p, ...changes }) : p));
    if(applied) this.persist();
    return new Promise<{ ok: boolean }>((resolve) => {
      setTimeout(() => {
        const fail = Math.random() < failChance;
        if(fail){
          this.projects.set(before); // rollback
          this.persist();
          resolve({ ok:false });
        } else {
          resolve({ ok:true });
        }
      }, simulateDelay);
    });
  }

  deleteProject(id: string){
    const before = this.projects().length;
    this.projects.update(list => list.filter(p => p.id !== id));
    if(this.projects().length !== before){
      this.persist();
    }
  }

  deleteProjectAndReturn(id: string){
    let removed: Project | null = null;
    this.projects.update(list => {
      return list.filter(p => {
        if(p.id === id){
          removed = p;
          return false;
        }
        return true;
      });
    });
    if(removed){ this.persist(); }
    return removed;
  }

  restoreProject(project: Project){
    // Evitar duplicados si ya existe
    if(this.projects().some(p => p.id === project.id)) return;
    this.projects.update(list => [...list, project]);
    this.persist();
  }

  addProject(data: { name: string; description: string; template?: string; leaderName?: string }): Project {
    const proj: Project = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      template: data.template,
      createdAt: new Date(),
      progress: 0,
      members: 1,
      leaderName: data.leaderName || '—'
    };
    this.projects.update(list => [...list, proj]);
    this.persist();
    return proj;
  }
}
