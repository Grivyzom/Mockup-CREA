import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { NgClass, NgIf, NgFor } from '@angular/common';
import { ModalService } from './modal.service';

@Component({
  selector: 'app-modal-container',
  standalone: true,
  imports: [NgClass, NgIf, NgFor],
  template: `
    @if (active()) {
      <div class="modal-backdrop" (click)="backdropClick($event)" aria-hidden="true"></div>
      <div class="modal-wrapper" role="dialog" [attr.aria-label]="active()!.ariaLabel" [attr.aria-modal]="true">
        <div class="modal" [ngClass]="'w-' + active()!.width" #panel tabindex="-1">
          @if (active()!.closable) {
            <button class="modal-close" type="button" aria-label="Cerrar" (click)="close()">×</button>
          }
          @if (active()!.title) {<h3 class="modal-title">{{ active()!.title }}</h3>}
          @if (active()!.content && isStringContent()) {<div class="modal-content" [innerHTML]="active()!.content"></div>}
          <div class="modal-buttons" *ngIf="active()!.buttons.length">
            <button *ngFor="let b of active()!.buttons" type="button" class="modal-btn" [ngClass]="'btn-' + (b.variant||'secondary')" [disabled]="b.disabled" (click)="buttonClick(b)">{{ b.label }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './modal-container.css'
})
export class ModalContainer implements AfterViewInit, OnDestroy {
  @ViewChild('panel') panel?: ElementRef<HTMLDivElement>;
  private lastFocused: HTMLElement | null = null;
  constructor(private modal: ModalService) {}

  active() { return this.modal.active(); }

  isStringContent(): boolean { return typeof this.active()!.content === 'string'; }

  close() { this.modal.close(); this.restoreFocus(); }

  backdropClick(ev: MouseEvent) {
    if (!this.active()) return;
    if (!this.active()!.backdropClose) return;
    // Sólo cerrar si el click proviene directamente del backdrop (no del contenido)
    const target = ev.target as HTMLElement;
    if (target.classList.contains('modal-backdrop')) {
      this.close();
    }
  }

  buttonClick(btn: any) {
    const result = btn.action?.();
    if (result instanceof Promise) {
      result.then(r => { if (btn.closeOnClick !== false && r !== false) this.close(); });
    } else {
      if (btn.closeOnClick !== false && result !== false) this.close();
    }
  }

  ngAfterViewInit() {
    queueMicrotask(() => {
      if (this.active() && this.active()!.autoFocus && this.panel?.nativeElement) {
        this.lastFocused = document.activeElement as HTMLElement;
        this.panel.nativeElement.focus();
      }
    });
  }

  restoreFocus() {
    if (this.lastFocused) {
      this.lastFocused.focus();
      this.lastFocused = null;
    }
  }

  @HostListener('document:keydown', ['$event']) onKey(ev: KeyboardEvent) {
    if (ev.key === 'Escape' && this.active()?.closable) {
      this.close();
    }
    if (ev.key === 'Tab' && this.active()) {
      this.trapFocus(ev);
    }
  }

  private trapFocus(ev: KeyboardEvent) {
    const focusable = this.panel?.nativeElement.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable || focusable.length === 0) return;
    const list = Array.from(focusable).filter(el => !el.hasAttribute('disabled'));
    const first = list[0];
    const last = list[list.length - 1];
    if (ev.shiftKey && document.activeElement === first) {
      last.focus(); ev.preventDefault();
    } else if (!ev.shiftKey && document.activeElement === last) {
      first.focus(); ev.preventDefault();
    }
  }

  ngOnDestroy() { this.restoreFocus(); }
}
