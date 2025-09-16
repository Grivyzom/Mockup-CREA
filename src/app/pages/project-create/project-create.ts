import { Component, OnDestroy, HostListener } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './project-create.html',
  styleUrl: './project-create.css'
})
export class ProjectCreate implements OnDestroy {
  form: FormGroup;

  carrerasDisponibles = [
    'Informática',
    'Diseño',
    'Agricultura',
    'Mecánica',
    'Electrónica',
    'Salud',
    'Administración',
    'Gastronomía'
  ];

  // Eliminado: duraciones predefinidas. Usaremos fechas de inicio y fin.

  bannerPreview: string | null = null;
  fotosPreview: string[] = [];

  get miembros(): FormArray { return this.form.get('miembros') as FormArray; }
  get carreras(): FormControl { return this.form.get('carreras') as FormControl; }

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
      numeroEstudiantes: [1, [Validators.required, Validators.min(1), Validators.max(50)]],
      carreras: [[], [Validators.required]],
      fechaInicio: ['', [Validators.required]],
      fechaFin: ['', [Validators.required]],
      profesorMonitor: ['', [Validators.required, Validators.minLength(3)]],
      permitirExAlumnos: [false],
      banner: [null],
      fotos: [[]],
      miembros: this.fb.array<FormGroup>([]),
      lider: this.fb.group({
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        country: ['Chile', [Validators.required]],
        street: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
      })
    });

    // Validación de rango: fechaFin >= fechaInicio
    this.form.get('fechaFin')?.valueChanges.subscribe(() => this.validateDateRange());
    this.form.get('fechaInicio')?.valueChanges.subscribe((val) => {
      // Autocorregir fecha fin si quedó antes del inicio o si está vacía: sugerir +3 meses
      const endCtrl = this.form.get('fechaFin');
      if (val) {
        const startISO = val as string;
        const suggested = this.addMonthsISO(startISO, 3);
        if (endCtrl) {
          const endVal = endCtrl.value as string | null;
          if (!endVal) {
            endCtrl.setValue(suggested, { emitEvent: false });
            endCtrl.markAsDirty();
          } else {
            const s = new Date(startISO);
            const e = new Date(endVal);
            if (e < s) {
              endCtrl.setValue(startISO, { emitEvent: false });
              endCtrl.markAsDirty();
            }
          }
        }
      }
      this.validateDateRange();
    });

    // Restaurar borrador si existe
    this.restoreDraft();
  }

  addMiembro(email = '') {
    const group = this.fb.group({ email: [email, [Validators.required, Validators.email]] });
    this.miembros.push(group);
  }

  removeMiembro(index: number) {
    this.miembros.removeAt(index);
  }

  onBannerSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.form.patchValue({ banner: file || null });
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.bannerPreview = reader.result as string;
      reader.readAsDataURL(file);
    } else {
      this.bannerPreview = null;
    }
  }

  onFotosSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    this.form.patchValue({ fotos: files });
    this.fotosPreview = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => this.fotosPreview.push(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  removeFoto(idx: number) {
    const files: File[] = [...(this.form.value.fotos || [])];
    files.splice(idx, 1);
    this.form.patchValue({ fotos: files });
    this.fotosPreview.splice(idx, 1);
  }

  toggleCarrera(carrera: string) {
    const current: string[] = this.carreras.value || [];
    const exists = current.includes(carrera);
    const next = exists ? current.filter(c => c !== carrera) : [...current, carrera];
    this.carreras.setValue(next);
    this.carreras.markAsDirty();
    this.carreras.markAsTouched();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.scrollToFirstInvalid();
      return;
    }
    const value = this.form.value;
    // Simulación de envío; en real, construir FormData si hay archivos
    console.log('Proyecto creado', value);
    alert('Proyecto enviado. ¡Gracias!');
    this.form.reset({ numeroEstudiantes: 1, permitirExAlumnos: false, carreras: [] });
    this.miembros.clear();
    this.bannerPreview = null;
    this.fotosPreview = [];
    localStorage.removeItem('project-create-draft');
  }

  ngOnDestroy(): void {
    // Limpieza si fuese necesaria
  }

  private validateDateRange() {
    const start = this.form.get('fechaInicio')?.value as string;
    const end = this.form.get('fechaFin')?.value as string;
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (endDate < startDate) {
        this.form.get('fechaFin')?.setErrors({ rangoInvalido: true });
      } else {
        const errors = this.form.get('fechaFin')?.errors || {};
        delete errors['rangoInvalido'];
        if (Object.keys(errors).length === 0) {
          this.form.get('fechaFin')?.setErrors(null);
        } else {
          this.form.get('fechaFin')?.setErrors(errors);
        }
      }
    }
  }

  // Fechas en formato ISO (yyyy-MM-dd) para min en los inputs date
  get todayISO(): string {
    const d = new Date();
    const iso = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
      .toISOString().split('T')[0];
    return iso;
  }

  get fechaInicioISO(): string | null {
    const v = this.form.get('fechaInicio')?.value as string | null;
    return v || null;
  }

  // === Getters de estado para revelar secciones ===
  get basicComplete(): boolean {
    const titulo = this.form.get('titulo')?.valid;
    const descripcion = this.form.get('descripcion')?.valid;
    const numEst = this.form.get('numeroEstudiantes')?.valid;
    const carreras = (this.form.get('carreras')?.value || []) as string[];
    const carrerasOk = Array.isArray(carreras) && carreras.length > 0;
    const fiCtrl = this.form.get('fechaInicio');
    const ffCtrl = this.form.get('fechaFin');
    const fechasOk = !!fiCtrl && !!ffCtrl && fiCtrl.valid && ffCtrl.valid && !ffCtrl.hasError('rangoInvalido');
    return !!(titulo && descripcion && numEst && carrerasOk && fechasOk);
  }

  get participacionComplete(): boolean {
    const prof = this.form.get('profesorMonitor');
    return !!prof && prof.valid;
  }

  get leaderComplete(): boolean {
    const lider = this.form.get('lider');
    return !!lider && lider.valid;
  }

  // Progreso general del formulario (0-100)
  get progressPercent(): number {
    const stepsTotal = 3;
    let done = 0;
    if (this.basicComplete) done++;
    if (this.participacionComplete) done++;
    if (this.leaderComplete) done++;
    return Math.round((done / stepsTotal) * 100);
  }

  // Contadores de caracteres y avisos
  get tituloLen(): number { return (this.form.get('titulo')?.value || '').length; }
  get descripcionLen(): number { return (this.form.get('descripcion')?.value || '').length; }
  get tituloMax(): number { return 100; }
  get descripcionMax(): number { return 1000; }
  get tituloWarn(): boolean { return this.tituloLen >= this.tituloMax * 0.9; }
  get descripcionWarn(): boolean { return this.descripcionLen >= this.descripcionMax * 0.9; }

  // Utilidades de fecha
  private addMonthsISO(dateISO: string, months: number): string {
    const d = new Date(dateISO);
    const originalDay = d.getDate();
    d.setMonth(d.getMonth() + months);
    if (d.getDate() < originalDay) {
      d.setDate(0); // último día del mes anterior
    }
    return d.toISOString().slice(0, 10);
  }

  // Confirmar salida si hay cambios sin guardar
  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: BeforeUnloadEvent) {
    if (this.form?.dirty) {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  // Guardar/Restaurar borrador local
  saveDraft() {
    const val = this.form.getRawValue();
    try {
      localStorage.setItem('project-create-draft', JSON.stringify(val));
      alert('Borrador guardado en este dispositivo.');
    } catch {}
  }

  restoreDraft() {
    try {
      const raw = localStorage.getItem('project-create-draft');
      if (!raw) return;
      const data = JSON.parse(raw);
      // Evitar sobreescribir arrays de miembros sin control
      if (Array.isArray(data.miembros)) {
        this.miembros.clear();
        data.miembros.forEach((m: any) => this.addMiembro(m?.email || ''));
      }
      this.form.patchValue({ ...data, miembros: undefined });
      // Restaurar previews no es trivial; se omite por seguridad
    } catch {}
  }

  // UX: llevar foco y scroll al primer campo inválido
  private scrollToFirstInvalid() {
    setTimeout(() => {
      const el = document.querySelector('input.ng-invalid, textarea.ng-invalid, select.ng-invalid') as HTMLElement | null;
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Intentar enfocar
        (el as HTMLInputElement).focus?.();
      }
    });
  }
}
