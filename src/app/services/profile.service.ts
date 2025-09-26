import { Injectable } from '@angular/core';

export interface StudentProfile {
  firstName: string;
  lastName: string;
  institutionalEmail: string;
  username: string;
  avatarUrl?: string;
  timezone?: string;
  displayName?: string;
  bio?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly KEY = 'app_student_profile';
  private readonly PASS_KEY = 'app_student_password';

  getProfile(): StudentProfile {
    const raw = localStorage.getItem(this.KEY);
    if (raw) {
      try { return JSON.parse(raw) as StudentProfile; } catch {}
    }
    // Perfil por defecto (mock)
    return {
      firstName: 'Juan',
      lastName: 'Pérez',
      institutionalEmail: 'juan.perez@inacap.cl',
      username: 'jperez',
      avatarUrl: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=256&h=256&fit=facearea&facepad=2&auto=format',
      timezone: 'America/Los_Angeles',
      displayName: 'JuanPerez',
      bio: ''
    };
  }

  updateProfile(p: StudentProfile) {
    localStorage.setItem(this.KEY, JSON.stringify(p));
  }

  /** Mock de cambio de contraseña. Valida que current no esté vacío y que newPass tenga largo >= 6 */
  async changePassword(current: string, newPass: string): Promise<void> {
    await new Promise(r => setTimeout(r, 400));
    if (!current) throw new Error('La contraseña actual es requerida');
    if (!newPass || newPass.length < 6) throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
    localStorage.setItem(this.PASS_KEY, newPass);
  }

  /** Mock: cerrar otras sesiones (no hace nada real, solo simula latencia) */
  async logoutOtherSessions(_password: string): Promise<void> {
    await new Promise(r => setTimeout(r, 400));
  }

  /** Eliminar cuenta: limpia almacenamiento del perfil y contraseña */
  deleteAccount() {
    try { localStorage.removeItem(this.KEY); } catch {}
    try { localStorage.removeItem(this.PASS_KEY); } catch {}
  }
}
