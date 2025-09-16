import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AuthUser {
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly KEY = 'app_auth_user';
  private userSubject = new BehaviorSubject<AuthUser | null>(this.load());
  user$ = this.userSubject.asObservable();

  get user(): AuthUser | null { return this.userSubject.value; }
  get isLoggedIn(): boolean { return !!this.userSubject.value; }

  async login(email: string, password: string, remember = false): Promise<void> {
    // Mock: aceptar cualquier combinación no vacía, con pequeña latencia
    await new Promise(r => setTimeout(r, 500));
    if (!email || !password) throw new Error('Credenciales inválidas');
    const user: AuthUser = { email };
    this.userSubject.next(user);
    if (remember) this.save(user); else this.clearStorage();
  }

  logout() {
    this.userSubject.next(null);
    this.clearStorage();
  }

  private save(user: AuthUser) {
    try { localStorage.setItem(this.KEY, JSON.stringify(user)); } catch {}
  }
  private load(): AuthUser | null {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) as AuthUser : null;
    } catch { return null; }
  }
  private clearStorage() {
    try { localStorage.removeItem(this.KEY); } catch {}
  }
}
