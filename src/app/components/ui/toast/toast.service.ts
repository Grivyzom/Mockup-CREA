import { Injectable, signal } from '@angular/core';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastOptions {
  id?: string;
  message: string;
  type?: ToastType;
  duration?: number; // ms
  action?: { label: string; onClick: () => void };
  dismissible?: boolean;
}

export interface Toast extends Required<Omit<ToastOptions, 'id'>> { id: string; createdAt: number; }

let autoId = 0;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(opts: ToastOptions) {
    const id = opts.id ?? `t${Date.now()}_${autoId++}`;
    const toast: Toast = {
      id,
      message: opts.message,
      type: opts.type ?? 'info',
      duration: opts.duration ?? 4000,
      action: opts.action ?? undefined,
      dismissible: opts.dismissible ?? true,
      createdAt: Date.now()
    } as Toast;
    this._toasts.update(list => [...list, toast]);
    if (toast.duration > 0) {
      setTimeout(() => this.dismiss(id), toast.duration);
    }
    return id;
  }

  dismiss(id: string) {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }

  clear() { this._toasts.set([]); }
}
