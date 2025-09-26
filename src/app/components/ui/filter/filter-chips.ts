import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  icon?: 'all' | 'proyecto' | 'mensaje' | 'recordatorio' | 'alerta' | 'sistema' | 'unread' | 'read' | 'archived';
}

@Component({
  selector: 'app-filter-chips',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-chips.html',
  styleUrls: ['./filter-chips.css']
})
export class FilterChips {
  @Input() options: FilterOption[] = [];
  @Input() value: string = '';
  @Input() ariaLabel: string = 'Filtros';
  @Output() valueChange = new EventEmitter<string>();

  select(val: string) {
    if (val === this.value) return;
    this.value = val;
    this.valueChange.emit(val);
  }

  trackByValue(_i: number, opt: FilterOption) { return opt.value; }
}
