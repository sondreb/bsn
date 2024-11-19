import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NicknameService {
  private readonly STORAGE_KEY = 'bsn-nicknames';
  private nicknames = signal<Record<string, string>>({});

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.nicknames.set(JSON.parse(stored));
    }
  }

  private saveToStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.nicknames()));
  }

  setNickname(address: string, nickname: string) {
    const current = this.nicknames();
    this.nicknames.set({ ...current, [address]: nickname });
    this.saveToStorage();
  }

  getNickname(address: string): string | null {
    return this.nicknames()[address] || null;
  }

  removeNickname(address: string) {
    const current = { ...this.nicknames() };
    delete current[address];
    this.nicknames.set(current);
    this.saveToStorage();
  }
}
