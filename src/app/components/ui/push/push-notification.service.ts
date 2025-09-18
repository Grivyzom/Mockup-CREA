import { Injectable, signal } from '@angular/core';

export interface PushAction {
  label: string;
  primary?: boolean;
  onClick: () => void;
}

export interface PushOptions {
  id?: string;
  title: string;
  message: string;
  icon?: string; // optional svg path or emoji placeholder
  timeout?: number; // ms, 0 = sticky
  actions?: PushAction[];
  type?: 'info' | 'success' | 'warning' | 'error';
  dismissible?: boolean;
}

export interface PushNotification extends Required<Omit<PushOptions, 'id'>> { id: string; createdAt: number; }

let pushAutoId = 0;

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private _items = signal<PushNotification[]>([]);
  readonly items = this._items.asReadonly();

  show(opts: PushOptions) {
    const id = opts.id ?? `p${Date.now()}_${pushAutoId++}`;
    const item: PushNotification = {
      id,
      title: opts.title,
      message: opts.message,
      icon: opts.icon ?? '',
      timeout: opts.timeout ?? 8000,
      actions: opts.actions ?? [],
      type: opts.type ?? 'info',
      dismissible: opts.dismissible ?? true,
      createdAt: Date.now()
    };
    this._items.update(list => [...list, item]);
    if (item.timeout > 0) {
      setTimeout(() => this.dismiss(id), item.timeout);
    }
    return id;
  }

  dismiss(id: string) {
    this._items.update(list => list.filter(n => n.id !== id));
  }

  clear() { this._items.set([]); }
}
