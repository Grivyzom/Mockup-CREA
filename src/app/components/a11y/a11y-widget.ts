import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessibilityService } from '../../core/services/accessibility.service';

@Component({
  selector: 'app-a11y-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './a11y-widget.html',
  styleUrls: ['./a11y-widget.css']
})
export class A11yWidget {
  open = signal(false);
  constructor(public a11y: AccessibilityService) {}
  toggle(){ this.open.update(v => !v); }
}
