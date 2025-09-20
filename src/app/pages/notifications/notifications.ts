import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class NotificationsPage {
  // Estado reactivo
  private allNotifications = signal<NotificationItem[]>(this.mockData());
  search = signal('');
  filterKind = signal<NotificationKind | 'all'>('all');
  filterState = signal<'all' | NotificationState>('all');
  selectedIds = signal<Set<number>>(new Set());
  compactMode = signal(false);
  feedbackMessage = signal('');
  showAdvancedFilters = signal(false);
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
  unreadCount = computed(() => this.allNotifications().filter(n => n.state === 'unread').length);

  filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.allNotifications().filter(n => {
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
    this.allNotifications.update(items => items.map(n => n.state === 'unread' ? { ...n, state: 'read' } : n));
    this.emitFeedback('Todas marcadas como leídas.');
  }
  markSelectedRead() {
    const ids = this.selectedIds();
    if (!ids.size) return;
    this.allNotifications.update(items => items.map(n => ids.has(n.id) ? { ...n, state: 'read' } : n));
    this.clearSelection();
    this.emitFeedback('Selección marcada como leída.');
  }
  deleteSelected() {
    const ids = this.selectedIds();
    if (!ids.size) return; // validación
    this.allNotifications.update(items => items.filter(n => !ids.has(n.id)));
    this.clearSelection();
    this.emitFeedback(`${ids.size} notificación(es) eliminada(s).`);
  }
  deleteAll() {
    const count = this.allNotifications().length;
    if (!count) return;
    if (!window.confirm(`¿Eliminar TODAS las ${count} notificaciones? Esta acción no se puede deshacer.`)) return;
    this.allNotifications.set([]);
    this.clearSelection();
    this.emitFeedback('Todas las notificaciones fueron eliminadas.');
  }

  archiveSelected() {
    const ids = this.selectedIds();
    if (!ids.size) return;
    this.allNotifications.update(items => items.map(n => ids.has(n.id) ? { ...n, state: 'archived' } : n));
    this.clearSelection();
    this.emitFeedback(`${ids.size} notificación(es) archivada(s).`);
  }

  toggleRead(id: number) {
    this.allNotifications.update(items => items.map(n => n.id === id ? { ...n, state: n.state === 'unread' ? 'read' : n.state } : n));
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

  onKey(ev: KeyboardEvent) {
    const target = ev.target as HTMLElement;
    const tag = target?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return; // no interceptar escritura
    switch(ev.key) {
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

  private mockData(): NotificationItem[] {
    const base = Date.now();
    return [
      { id:1, kind:'proyecto', state:'unread', title:'Nuevo comentario en tu proyecto', body:'María comentó en "Sistema de Gestión Hospitalaria"', createdAt:new Date(base-5*60000)},
      { id:2, kind:'sistema', state:'unread', title:'Actualización de plataforma', body:'Se aplicará mantenimiento programado mañana a las 08:00.', createdAt:new Date(base-55*60000)},
      { id:3, kind:'mensaje', state:'read', title:'Mensaje de Coordinador', body:'Revisa las pautas de la próxima feria tecnológica.', createdAt:new Date(base-4*3600000)},
      { id:4, kind:'recordatorio', state:'unread', title:'Entrega intermedia', body:'Tu proyecto tiene una entrega en 2 días.', createdAt:new Date(base-9*3600000)},
      { id:5, kind:'alerta', state:'unread', title:'Posible conflicto de versiones', body:'Biblioteca X requiere actualización para compatibilidad.', createdAt:new Date(base-26*3600000)},
      { id:6, kind:'proyecto', state:'read', title:'Nuevo miembro agregado', body:'Se unió Javier al proyecto de Robótica.', createdAt:new Date(base-2*86400000)},
      { id:7, kind:'mensaje', state:'read', title:'Canal general', body:'Recuerda responder la encuesta de satisfacción.', createdAt:new Date(base-3*86400000)},
      { id:8, kind:'recordatorio', state:'archived', title:'Reunión semanal', body:'Stand-up semanal en 30 minutos.', createdAt:new Date(base-90*60000)},
    ];
  }
}

// Export nominal adicional (mantener mientras se estabiliza build) para asegurar módulo
export const __notificationsModuleMarker = true;
