import { Injectable, signal, computed } from '@angular/core';
import type { NotificationItem, NotificationKind, NotificationState } from '../../pages/notifications/notifications';

// Servicio centralizado para notificaciones compartidas entre dropdown y página completa
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _items = signal<NotificationItem[]>(this._mockData());

  // Signals públicos
  readonly items = computed(() => this._items());
  readonly unreadCount = computed(() => this._items().filter(n => n.state === 'unread').length);

  // API básica
  getAll() { return this._items(); }
  getRecent(limit = 5) { return [...this._items()].sort((a,b)=> b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit); }
  add(item: NotificationItem) { this._items.update(list => [item, ...list]); }
  markRead(id: number) { this._items.update(list => list.map(n => n.id === id ? { ...n, state: n.state === 'unread' ? 'read' : n.state } : n)); }
  markAllRead() { this._items.update(list => list.map(n => n.state === 'unread' ? { ...n, state: 'read' } : n)); }
  delete(id: number) { this._items.update(list => list.filter(n => n.id !== id)); }
  upsertMany(items: NotificationItem[]) { this._items.set(items); }

  // Util para refactor de la página
  replaceAll(items: NotificationItem[]) { this._items.set(items); }

  private _mockData(): NotificationItem[] {
    const base = Date.now();
    return [
      { id:1, kind:'proyecto', state:'unread', title:'Nuevo comentario en tu proyecto', body:'María comentó en "Sistema de Gestión Hospitalaria"', createdAt:new Date(base-5*60000)},
      { id:2, kind:'sistema', state:'unread', title:'Actualización de plataforma', body:'Mantenimiento programado mañana 08:00.', createdAt:new Date(base-55*60000)},
      { id:3, kind:'mensaje', state:'read', title:'Mensaje de Coordinador', body:'Revisa las pautas para la feria tecnológica.', createdAt:new Date(base-4*3600000)},
      { id:4, kind:'recordatorio', state:'unread', title:'Entrega intermedia', body:'Tu proyecto entrega en 2 días.', createdAt:new Date(base-9*3600000)},
      { id:5, kind:'alerta', state:'unread', title:'Posible conflicto de versiones', body:'Biblioteca X requiere actualización.', createdAt:new Date(base-26*3600000)},
      { id:6, kind:'proyecto', state:'read', title:'Nuevo miembro agregado', body:'Se unió Javier al proyecto de Robótica.', createdAt:new Date(base-2*86400000)},
      { id:7, kind:'mensaje', state:'read', title:'Canal general', body:'Responde la encuesta de satisfacción.', createdAt:new Date(base-3*86400000)},
      { id:8, kind:'recordatorio', state:'archived', title:'Reunión semanal', body:'Stand-up en 30 minutos.', createdAt:new Date(base-90*60000)},
    ];
  }
}
