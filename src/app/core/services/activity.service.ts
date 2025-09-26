import { Injectable } from '@angular/core';

export interface ActivityEntry {
  date: string; // ISO string
  ip: string;
  userAgent: string;
}

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private readonly KEY = 'app_activity_log';

  getEntries(): ActivityEntry[] {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) as ActivityEntry[] : [];
    } catch { return []; }
  }

  add(entry: ActivityEntry) {
    const list = this.getEntries();
    list.unshift(entry);
    try { localStorage.setItem(this.KEY, JSON.stringify(list.slice(0, 50))); } catch {}
  }

  addCurrentSession(ip?: string) {
    this.add({
      date: new Date().toISOString(),
      ip: ip || '127.0.0.1',
      userAgent: navigator.userAgent,
    });
  }

  clear() {
    try { localStorage.removeItem(this.KEY); } catch {}
  }
}
