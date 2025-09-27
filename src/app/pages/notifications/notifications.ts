import { Component, computed, signal, effect, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { FilterChips } from '../../components/ui/filter/filter-chips';

// Tipos base para futura integración con backend
export type NotificationKind = 'proyecto' | 'sistema' | 'mensaje' | 'recordatorio' | 'alerta';
export type NotificationState = 'unread' | 'read' | 'archived';

export interface NotificationItem {
  id: number;
  kind: NotificationKind;
  state: NotificationState;
  title: string;
  body: string;
  createdAt: Date;
  meta?: Record<string, any>;
  actionable?: boolean;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FilterChips],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css']
})
export class NotificationsPage {
  // Estado reactivo principal ahora proviene del servicio compartido
  private allNotifications = computed(() => this.notificationService.items());
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;
  search = signal('');
  filterKind = signal<NotificationKind | 'all'>('all');
  filterState = signal<'all' | NotificationState>('all');
  selectedIds = signal<Set<number>>(new Set());
  compactMode = signal(false);
  feedbackMessage = signal('');
  showAdvancedFilters = signal(false);
  sortBy = signal<'reciente' | 'antiguo' | 'titulo-az' | 'titulo-za'>('reciente');
  // Conteo seleccionado
  selectedCount = computed(() => this.selectedIds().size);
  // Conteos por tipo (sobre conjunto filtrado por estado/archivado y búsqueda, pero antes de filtrar por kind para mostrar totales contextuales)
  kindCounts = computed(() => {
    const base = this.allNotifications();
    const term = this.search().trim().toLowerCase();
    const state = this.filterState();
    const counts: Record<NotificationKind, number> = {
      proyecto: 0, sistema: 0, mensaje: 0, recordatorio: 0, alerta: 0
    };
    for (const n of base) {
  if (state !== 'all' && n.state !== state) continue;
      if (term && !(
        n.title.toLowerCase().includes(term) ||
        n.body.toLowerCase().includes(term)
      )) continue;
      counts[n.kind]++;
    }
    return counts;
  });

  // Conteos por estado (sobre conjunto filtrado por tipo y búsqueda, antes de aplicar estado)
  stateCounts = computed(() => {
    const term = this.search().trim().toLowerCase();
    let all = 0, unread = 0, read = 0, archived = 0;
    for (const n of this.allNotifications()) {
      if (this.filterKind() !== 'all' && n.kind !== this.filterKind()) continue;
      if (term && !(n.title.toLowerCase().includes(term) || n.body.toLowerCase().includes(term))) continue;
      all++;
      if (n.state === 'unread') unread++; else if (n.state === 'read') read++; else archived++;
    }
    return { all, unread, read, archived };
  });

  totalVisibleCount = computed(() => this.filtered().length);
  filtersDirty = computed(() => !!this.search().trim() || this.filterKind() !== 'all' || this.filterState() !== 'all');
  allFilteredSelected = computed(() => {
    const f = this.filtered();
    if (!f.length) return false;
    const selected = this.selectedIds();
    for (const n of f) if (!selected.has(n.id)) return false;
    return true;
  });

  // Derivados
  unreadCount = computed(() => this.notificationService.unreadCount());

  filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const base = this.allNotifications().filter(n => {
      if (this.filterKind() !== 'all' && n.kind !== this.filterKind()) return false;
      if (this.filterState() !== 'all' && n.state !== this.filterState()) return false;
      if (term) {
        return (
          n.title.toLowerCase().includes(term) ||
          n.body.toLowerCase().includes(term)
        );
      }
      return true;
    });
    // Ordenar según preferencia
    const s = this.sortBy();
    const arr = [...base];
    switch(s){
      case 'reciente':
        arr.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'antiguo':
        arr.sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'titulo-az':
        arr.sort((a,b) => a.title.localeCompare(b.title));
        break;
      case 'titulo-za':
        arr.sort((a,b) => b.title.localeCompare(a.title));
        break;
    }
    return arr;
  });

  // Agrupación por fecha para UX (Hoy / Últimos 7 días / Anteriores)
  grouped = computed(() => {
    const items = [...this.filtered()].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
    const today: NotificationItem[] = [];
    const last7: NotificationItem[] = [];
    const older: NotificationItem[] = [];
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    for (const n of items) {
      const t = n.createdAt.getTime();
      if (t >= startOfToday) {
        today.push(n);
      } else if (t >= startOfToday - sevenDaysMs) {
        last7.push(n);
      } else {
        older.push(n);
      }
    }
    const groups: { label:string; items:NotificationItem[] }[] = [];
  if (today.length) groups.push({ label: 'Fecha', items: today });
  if (last7.length) groups.push({ label: 'Últimos 7d', items: last7 });
    if (older.length) groups.push({ label: 'Anteriores', items: older });
    return groups;
  });

  // Acciones
  toggleSelect(id: number) {
    const next = new Set(this.selectedIds());
    next.has(id) ? next.delete(id) : next.add(id);
    this.selectedIds.set(next);
  }

  selectAllVisible() { this.selectedIds.set(new Set(this.filtered().map(n => n.id))); }
  clearSelection() { this.selectedIds.set(new Set()); }
  toggleSelectAllVisible(){
    if (this.allFilteredSelected()) {
      this.clearSelection();
      this.emitFeedback('Selección limpiada.');
    } else {
      this.selectAllVisible();
      this.emitFeedback('Todas las visibles seleccionadas.');
    }
  }

  markAllRead() {
    this.notificationService.markAllRead();
    this.emitFeedback('Todas marcadas como leídas.');
  }
  markSelectedRead() {
    const ids = this.selectedIds();
    if (!ids.size) return;
    ids.forEach(id => this.notificationService.markRead(id));
    this.clearSelection();
    this.emitFeedback('Selección marcada como leída.');
  }
  deleteSelected() {
    const ids = this.selectedIds();
    if (!ids.size) return; // validación
    ids.forEach(id => this.notificationService.delete(id));
    this.clearSelection();
    this.emitFeedback(`${ids.size} notificación(es) eliminada(s).`);
  }
  deleteAll() {
    const count = this.allNotifications().length;
    if (!count) return;
    if (!window.confirm(`¿Eliminar TODAS las ${count} notificaciones? Esta acción no se puede deshacer.`)) return;
    // Reemplazar por arreglo vacío
    this.notificationService.replaceAll([]);
    this.clearSelection();
    this.emitFeedback('Todas las notificaciones fueron eliminadas.');
  }

  archiveSelected() {
    const ids = this.selectedIds();
    if (!ids.size) return;
    // Archivar equivaldrá a marcar como archived (iterar manualmente)
    const current = this.allNotifications();
    const updated = current.map(n => ids.has(n.id) ? { ...n, state: 'archived' as NotificationState } : n) as NotificationItem[];
    this.notificationService.replaceAll(updated);
    this.clearSelection();
    this.emitFeedback(`${ids.size} notificación(es) archivada(s).`);
  }

  toggleRead(id: number) {
    this.notificationService.markRead(id); // solo marca si estaba unread
    const n = this.allNotifications().find(x => x.id === id);
    if (n) this.emitFeedback(`Notificación '${n.title}' marcada como ${n.state === 'unread' ? 'no leída' : 'leída'}.`);
  }

  // trackBy para listas
  trackById(_index: number, item: NotificationItem) { return item.id; }

  // Entrada búsqueda controlando longitud y trimming
  setSearch(value: string) {
    const v = value.slice(0, 80); // limitar a 80 chars
    this.search.set(v);
  }

  resetFilters() {
    this.search.set('');
    this.filterKind.set('all');
    this.filterState.set('all');
    this.emitFeedback('Filtros restablecidos.');
  }

  toggleCompact() { this.compactMode.update(v => !v); }

  toggleAdvancedFilters(){
    this.showAdvancedFilters.update(v => !v);
  }

  // Persistencia de preferencias en localStorage
  private readonly LS_KEY = 'notifications_prefs';

  constructor(private notificationService: NotificationService){
    // Efecto para guardar cambios: debe registrarse durante la construcción
    effect(() => {
      const snapshot = { compact: this.compactMode(), sortBy: this.sortBy() };
      try { localStorage.setItem(this.LS_KEY, JSON.stringify(snapshot)); } catch {}
    });
  }

  ngOnInit(){
    try {
      const raw = localStorage.getItem(this.LS_KEY);
      if (raw) {
        const pref = JSON.parse(raw);
        if (typeof pref?.compact === 'boolean') this.compactMode.set(pref.compact);
        if (typeof pref?.sortBy === 'string') this.sortBy.set(pref.sortBy);
      }
    } catch {}
  }

  setSortBy(v: 'reciente' | 'antiguo' | 'titulo-az' | 'titulo-za'){ this.sortBy.set(v); }

  onKey(ev: KeyboardEvent) {
    const target = ev.target as HTMLElement;
    const tag = target?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return; // no interceptar escritura
    switch(ev.key) {
      case '/':
        ev.preventDefault();
        this.focusSearch();
        break;
      case 'a': case 'A':
        ev.preventDefault();
        this.selectAllVisible();
        this.emitFeedback('Todas las visibles seleccionadas.');
        break;
      case 'r': case 'R':
        if (this.selectedCount() > 0) {
          ev.preventDefault();
          this.markSelectedRead();
        }
        break;
      case 'Delete':
        if (this.selectedCount() > 0) {
          ev.preventDefault();
          this.deleteSelected();
        }
        break;
      case 'Escape':
        if (this.selectedCount() > 0) {
          ev.preventDefault();
          this.clearSelection();
          this.emitFeedback('Selección limpiada.');
        }
        break;
    }
  }

  focusSearch() {
    const el = this.searchInput?.nativeElement;
    if (el) {
      el.focus();
      // Seleccionar para escribir sobre lo anterior
      setTimeout(() => el.select(), 0);
    }
  }

  shareSelected() {
    const ids = this.selectedIds();
    if (!ids.size) return;
  const selected = this.allNotifications().filter(n => ids.has(n.id));
    const payload = selected.map(n => `• ${n.title} — ${n.body}`).join('\n');
    const nav: any = navigator;
    if (nav && nav.share) {
      nav.share({ title: 'Notificaciones seleccionadas', text: payload }).catch(()=>{});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(payload).catch(()=>{});
    }
    this.emitFeedback(`${ids.size} notificación(es) preparada(s) para compartir.`);
  }

  // Helpers UI
  kindLabel(kind: NotificationKind): string {
    switch(kind){
      case 'proyecto': return 'Proyecto';
      case 'sistema': return 'Sistema';
      case 'mensaje': return 'Mensaje';
      case 'recordatorio': return 'Recordatorio';
      case 'alerta': return 'Alerta';
      default: return kind;
    }
  }
  stateLabel(state: NotificationState): string {
    return state === 'unread' ? 'No leída' : state === 'read' ? 'Leída' : 'Archivada';
  }

  relativeTime(date: Date): string {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return mins + ' min';
    const hrs = Math.floor(mins/60);
    if (hrs < 24) return hrs + ' h';
    const days = Math.floor(hrs/24);
    if (days < 7) return days + ' d';
    return date.toLocaleDateString();
  }

  // Simple feedback (placeholder para futura aria-live)
  private emitFeedback(msg: string){
    // TODO: Integrar con aria-live region
    console.log('[NOTIFS]', msg);
    this.feedbackMessage.set(msg);
    // Limpiar después de unos segundos para no saturar lectores
    setTimeout(() => {
      if (this.feedbackMessage() === msg) this.feedbackMessage.set('');
    }, 5000);
  }

  // mockData ya movido al servicio
}

// Export nominal adicional (mantener mientras se estabiliza build) para asegurar módulo
export const __notificationsModuleMarker = true;
