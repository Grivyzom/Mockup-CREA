import { Injectable, signal, effect } from '@angular/core';

export interface ModalButton {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  action?: () => void | boolean | Promise<void | boolean>;
  closeOnClick?: boolean;
  disabled?: boolean;
}

export interface ModalConfig {
  id?: string;
  title?: string;
  content?: string | HTMLElement; // simple string; slots avanzados se podrían extender luego
  width?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
  backdropClose?: boolean;
  buttons?: ModalButton[];
  autoFocus?: boolean;
  ariaLabel?: string; // fallback accesibilidad
}

export interface OpenModal extends Required<Omit<ModalConfig, 'id'>> { id: string; createdAt: number; }

let modalAutoId = 0;

@Injectable({ providedIn: 'root' })
export class ModalService {
  private _active = signal<OpenModal | null>(null);
  readonly active = this._active.asReadonly();

  open(cfg: ModalConfig) {
    const id = cfg.id ?? `m${Date.now()}_${modalAutoId++}`;
    const modal: OpenModal = {
      id,
      title: cfg.title ?? '',
      content: cfg.content ?? '',
      width: cfg.width ?? 'md',
      closable: cfg.closable ?? true,
      backdropClose: cfg.backdropClose ?? true,
      buttons: cfg.buttons ?? [],
      autoFocus: cfg.autoFocus ?? true,
      ariaLabel: cfg.ariaLabel ?? cfg.title ?? 'Diálogo',
      createdAt: Date.now()
    };
    this._active.set(modal);
    return id;
  }

  close(id?: string) {
    if (!this._active()) return;
    if (id && this._active()!.id !== id) return;
    this._active.set(null);
  }
}
