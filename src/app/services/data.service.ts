import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import localBsnData from './bsn.json';

export interface BSNData {
  accounts: Record<string, any>;
  knownTokens?: string[];
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private readonly API_URL = 'https://bsn.expert/json';
  private readonly STORAGE_KEY = 'bsn_data';
  private readonly _searchQuery = signal('');

  loading$ = new BehaviorSubject<boolean>(false);
  data = signal<BSNData | null>(null);

  async getData(): Promise<BSNData | null> {
    if (this.data()) {
      return this.data();
    }

    try {
      this.loading$.next(true);
      
      // Check localStorage first
      const cachedData = this.loadFromLocalStorage();
      
      if (cachedData) {
        // Use cached data from localStorage
        console.log('Loading BSN data from localStorage...');
        this.data.set(cachedData);
      } else {
        // First time load - use local JSON file
        console.log('First time load - using local BSN data...');
        this.data.set(localBsnData as BSNData);
      }

      // Always fetch from API to get latest updates
      console.log('Fetching latest BSN data from API...');
      const response = await fetch(this.API_URL);
      const apiData = await response.json();
      
      // Update the data
      this.data.set(apiData);
      
      // Save to localStorage for next time
      this.saveToLocalStorage(apiData);
      console.log('BSN data updated from API and saved to localStorage');
      
      return apiData;
    } catch (error) {
      console.error('Error fetching data from API:', error);
      // If API fails, we still have either cached or local data
      if (!this.data()) {
        const cachedData = this.loadFromLocalStorage();
        if (cachedData) {
          this.data.set(cachedData);
        } else {
          this.data.set(localBsnData as BSNData);
        }
      }
      return this.data();
    } finally {
      this.loading$.next(false);
    }
  }

  private loadFromLocalStorage(): BSNData | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    return null;
  }

  private saveToLocalStorage(data: BSNData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  async getUniqueTags(): Promise<string[]> {
    const data = this.data();
    if (!data?.accounts) return [];

    const tags = new Set<string>();
    Object.values(data.accounts).forEach((account) => {
      if (account.tags) {
        Object.keys(account.tags).forEach((tag) => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }

  async getAccountsByTag(tag: string): Promise<[string, any][]> {
    const data = this.data();
    if (!data?.accounts) return [];

    return Object.entries(data.accounts)
      .filter(([_, account]) => account.tags && tag in account.tags)
      .sort((a, b) => a[0].localeCompare(b[0]));
  }

  searchQuery() {
    return this._searchQuery();
  }

  setSearchQuery(query: string) {
    this._searchQuery.set(query);
  }
}
