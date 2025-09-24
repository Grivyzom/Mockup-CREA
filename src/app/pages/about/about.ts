import { Component, computed, signal, effect, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-about',
  imports: [CommonModule, NgIf, NgFor, FormsModule],
  templateUrl: './about.html',
  styleUrl: './about.css'
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
  query = signal('');
  sortMode = signal<'recent'|'name'>('recent');
  highlightNewId = signal<string | null>(null);
  pageSize = signal(6);
  confirmDeleteId = signal<string | null>(null);
  confirmDeleteName = signal<string>('');
  animateFromIndex = signal<number>(0);

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
  }

  cancelEdit(){
    this.editingId.set(null);
  }

  saveEdit(){
    const id = this.editingId();
    if(!id) return;
    const name = this.editTitle().trim();
    const desc = this.editDescription().trim();
    if(name.length < 3 || desc.length < 5) return; // validaciones simples
    this.projectService.updateProject(id, { name, description: desc });
    this.editingId.set(null);
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
      this.projectService.deleteProject(id);
    }
    this.closeDelete();
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

}
