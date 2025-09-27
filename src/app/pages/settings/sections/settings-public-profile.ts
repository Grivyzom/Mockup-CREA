import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService, type StudentProfile } from '../../../services/profile.service';
import { ModalService } from '../../../components/ui/modal/modal.service';
import { AccessibilityService } from '../../../core/services/accessibility.service';

@Component({
  selector: 'app-settings-public-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <section class="card">
    <header class="card-header">
      <h2>Apariencia</h2>
      <p class="sub">Preferencias de representación e identidad.</p>
    </header>
    <div class="card-body form-cols">
      <!-- Sección: Temática (claro/oscuro/sistema) -->
      <div class="form-field">
        <label>Temática</label>
        <div class="theme-choices" style="display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-start;">
          <div class="theme-card" [class.active]="a11y.theme()==='light'">
            <div class="theme-card__header">Light theme</div>
            <div class="theme-card__preview" aria-hidden="true"> <!-- simple preview box -->
              <div class="preview-light"></div>
            </div>
            <div style="margin-top:.5rem;display:flex;gap:.5rem;align-items:center;justify-content:center;">
              <button class="btn" (click)="a11y.setTheme('light')" [class.active]="a11y.theme()==='light'">Seleccionar</button>
            </div>
          </div>
          <div class="theme-card" [class.active]="a11y.theme()==='dark'">
            <div class="theme-card__header">Dark theme</div>
            <div class="theme-card__preview" aria-hidden="true">
              <div class="preview-dark"></div>
            </div>
            <div style="margin-top:.5rem;display:flex;gap:.5rem;align-items:center;justify-content:center;">
              <button class="btn" (click)="a11y.setTheme('dark')" [class.active]="a11y.theme()==='dark'">Seleccionar</button>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-left:6px;">
            <button class="btn" (click)="a11y.setTheme('system')" [class.active]="a11y.theme()==='system'">Sincronizar con sistema</button>
          </div>
        </div>
      </div>

      <!-- Campos de nombre público, bio y tono de piel se movieron a Perfil -->

      <!-- Género movido a Perfil -->

      <!-- Verificación de carrera -->
      <div class="form-field">
        <label>Verificación de carrera</label>
        <button type="button" class="btn" (click)="openVerificationModal()">Solicitar verificación</button>
        <p class="hint">Sube tu certificado de alumno regular o credencial estudiantil para validar tu carrera.</p>
      </div>
      
    </div>
  </section>
  `,
  styleUrls: ['../settings.css']
})
export class SettingsPublicProfile {
  private profileSrv = inject(ProfileService);
  private modal = inject(ModalService);
  a11y = inject(AccessibilityService);
  profile = signal<StudentProfile>(this.profileSrv.getProfile());
  gender = signal<string>('prefer-not');
  genders = [
    // Iconos sin comandos de arco para evitar errores en SVG
    { value: 'prefer-not', label: 'Prefiero no decir', icon: 'M5 5l14 14M19 5L5 19' },
    { value: 'woman', label: 'Mujer', icon: 'M11 5h2v2h-2zM12 7v10M9 12h6M10 17h4' },
    { value: 'man', label: 'Hombre', icon: 'M12 5h2v3h3v2h-3v7h-2v-7H9V8h3V5z' },
    { value: 'nonbinary', label: 'No binario', icon: 'M12 4l4 4-4 4-4-4 4-4M8 16h8' },
    { value: 'trans', label: 'Trans', icon: 'M11 2h2v3h3v2h-3v3h-2v-3H8V5h3V2z' },
    { value: 'agender', label: 'Agénero', icon: 'M12 2v20M2 12h20' },
    { value: 'other', label: 'Otro', icon: 'M12 4l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z' },
  ];

  constructor(){
    // Cargar preferencias guardadas de género
    try { const raw = localStorage.getItem('appearance_prefs'); if (raw) { const prefs = JSON.parse(raw) as { gender?: string }; if (prefs.gender) this.gender.set(prefs.gender); } } catch {}
  }

  openVerificationModal(){
    // Construir contenido como HTMLElement para evitar sanitización y poder enlazar eventos
    const contentEl = document.createElement('div');
    contentEl.innerHTML = `
      <div class="verify">
        <p class="v-desc">Arrastra y suelta tu <strong>certificado de alumno regular</strong> o <strong>credencial estudiantil</strong>, o selecciónalo desde tu equipo. (PDF o imagen, máx. 5MB)</p>
        <div class="dropzone" id="verify-drop" role="button" tabindex="0" aria-label="Zona para soltar o seleccionar archivo">
          <div class="v-icon" aria-hidden="true">📄</div>
          <div class="v-text">
            <strong>Suelta tu archivo aquí</strong>
            <span>o</span>
            <button type="button" class="v-pick" id="verify-pick">Seleccionar archivo</button>
          </div>
          <div id="verify-preview" class="v-preview" hidden></div>
        </div>
        <div id="verify-msg" class="v-msg" aria-live="polite"></div>
        <input type="file" id="verify-input" accept="image/*,.pdf" style="display:none" />
      </div>
      <style>
        .verify .v-desc{ margin:0 0 .6rem; color: var(--inacap-text-secondary); }
        /* Recuadro con bordes redondeados y línea entrecortada, ancho completo y fondo sutil */
        .verify .dropzone{ 
          display:block;
          width:100%;
          margin-top:.75rem;
          border:2px dashed var(--inacap-border-secondary);
          border-radius:12px;
          padding:1.5rem;
          min-height:140px;
          text-align:center; 
          color:var(--inacap-text-secondary); 
          cursor:pointer; 
          background: var(--inacap-surface-elevated);
          transition: border-color .2s ease, background-color .2s ease, box-shadow .2s ease;
        }
        .verify .dropzone:hover{ border-color: var(--inacap-primary); }
        .verify .dropzone.drag{ background: var(--inacap-red-light); border-color: var(--inacap-primary); }
        .verify .dropzone:focus{ outline: none; }
        .verify .dropzone:focus-visible{ border-color: var(--inacap-primary); box-shadow: 0 0 0 2px var(--inacap-primary); }
        .verify .v-icon{ font-size:2.25rem; margin-bottom:.35rem; }
        .verify .v-text{ display:flex; gap:.35rem; align-items:center; justify-content:center; flex-wrap:wrap; }
        .verify .v-text strong{ color: var(--inacap-text-primary); }
        .verify .v-pick{ background: var(--inacap-primary); border:1px solid var(--inacap-primary); color:#fff; border-radius:.5rem; padding:.4rem .7rem; cursor:pointer; }
        .verify .v-preview{ margin-top:.6rem; }
        .verify .v-img{ margin-top:.35rem; max-height:160px; border-radius:.5rem; border:1px solid var(--inacap-border-secondary); }
        .verify .v-name{ font-weight:600; color: var(--inacap-text-primary); }
        .verify .v-msg{ margin-top:.5rem; font-size:.9rem; }
        .verify .v-msg.ok{ color:#15803d; }
        .verify .v-msg.error{ color:#b91c1c; }
      </style>
    `;

    // Enlaces de comportamiento
    const dz = contentEl.querySelector('#verify-drop') as HTMLElement | null;
    const pick = contentEl.querySelector('#verify-pick') as HTMLButtonElement | null;
    const input = contentEl.querySelector('#verify-input') as HTMLInputElement | null;
    const preview = contentEl.querySelector('#verify-preview') as HTMLElement | null;
    const msg = contentEl.querySelector('#verify-msg') as HTMLElement | null;
    const MAX = 5*1024*1024;
    const setMsg = (text?: string, type?: string) => { if (msg){ msg.textContent = text||''; msg.className = 'v-msg ' + (type||''); } };
    const showPreview = (file: File) => {
      if(!preview) return; preview.innerHTML='';
      const name = document.createElement('div'); name.className='v-name';
      name.textContent = `${file.name} (${Math.round(file.size/1024)} KB)`; preview.appendChild(name);
      if(file.type.startsWith('image/')){ const img = document.createElement('img'); img.className='v-img'; img.alt='Vista previa'; img.src = URL.createObjectURL(file); img.onload = ()=> URL.revokeObjectURL(img.src); preview.appendChild(img); }
      preview.hidden = false;
    };
    const setFile = (f?: File) => {
      if(!f){ setMsg('', ''); return; }
      if(!(f.type.startsWith('image/')||f.type==='application/pdf')){ setMsg('Solo se aceptan imágenes o PDF.','error'); return; }
      if(f.size>MAX){ setMsg('El archivo supera 5MB.','error'); return; }
      showPreview(f); setMsg('Archivo listo para enviar.','ok');
    };
    if(dz && input){
      dz.addEventListener('click', ()=> input.click(), { passive: true });
      if(pick) pick.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); input.click(); });
      dz.addEventListener('keydown', (ev)=>{ if((ev as KeyboardEvent).key==='Enter'||(ev as KeyboardEvent).key===' '){ ev.preventDefault(); input.click(); }});
      ['dragenter','dragover'].forEach(type => dz.addEventListener(type, (ev)=>{ ev.preventDefault(); ev.stopPropagation(); dz.classList.add('drag'); }));
      ['dragleave','drop'].forEach(type => dz.addEventListener(type, (ev)=>{ ev.preventDefault(); ev.stopPropagation(); dz.classList.remove('drag'); }));
      dz.addEventListener('drop', (ev: DragEvent)=>{ const f = ev.dataTransfer?.files?.[0]; if(f){ setFile(f); if(input) input.files = ev.dataTransfer!.files!; }});
      input.addEventListener('change', ()=>{ const f = input.files?.[0]; if(f) setFile(f); });
    }

    this.modal.open({
      title: 'Verificación de carrera',
      content: contentEl,
      width: 'md',
      buttons: [
        { label: 'Cancelar', variant: 'ghost' },
        { label: 'Enviar', variant: 'primary', action: () => {
            const file = input?.files?.[0];
            if(!file){ if(msg) msg.textContent = 'Selecciona o suelta un archivo primero.'; return false; }
            // Aquí podrías subir el archivo; por ahora simulamos éxito
            return true;
          } }
      ],
    });
  }

}
