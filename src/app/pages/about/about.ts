import { Component, computed, signal, effect, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule],
  templateUrl: './about.html',
  styleUrls: ['./about.css']
})
export class About implements AfterViewInit, OnDestroy {
  templates = [
    { id:'campaign', name:'Campaña de marketing', description:'Crea una campaña atractiva para impulsar alcance.' , icon: '📣', color:'bg-pink-600'},
    { id:'engineering', name:'Proyecto de ingeniería', description:'Estructura técnica inicial para desarrollo.' , icon: '🧪', color:'bg-violet-600'},
    { id:'event', name:'Evento', description:'Organiza un evento memorable con logística clara.' , icon: '📅', color:'bg-yellow-500 text-gray-900'}
  ];

  showEmptyState = computed(() => this.projectService.projects().length === 0 && this.projectService.isFirstVisit());
  editingId = signal<string | null>(null);
  editTitle = signal('');
  editDescription = signal('');
  originalTitle = signal('');
  originalDescription = signal('');
  saving = signal(false);
  lastToast = signal<string | null>(null);
  query = signal('');
  sortMode = signal<'recent'|'name'>('recent');
  highlightNewId = signal<string | null>(null);
  pageSize = signal(6);
  confirmDeleteId = signal<string | null>(null);
  confirmDeleteName = signal<string>('');
  animateFromIndex = signal<number>(0);
  lastDeleted = signal<any | null>(null);
  undoTimeout: any = null;
  exitingEditId = signal<string | null>(null); // para animación salida

  @ViewChild('sentinel') sentinel?: ElementRef<HTMLDivElement>;
  @ViewChild('modalPanel') modalPanel?: ElementRef<HTMLDivElement>;
  private intersectionObserver?: IntersectionObserver;

  filteredProjects = computed(() => {
    let list = this.projectService.projects();
    const q = this.query().trim().toLowerCase();
    if(q){
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if(this.sortMode()==='name'){
      list = [...list].sort((a,b)=> a.name.localeCompare(b.name));
    } else {
      list = [...list].sort((a,b)=> b.createdAt.getTime() - a.createdAt.getTime());
    }
    return list;
  });

  visibleProjects = computed(() => this.filteredProjects().slice(0, this.pageSize()));

  constructor(public projectService: ProjectService, private router: Router){
    effect(() => {
      if(this.projectService.projects().length > 0){
        this.projectService.acknowledgeVisit();
      }
    });

    // Reactivar / detener observer según estado de items visibles
    effect(() => {
      const total = this.filteredProjects().length;
      const visible = this.visibleProjects().length;
      if(visible < total){
        // Asegura que el observer esté activo si hay más por cargar
        queueMicrotask(()=> this.setupObserver());
      } else {
        if(this.intersectionObserver) this.intersectionObserver.disconnect();
      }
    });
  }

  ngAfterViewInit(){
    this.setupObserver();
  }

  ngOnDestroy(){
    if(this.intersectionObserver) this.intersectionObserver.disconnect();
  }

  private setupObserver(){
    if(!this.sentinel) return;
    if(this.intersectionObserver) this.intersectionObserver.disconnect();
    this.intersectionObserver = new IntersectionObserver(entries => {
      for(const entry of entries){
        if(entry.isIntersecting){
          if(this.visibleProjects().length < this.filteredProjects().length){
            this.loadMore();
          }
        }
      }
    }, { rootMargin: '200px 0px 400px' });
    this.intersectionObserver.observe(this.sentinel.nativeElement);
  }

  useTemplate(t: any){
    this.projectService.createFromTemplate(t);
    // La visita se marcará como reconocida cuando el usuario guarde su primer proyecto real.
    this.router.navigate(['/proyectos/nuevo']);
  }

  startEmpty(){
    this.projectService.createEmpty();
    this.router.navigate(['/proyectos/nuevo']);
  }

  beginEdit(p: any){
    this.editingId.set(p.id);
    this.editTitle.set(p.name);
    this.editDescription.set(p.description);
    this.originalTitle.set(p.name);
    this.originalDescription.set(p.description);
    // Enfocar input título tras render
    setTimeout(() => {
      const el = document.querySelector<HTMLInputElement>(`input[data-editing='${p.id}']`);
      el?.focus();
      el?.select();
    });
  }

  cancelEdit(){
    const id = this.editingId();
    if(id){
      this.exitingEditId.set(id);
      // esperar animación de salida antes de limpiar
      setTimeout(()=>{ if(this.exitingEditId()==id) this.exitingEditId.set(null); }, 250);
    }
    this.editingId.set(null);
    this.saving.set(false);
    if(this.originalTitle() || this.originalDescription()){
      this.showToast('Cambios descartados');
    }
  }

  saveEdit(){
    const id = this.editingId();
    if(!id) return;
    const name = this.editTitle().trim();
    const desc = this.editDescription().trim();
    if(name.length < 3 || desc.length < 5) return; // validaciones simples
    this.saving.set(true);
    const optimistic = { name, description: desc };
    this.projectService.updateProjectOptimistic(id, optimistic, 500, 0) // failChance 0 ahora
      .then(res => {
        if(res.ok){
          this.showToast('Proyecto guardado');
        } else {
          this.showToast('Error al guardar (rollback)');
        }
      })
      .finally(() => {
        this.saving.set(false);
        const exiting = this.editingId();
        if(exiting){
          this.exitingEditId.set(exiting);
          setTimeout(()=>{ if(this.exitingEditId()==exiting) this.exitingEditId.set(null); }, 250);
        }
        this.editingId.set(null);
      });
  }

  isEditValid(){
    return this.editTitle().trim().length >= 3 && this.editDescription().trim().length >= 5;
  }

  isFieldChanged(field: 'title'|'description'){
    if(field==='title') return this.editTitle().trim() !== this.originalTitle().trim();
    return this.editDescription().trim() !== this.originalDescription().trim();
  }

  showToast(message: string){
    this.lastToast.set(message);
    setTimeout(()=> { if(this.lastToast() === message) this.lastToast.set(null); }, 3000);
  }

  autoGrow(event: Event){
    const el = event.target as HTMLTextAreaElement;
    if(!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 400) + 'px';
  }

  deleteProject(p: any){
    if(confirm('¿Eliminar proyecto "'+p.name+'"? Esta acción no se puede deshacer.')){
      this.projectService.deleteProject(p.id);
    }
  }

  openDelete(p:any){
    this.editingId.set(null);
    this.confirmDeleteId.set(p.id);
    this.confirmDeleteName.set(p.name);
    // Enfocar panel tras siguiente ciclo de render
    setTimeout(()=>{
      const el = this.modalPanel?.nativeElement;
      if(el) el.focus();
    });
  }

  closeDelete(){
    this.confirmDeleteId.set(null);
  }

  confirmDelete(){
    const id = this.confirmDeleteId();
    if(id){
      const removed = this.projectService.deleteProjectAndReturn(id);
      if(removed){
        this.lastDeleted.set(removed);
        if(this.undoTimeout) clearTimeout(this.undoTimeout);
        this.showToast('Proyecto eliminado · Deshacer');
        this.undoTimeout = setTimeout(()=>{
          if(this.lastDeleted() === removed){
            this.lastDeleted.set(null);
          }
        }, 5000);
      }
    }
    this.closeDelete();
  }

  undoDelete(){
    const proj = this.lastDeleted();
    if(!proj) return;
    this.projectService.restoreProject(proj);
    this.lastDeleted.set(null);
    if(this.undoTimeout) clearTimeout(this.undoTimeout);
    this.showToast('Restaurado');
  }

  handleModalKey(event: KeyboardEvent){
    if(!this.confirmDeleteId()) return; // modal no visible
    if(event.key === 'Escape'){
      event.stopPropagation();
      this.closeDelete();
      return;
    }
    if(event.key === 'Tab'){
      const panel = this.modalPanel?.nativeElement; if(!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>([
        'button','[href]','input','select','textarea','[tabindex]:not([tabindex="-1"])'
      ].join(','))).filter(el => !el.hasAttribute('disabled'));
      if(focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length -1];
      const active = document.activeElement as HTMLElement;
      if(event.shiftKey){
        if(active === first){
          event.preventDefault();
          last.focus();
        }
      } else {
        if(active === last){
          event.preventDefault();
          first.focus();
        }
      }
    }
  }

  loadMore(){
    const current = this.pageSize();
    const total = this.filteredProjects().length;
    if(current < total){
      const oldLen = this.visibleProjects().length;
      this.pageSize.set(Math.min(current + 6, total));
      // Índice desde el que se anima la nueva tanda
      this.animateFromIndex.set(oldLen);
    }
    // Desconecta si ya cargamos todo
    if(this.pageSize() >= total && this.intersectionObserver){
      this.intersectionObserver.disconnect();
    }
  }

  openProject(p: any){
    this.router.navigate(['/proyecto', p.id]);
  }

  // Llamar esto externamente cuando se cree un proyecto si quisiéramos destacar (por ahora se puede usar manualmente)
  markNew(id: string){
    this.highlightNewId.set(id);
    setTimeout(()=>{ if(this.highlightNewId()==id) this.highlightNewId.set(null); }, 3500);
  }

  leaderInitials(name?: string){
    if(!name) return '–';
    const parts = name.trim().split(/\s+/).slice(0,2);
    return parts.map(p=>p[0]?.toUpperCase()||'').join('');
  }

  timeAgo(date: Date){
    const now = Date.now();
    const diffMs = now - date.getTime();
    const sec = Math.floor(diffMs/1000);
    if(sec < 60) return 'hace ' + sec + 's';
    const min = Math.floor(sec/60);
    if(min < 60) return 'hace ' + min + 'm';
    const hrs = Math.floor(min/60);
    if(hrs < 24) return 'hace ' + hrs + 'h';
    const days = Math.floor(hrs/24);
    if(days < 7) return 'hace ' + days + 'd';
    const weeks = Math.floor(days/7);
    if(weeks < 4) return 'hace ' + weeks + 'sem';
    const months = Math.floor(days/30);
    if(months < 12) return 'hace ' + months + 'm';
    const years = Math.floor(days/365);
    return 'hace ' + years + 'a';
  }

  isRecent(date: Date){
    return Date.now() - date.getTime() < 1000*60*60*24; // < 24h
  }

}
