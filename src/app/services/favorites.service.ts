import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly STORAGE_KEY = 'bsn-favorites';
  private favorites = signal<Set<string>>(new Set());

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.favorites.set(new Set(JSON.parse(stored)));
    }
  }

  private saveToStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...this.favorites()]));
  }

  toggleFavorite(address: string) {
    const current = new Set(this.favorites());
    if (current.has(address)) {
      current.delete(address);
    } else {
      current.add(address);
    }
    this.favorites.set(current);
    this.saveToStorage();
  }

  isFavorite(address: string): boolean {
    return this.favorites().has(address);
  }

  getFavorites(): string[] {
    return [...this.favorites()];
  }
}
