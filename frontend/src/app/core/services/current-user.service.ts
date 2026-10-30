import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private readonly storageKey = 'mm-current-user-id';
  readonly selectedUserId = signal<string | null>(this.readStoredUserId());

  setSelectedUserId(id: string | null): void {
    this.selectedUserId.set(id);
    if (id) {
      localStorage.setItem(this.storageKey, id);
      return;
    }
    localStorage.removeItem(this.storageKey);
  }

  private readStoredUserId(): string | null {
    const value = localStorage.getItem(this.storageKey);
    return value && value.trim() ? value : null;
  }
}
