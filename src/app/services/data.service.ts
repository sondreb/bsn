import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface BSNData {
  accounts: Record<string, any>;
  knownTokens?: string[];
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private readonly API_URL = 'https://bsn.mtla.me/json';

  loading$ = new BehaviorSubject<boolean>(false);
  data = signal<BSNData | null>(null);

  async getData(): Promise<BSNData | null> {
    if (this.data()) {
      return this.data();
    }

    try {
      this.loading$.next(true);
      const response = await fetch(this.API_URL);
      const data = await response.json();
      this.data.set(data);
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    } finally {
      this.loading$.next(false);
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
}
