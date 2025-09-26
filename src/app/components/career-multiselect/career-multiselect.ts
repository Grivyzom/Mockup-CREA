import { Component, forwardRef, Input, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from '@angular/forms';
import { CAREERS, CareerOption, groupCareers } from './career-data';

@Component({
  selector: 'app-career-multiselect',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule],
  templateUrl: './career-multiselect.html',
  styleUrls: ['./career-multiselect.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CareerMultiselect),
    multi: true
  }]
})
export class CareerMultiselect implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() placeholder = 'Escribe para filtrar...';
  @Input() maxSelections = 8; // límite actualizado a 8
  // Controla si el resumen (X seleccionadas / filtro) aparece dentro del campo o se externaliza
  @Input() showInlineMeta = true;
  @ViewChild('inputEl') inputEl?: ElementRef<HTMLInputElement>;

  careers: CareerOption[] = CAREERS;
  filtered: CareerOption[] = [...CAREERS];
  grouped: Record<string, CareerOption[]> = groupCareers(this.filtered);
  groupedKeys: string[] = Object.keys(this.grouped);
  selected: CareerOption[] = [];
  query = '';
  panelOpen = false;
  activeOption: CareerOption | null = null;
  activeOptionId: string | null = null;
  panelId = 'career-panel-' + Math.random().toString(36).slice(2);
  dropUp = false; // si no hay espacio abajo
  private resizeHandler = () => { if (this.panelOpen) this.evaluatePlacement(); };
  private onChange: (val: string[]) => void = () => {};
  private onTouched: () => void = () => {};
  private clickListener = (e: MouseEvent) => {
    if (!this.panelOpen) return;
    const target = e.target as HTMLElement;
    const host = this.host.nativeElement as HTMLElement;
    if (!host.contains(target)) {
      this.close();
    }
  };

  constructor(private host: ElementRef<HTMLElement>) {}

  ngOnInit() { 
    document.addEventListener('click', this.clickListener, true);
    window.addEventListener('resize', this.resizeHandler, { passive: true });
    window.addEventListener('orientationchange', this.resizeHandler, { passive: true });
  }
  ngOnDestroy() { 
    document.removeEventListener('click', this.clickListener, true);
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('orientationchange', this.resizeHandler);
  }

  writeValue(ids: string[] | null): void {
    if (!ids) { this.selected = []; return; }
    this.selected = this.careers.filter(c => ids.includes(c.name) || ids.includes(c.id));
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState?(isDisabled: boolean): void {
    // Podrías implementar estado disabled si es necesario
  }

  focusInput() { this.inputEl?.nativeElement.focus(); }
  open() { 
    this.panelOpen = true; 
    this.refreshGrouping(); 
    setTimeout(() => this.evaluatePlacement());
  }
  private evaluatePlacement() {
    try {
      const hostRect = this.host.nativeElement.getBoundingClientRect();
      const viewportH = window.innerHeight;
      // Espacio disponible debajo y arriba
      const spaceBelow = viewportH - hostRect.bottom;
      const estimatedPanelH = Math.min(340, viewportH * 0.6); // límite móvil
      this.dropUp = spaceBelow < estimatedPanelH && hostRect.top > estimatedPanelH * 0.6;
    } catch {}
  }
  close() { this.panelOpen = false; this.activeOption = null; this.activeOptionId = null; }

  onQuery() {
    const q = this.query.trim().toLowerCase();
    this.filtered = !q ? [...this.careers] : this.careers.filter(c => c.name.toLowerCase().includes(q) || c.group.toLowerCase().includes(q));
    this.refreshGrouping();
    this.activeOption = this.filtered[0] || null;
    this.activeOptionId = this.activeOption ? this.optionId(this.activeOption) : null;
  }

  refreshGrouping() {
    this.grouped = groupCareers(this.filtered);
    this.groupedKeys = Object.keys(this.grouped);
  }

  isSelected(opt: CareerOption): boolean { return this.selected.some(s => s.id === opt.id); }

  toggle(opt: CareerOption) {
    if (this.isSelected(opt)) {
      this.selected = this.selected.filter(s => s.id !== opt.id);
    } else {
      if (this.selected.length >= this.maxSelections) return; // límite
      this.selected = [...this.selected, opt];
    }
    this.emit();
  }

  remove(opt: CareerOption) {
    this.selected = this.selected.filter(s => s.id !== opt.id);
    this.emit();
  }

  selectAllVisible() {
    const missing = this.filtered.filter(f => !this.isSelected(f));
    const space = this.maxSelections - this.selected.length;
    if (space <= 0) return;
    this.selected = [...this.selected, ...missing.slice(0, space)];
    this.emit();
  }

  clearAll() { this.selected = []; this.emit(); }

  emit() { this.onChange(this.selected.map(s => s.name)); }

  optionId(opt: CareerOption) { return `${this.panelId}-opt-${opt.id}`; }
  trackOpt = (_: number, o: CareerOption) => o.id;

  onWrapperKeydown(ev: KeyboardEvent) {
    if (!this.panelOpen && (ev.key === 'ArrowDown' || ev.key === 'Enter')) { this.open(); return; }
    if (!this.panelOpen) return;
    const flat = this.filtered;
    const idx = this.activeOption ? flat.indexOf(this.activeOption) : -1;
    if (ev.key === 'ArrowDown') {
      const next = flat[Math.min(flat.length - 1, idx + 1)] || flat[0];
      this.setActive(next); ev.preventDefault();
    } else if (ev.key === 'ArrowUp') {
      const prev = flat[Math.max(0, idx - 1)] || flat[flat.length - 1];
      this.setActive(prev); ev.preventDefault();
    } else if (ev.key === 'Enter') {
      if (this.activeOption) { this.toggle(this.activeOption); ev.preventDefault(); }
    } else if (ev.key === 'Escape') {
      this.close(); ev.stopPropagation();
    } else if (ev.key === 'Tab') {
      this.close();
    } else if (ev.key === 'Backspace' && !this.query && this.selected.length) {
      this.selected = this.selected.slice(0, -1); this.emit();
    }
  }

  onInputKeydown(ev: KeyboardEvent) {
    if (ev.key === 'ArrowDown' && !this.panelOpen) { this.open(); }
  }

  private setActive(opt: CareerOption) { this.activeOption = opt; this.activeOptionId = this.optionId(opt); }
}
