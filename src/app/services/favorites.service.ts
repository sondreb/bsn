import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly FAVORITES_KEY = 'bsn-favorites';
  private readonly FILTER_KEY = 'bsn-favorites-filter';
  private readonly BALANCES_FAVORITES_FILTER_KEY = 'bsn-balances-favorites-filter';
  private favorites = signal<Set<string>>(new Set());
  private showFavoritesOnly = signal<boolean>(false);

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.FAVORITES_KEY);
      if (stored) {
        const favorites = JSON.parse(stored);
        if (Array.isArray(favorites)) {
          this.favorites.set(new Set(favorites));
        }
      }

      const filterState = localStorage.getItem(this.FILTER_KEY);
      if (filterState) {
        this.showFavoritesOnly.set(JSON.parse(filterState) === true);
      }
    } catch (error) {
      console.error('Error loading favorites from storage:', error);
      // Reset to defaults if there's an error
      this.favorites.set(new Set());
      this.showFavoritesOnly.set(false);
    }
  }

  private saveFavoritesToStorage() {
    try {
      const favoritesArray = Array.from(this.favorites());
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favoritesArray));
    } catch (error) {
      console.error('Error saving favorites to storage:', error);
    }
  }

  private saveFilterToStorage() {
    try {
      localStorage.setItem(this.FILTER_KEY, JSON.stringify(this.showFavoritesOnly()));
    } catch (error) {
      console.error('Error saving filter state to storage:', error);
    }
  }

  toggleFavorite(address: string) {
    if (!address) return;

    const currentFavorites = new Set(this.favorites());
    if (currentFavorites.has(address)) {
      currentFavorites.delete(address);
    } else {
      currentFavorites.add(address);
    }
    this.favorites.set(currentFavorites);
    this.saveFavoritesToStorage();
  }

  isFavorite(address: string): boolean {
    return !!address && this.favorites().has(address);
  }

  setShowFavoritesOnly(value: boolean) {
    this.showFavoritesOnly.set(value);
    this.saveFilterToStorage();
  }

  getShowFavoritesOnly(): boolean {
    return this.showFavoritesOnly();
  }

  getBalancesFavoritesOnly(): boolean {
    return localStorage.getItem(this.BALANCES_FAVORITES_FILTER_KEY) === 'true';
  }

  setBalancesFavoritesOnly(value: boolean): void {
    localStorage.setItem(this.BALANCES_FAVORITES_FILTER_KEY, value.toString());
  }
}
