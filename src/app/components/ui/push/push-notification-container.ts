import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { PushNotificationService } from './push-notification.service';

@Component({
  selector: 'app-push-container',
  standalone: true,
  imports: [NgClass],
  template: `
    @if (items().length) {
      <div class="push-stack" role="region" aria-label="Notificaciones del sistema">
        @for (n of items(); track n.id) {
          <article class="push" [ngClass]="'push-' + n.type" [attr.data-id]="n.id" role="alert" tabindex="0">
            <div class="push-row">
              @if (n.icon) {<div class="push-icon" aria-hidden="true">{{ n.icon }}</div>}
              <div class="push-body">
                <h4 class="push-title">{{ n.title }}</h4>
                <p class="push-msg">{{ n.message }}</p>
                @if (n.actions.length) {
                  <div class="push-actions">
                    @for (a of n.actions; track a.label) {
                      <button type="button" class="push-action" [ngClass]="{'primary': a.primary}" (click)="handle(n.id,a.onClick)">{{ a.label }}</button>
                    }
                  </div>
                }
              </div>
              @if (n.dismissible) {<button type="button" class="push-close" aria-label="Cerrar" (click)="dismiss(n.id)">×</button>}
            </div>
          </article>
        }
      </div>
    }
  `,
  styleUrls: ['./push-notification-container.css']
})
export class PushNotificationContainer {
  constructor(private svc: PushNotificationService) {}
  items() { return this.svc.items(); }
  dismiss(id: string) { this.svc.dismiss(id); }
  handle(id: string, fn: () => void) { fn(); this.dismiss(id); }
}
