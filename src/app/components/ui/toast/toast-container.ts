import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [NgClass],
  template: `
    @if (toasts().length) {
      <div class="toast-stack" role="region" aria-label="Notificaciones">
        @for (t of toasts(); track t.id) {
          <div class="toast" [ngClass]="'toast-' + t.type" [attr.data-id]="t.id" tabindex="0" role="status" aria-live="polite">
            <div class="toast-content">
              <span class="toast-icon" [ngClass]="'icon-' + t.type" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              <div class="toast-message">{{ t.message }}</div>
              @if (t.action) {<button type="button" class="toast-action" (click)="t.action.onClick()">{{ t.action.label }}</button>}
              @if (t.dismissible) {<button type="button" class="toast-close" aria-label="Cerrar" (click)="close(t.id)">×</button>}
            </div>
          </div>
        }
      </div>
    }
  `,
  styleUrls: ['./toast-container.css']
})
export class ToastContainer {
  constructor(private toastService: ToastService) {}
  toasts() { return this.toastService.toasts(); }
  close(id: string) { this.toastService.dismiss(id); }
}
