import { Component, OnInit, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { ToastService } from '../../components/ui/toast/toast.service';
import { FALLBACK_TIMEZONES, buildTimezoneGroups } from '../../shared/timezones';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  // Para tooltips de info (popover de nombre de usuario y nombre público)
  showUserInfo = false;
  showPublicInfo = false;
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private toast = inject(ToastService);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  // Perfil
  profile = this.profileService.getProfile();
  form = this.fb.group({
    firstName: [this.profile.firstName, [Validators.required]],
    lastName: [this.profile.lastName, [Validators.required]],
    institutionalEmail: [this.profile.institutionalEmail, [Validators.required, Validators.email]],
    username: [this.profile.username, [Validators.required, Validators.minLength(3)]],
    timezone: [this.profile.timezone ?? 'America/Los_Angeles'],
    // Campos movidos desde Configuración → Apariencia
    displayName: [this.profile.displayName ?? (this.profile.username || ''), [Validators.required, Validators.minLength(4), Validators.maxLength(12), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/)]],
    bio: [this.profile.bio ?? '', [Validators.maxLength(200)]]
  });
  // Timezones
  allTimezones: string[] = [];
  timezoneGroups: Array<{region: string; zones: string[]}> = [];
  // Edición del perfil
  isEditingProfile = false;
  private originalProfileValue: any;
  // Preferencia de tono de piel
  skinTone: string = 'default';
  skinTones = [
    { value: 'default', emoji: '👋', label: 'Predeterminado' },
    { value: 'light', emoji: '👋🏻', label: 'Claro' },
    { value: 'medium-light', emoji: '👋🏼', label: 'Claro medio' },
    { value: 'medium', emoji: '👋🏽', label: 'Medio' },
    { value: 'medium-dark', emoji: '👋🏾', label: 'Oscuro medio' },
    { value: 'dark', emoji: '👋🏿', label: 'Oscuro' },
  ];

  // Género
  gender: string = 'prefer-not';
  genders = [
    { value: 'prefer-not', label: 'Prefiero no decir', icon: 'M5 5l14 14M19 5L5 19' },
    { value: 'woman', label: 'Mujer', icon: 'M11 5h2v2h-2zM12 7v10M9 12h6M10 17h4' },
    { value: 'man', label: 'Hombre', icon: 'M12 5h2v3h3v2h-3v7h-2v-7H9V8h3V5z' },
    { value: 'nonbinary', label: 'No binario', icon: 'M12 4l4 4-4 4-4-4 4-4M8 16h8' },
    { value: 'trans', label: 'Trans', icon: 'M11 2h2v3h3v2h-3v3h-2v-3H8V5h3V2z' },
    { value: 'agender', label: 'Agénero', icon: 'M12 2v20M2 12h20' },
    { value: 'other', label: 'Otro', icon: 'M12 4l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z' },
  ];

  // Cambio de contraseña
  passwordForm = this.fb.group({
    current: ['', Validators.required],
    newPass: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', Validators.required],
  });

  // Autenticación de dos factores (2FA)
  twoFactorEnabled = false;
  twoFactorLoading = false;
  twoFactorSuccess = '';
  twoFactorError = '';
  showSetup = false;
  setupStep = 1;
  qrCodeDataUrl = '';
  twoFactorSecret = '';
  showBackupCodes = false;
  backupCodesCount = 10;
  backupCodes: Array<{id: string, code: string, used: boolean}> = [];
  submittedTwoFactor = false;

  twoFactorForm = this.fb.group({
    verificationCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });
  passLoading = false;
  passError: string | null = null;
  passSuccess = false;
  submittedPass = false;
  // Mostrar/ocultar contraseñas
  showCurrent = false;
  showNew = false;
  showConfirm = false;
  // Fuerza de contraseña (0-4)
  passwordStrength = 0;

  // Cerrar otras sesiones
  sessionsForm = this.fb.group({ password: ['', Validators.required] });
  sessionsLoading = false;
  sessionsSuccess = false;

  // Acciones
  saving = false;
  saveSuccess = false;
  submittedProfile = false;

  // Eliminar cuenta (confirmación segura)
  deleteForm = this.fb.group({ confirm: ['', Validators.required] });
  deleteError: string | null = null;
  deleteLoading = false;

  // Avatar
  avatarLoading = false;
  avatarError: string | null = null;
  avatarSuccess = false;

  ngOnInit(): void {
    // Suscribirse a cambios para calcular fuerza de contraseña
    this.passwordForm.get('newPass')?.valueChanges.subscribe((val) => {
      this.passwordStrength = this.calcStrength(val ?? '');
    });

    // Cargar zonas horarias (feature detection)
    try {
      // @ts-ignore - propuesta Intl.supportedValuesOf
      if (typeof Intl.supportedValuesOf === 'function') {
        // @ts-ignore
        this.allTimezones = Intl.supportedValuesOf('timeZone');
      } else {
        this.allTimezones = FALLBACK_TIMEZONES;
      }
    } catch {
      this.allTimezones = FALLBACK_TIMEZONES;
    }
    this.timezoneGroups = buildTimezoneGroups(this.allTimezones);

    // Deshabilitar formulario de perfil por defecto y guardar snapshot inicial
    this.form.disable({ emitEvent: false });
    this.originalProfileValue = this.form.getRawValue();

    // Cargar preferencia de tono de piel y género
    try {
      const raw = localStorage.getItem('appearance_prefs');
      if (raw) {
        const prefs = JSON.parse(raw) as { skinTone?: string, gender?: string };
        if (prefs.skinTone) this.skinTone = prefs.skinTone;
        if (prefs.gender) this.gender = prefs.gender;
      }
    } catch {}
  }

  startEditProfile() {
    this.isEditingProfile = true;
    this.form.enable({ emitEvent: false });
  }

  cancelEditProfile() {
    this.isEditingProfile = false;
    // Restaurar valores originales y deshabilitar nuevamente
    this.form.reset(this.originalProfileValue);
    this.form.markAsPristine();
    this.form.disable({ emitEvent: false });
    this.submittedProfile = false;
    this.saving = false;
    this.saveSuccess = false;
    this.toast.show({ message: 'Cambios descartados', type: 'info', duration: 3000 });
  }

  async saveProfile() {
    this.submittedProfile = true;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true; this.saveSuccess = false;
    const merged = { ...this.profile, ...(this.form.value as any), gender: this.gender } as any;
    this.profileService.updateProfile(merged);
    this.profile = merged;
    await new Promise(r => setTimeout(r, 300));
    this.saving = false; this.saveSuccess = true;
    this.toast.show({ message: 'Perfil actualizado correctamente', type: 'success', duration: 4000 });
    this.form.markAsPristine();
    // Actualizar snapshot, salir del modo edición y deshabilitar
    this.originalProfileValue = this.form.getRawValue();
    this.isEditingProfile = false;
    this.form.disable({ emitEvent: false });
    setTimeout(() => this.saveSuccess = false, 2000);

    // Persistir tono de piel y género
    try {
      const raw = localStorage.getItem('appearance_prefs');
      const prefs = raw ? JSON.parse(raw) : {};
      prefs.skinTone = this.skinTone;
      prefs.gender = this.gender;
      localStorage.setItem('appearance_prefs', JSON.stringify(prefs));
    } catch {}
  }

  async changePassword() {
    this.submittedPass = true;
    this.passError = null; this.passSuccess = false;
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    const { current, newPass, confirm } = this.passwordForm.value as { current: string; newPass: string; confirm: string };
    if (newPass !== confirm) { this.passError = 'Las contraseñas no coinciden'; return; }
    this.passLoading = true;
    try { await this.profileService.changePassword(current, newPass); this.passSuccess = true; this.passwordForm.reset(); }
    catch (e: any) { this.passError = e?.message ?? 'No se pudo actualizar la contraseña'; }
    finally { this.passLoading = false; setTimeout(() => this.passSuccess = false, 2500); }
  }

  async closeOtherSessions() {
    if (this.sessionsForm.invalid) { this.sessionsForm.markAllAsTouched(); return; }
    this.sessionsLoading = true; this.sessionsSuccess = false;
    await this.profileService.logoutOtherSessions(this.sessionsForm.value.password!);
    this.sessionsLoading = false; this.sessionsSuccess = true; setTimeout(() => this.sessionsSuccess = false, 2500);
    this.sessionsForm.reset();
  }

  deleteAccount() {
    this.deleteError = null;
    const confirmVal = (this.deleteForm.value.confirm ?? '').toString().trim().toUpperCase();
    if (confirmVal !== 'ELIMINAR') {
      this.deleteError = 'Escribe ELIMINAR para confirmar.';
      this.deleteForm.markAllAsTouched();
      return;
    }
    if (!window.confirm('Esta acción es irreversible. ¿Deseas eliminar tu cuenta?')) return;
    this.deleteLoading = true;
    try {
      this.profileService.deleteAccount();
      alert('Cuenta eliminada. Se cerrará la sesión.');
      // En un flujo real, aquí rediriges /logout o /login
    } finally {
      this.deleteLoading = false;
    }
  }

  // Utilidades
  get canSaveProfile(): boolean { return this.isEditingProfile && this.form.valid && this.form.dirty && !this.saving; }
  get passMismatch(): boolean {
    const { newPass, confirm } = this.passwordForm.value as any;
    return !!newPass && !!confirm && newPass !== confirm;
  }
  get confirmText(): string { return (this.deleteForm.value.confirm ?? '').toString(); }

  private calcStrength(pw: string): number {
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4);
  }

  get strengthLabel(): string {
    switch (this.passwordStrength) {
      case 0: return 'Muy débil';
      case 1: return 'Débil';
      case 2: return 'Media';
      case 3: return 'Fuerte';
      case 4: return 'Muy fuerte';
      default: return '';
    }
  }

  // Avatar handlers
  onAvatarSelected(ev: Event) {
    this.avatarError = null; this.avatarSuccess = false;
    const input = ev.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/gif'];
    if (!allowed.includes(file.type)) { this.avatarError = 'Formato no permitido. Usa JPG, PNG o GIF.'; input.value = ''; return; }
    const max = 1024 * 1024; // 1 MB
    if (file.size > max) { this.avatarError = 'El archivo supera 1 MB.'; input.value = ''; return; }
    const reader = new FileReader();
    this.avatarLoading = true;
    reader.onload = () => {
      this.zone.run(() => {
        const url = reader.result as string;
        const updated = { ...this.profile, avatarUrl: url };
        this.profileService.updateProfile(updated as any);
        this.profile = updated as any;
        this.avatarLoading = false;
        this.avatarSuccess = true;
        this.cdr.markForCheck();
        setTimeout(() => { this.avatarSuccess = false; this.cdr.markForCheck(); }, 2000);
        this.toast.show({ message: 'Avatar actualizado', type: 'success', duration: 3000 });
      });
    };
    reader.onerror = () => { this.zone.run(() => { this.avatarLoading = false; this.avatarError = 'No se pudo leer la imagen.'; this.cdr.markForCheck(); }); };
    reader.readAsDataURL(file);
  }

  // Métodos de autenticación de dos factores (2FA)
  startTwoFactorSetup() {
    this.showSetup = true;
    this.setupStep = 1;
    this.twoFactorError = '';
    this.generateTwoFactorSecret();
    this.toast.show({ message: 'Configuración 2FA iniciada', type: 'info', duration: 3500 });
  }

  cancelTwoFactorSetup() {
    this.showSetup = false;
    this.setupStep = 1;
    this.qrCodeDataUrl = '';
    this.twoFactorSecret = '';
    this.twoFactorForm.reset();
    this.submittedTwoFactor = false;
    this.toast.show({ message: 'Configuración 2FA cancelada', type: 'info', duration: 3000 });
  }

  generateTwoFactorSecret() {
    // Simular generación de secreto para 2FA
    this.twoFactorSecret = this.generateRandomBase32(32);
    this.generateQRCode();
  }

  generateQRCode() {
    // Simulación de generación de código QR
    // En producción, usarías una librería como qrcode
    const issuer = 'INACAP';
    const accountName = this.profile.institutionalEmail;
    const otpauth = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${this.twoFactorSecret}&issuer=${encodeURIComponent(issuer)}`;
    
    // Simulando URL del QR (en producción sería una imagen real)
    this.qrCodeDataUrl = `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12" fill="black">
          Código QR
        </text>
        <text x="100" y="120" text-anchor="middle" font-family="Arial" font-size="8" fill="gray">
          ${this.twoFactorSecret}
        </text>
      </svg>
    `)}`;
  }

  completeTwoFactorSetup() {
    this.submittedTwoFactor = true;
    if (this.twoFactorForm.invalid) return;

    this.twoFactorLoading = true;
    this.twoFactorError = '';

    // Simulación de verificación del código 2FA
    setTimeout(() => {
      const code = this.twoFactorForm.get('verificationCode')?.value;
      
      // Simulación: acepta códigos que terminen en números pares
      if (code && parseInt(code.slice(-1)) % 2 === 0) {
        this.twoFactorEnabled = true;
        this.showSetup = false;
        this.generateBackupCodes();
        this.twoFactorSuccess = 'Autenticación de dos factores activada correctamente';
        this.twoFactorForm.reset();
        this.submittedTwoFactor = false;
        setTimeout(() => this.twoFactorSuccess = '', 3000);
        this.toast.show({ message: '2FA activada correctamente', type: 'success', duration: 5000 });
      } else {
        this.twoFactorError = 'Código de verificación incorrecto. Inténtalo de nuevo.';
        this.toast.show({ message: 'Código 2FA incorrecto', type: 'error', duration: 4500 });
      }
      
      this.twoFactorLoading = false;
    }, 2000);
  }

  disableTwoFactor() {
    if (confirm('¿Estás seguro de que quieres desactivar la autenticación de dos factores? Esto reducirá la seguridad de tu cuenta.')) {
      this.twoFactorLoading = true;
      
      setTimeout(() => {
        this.twoFactorEnabled = false;
        this.backupCodes = [];
        this.showBackupCodes = false;
        this.twoFactorSuccess = 'Autenticación de dos factores desactivada';
        this.twoFactorLoading = false;
        setTimeout(() => this.twoFactorSuccess = '', 3000);
        this.toast.show({ message: '2FA desactivada', type: 'warning', duration: 4500 });
      }, 1500);
    }
  }

  generateBackupCodes() {
    this.backupCodes = Array.from({ length: 10 }, (_, i) => ({
      id: `backup-${Date.now()}-${i}`,
      code: this.generateBackupCode(),
      used: false
    }));
    this.backupCodesCount = this.backupCodes.filter(code => !code.used).length;
  }

  regenerateBackupCodes() {
    if (confirm('¿Generar nuevos códigos de respaldo? Los códigos actuales dejarán de funcionar.')) {
      this.generateBackupCodes();
      this.twoFactorSuccess = 'Códigos de respaldo regenerados';
      setTimeout(() => this.twoFactorSuccess = '', 3000);
      this.toast.show({ message: 'Códigos de respaldo regenerados', type: 'success', duration: 4500 });
    }
  }

  downloadBackupCodes() {
    const codesText = this.backupCodes
      .map(code => `${code.code} ${code.used ? '(usado)' : ''}`)
      .join('\n');
    
    const content = `Códigos de respaldo de INACAP\nGenerados: ${new Date().toLocaleString()}\n\n${codesText}\n\nGuarda estos códigos en un lugar seguro.`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inacap-backup-codes-${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    this.toast.show({ message: 'Códigos de respaldo descargados', type: 'info', duration: 4000 });
  }

  copySecret() {
    navigator.clipboard.writeText(this.twoFactorSecret).then(() => {
      this.twoFactorSuccess = 'Clave copiada al portapapeles';
      setTimeout(() => this.twoFactorSuccess = '', 2000);
      this.toast.show({ message: 'Clave 2FA copiada', type: 'success', duration: 3000 });
    }).catch(() => {
      this.twoFactorError = 'No se pudo copiar la clave';
      setTimeout(() => this.twoFactorError = '', 2000);
      this.toast.show({ message: 'No se pudo copiar la clave', type: 'error', duration: 4000 });
    });
  }

  private generateRandomBase32(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateBackupCode(): string {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  onAvatarRemove() {
    const updated = { ...this.profile } as any;
    delete updated.avatarUrl;
    this.profileService.updateProfile(updated);
    this.profile = updated;
  }
}
