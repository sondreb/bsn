import { Injectable } from '@angular/core';

export interface BSNData {
  accounts: Record<string, any>;
  knownTokens: string[];
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private cachedData: BSNData | null = null;
  private readonly dataUrl = 'https://bsn.mtla.me/json';

  async getData(): Promise<BSNData | null> {
    if (this.cachedData) {
      return this.cachedData;
    }

    try {
      const response = await fetch(this.dataUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.cachedData = await response.json();
      return this.cachedData;
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  }

  async getUniqueTags(): Promise<string[]> {
    const data = await this.getData();
    if (!data?.accounts) return [];

    const tags = new Set<string>();
    Object.values(data.accounts).forEach(account => {
      if (account.tags) {
        Object.keys(account.tags).forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags);
  }

  async getAccountsByTag(tag: string): Promise<[string, any][]> {
    const data = await this.getData();
    if (!data?.accounts) return [];

    const entries = Object.entries(data.accounts)
      .filter(([_, account]) => account.tags && tag in account.tags);

    return entries;
  }
}
