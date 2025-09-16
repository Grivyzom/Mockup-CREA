import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);

  // Perfil
  profile = this.profileService.getProfile();
  form = this.fb.group({
    firstName: [this.profile.firstName, [Validators.required]],
    lastName: [this.profile.lastName, [Validators.required]],
    institutionalEmail: [this.profile.institutionalEmail, [Validators.required, Validators.email]],
    username: [this.profile.username, [Validators.required, Validators.minLength(3)]],
    timezone: [this.profile.timezone ?? 'America/Los_Angeles']
  });

  // Cambio de contraseña
  passwordForm = this.fb.group({
    current: ['', Validators.required],
    newPass: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', Validators.required],
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
  }

  async saveProfile() {
    this.submittedProfile = true;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true; this.saveSuccess = false;
    const merged = { ...this.profile, ...(this.form.value as any) } as any;
    this.profileService.updateProfile(merged);
    this.profile = merged;
    await new Promise(r => setTimeout(r, 300));
    this.saving = false; this.saveSuccess = true;
    this.form.markAsPristine();
    setTimeout(() => this.saveSuccess = false, 2000);
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
  get canSaveProfile(): boolean { return this.form.valid && this.form.dirty && !this.saving; }
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
      const url = reader.result as string;
      const updated = { ...this.profile, avatarUrl: url };
      this.profileService.updateProfile(updated as any);
      this.profile = updated as any;
      this.avatarLoading = false;
      this.avatarSuccess = true;
      setTimeout(() => this.avatarSuccess = false, 2000);
    };
    reader.onerror = () => { this.avatarLoading = false; this.avatarError = 'No se pudo leer la imagen.'; };
    reader.readAsDataURL(file);
  }

  onAvatarRemove() {
    const updated = { ...this.profile } as any;
    delete updated.avatarUrl;
    this.profileService.updateProfile(updated);
    this.profile = updated;
  }
}
