import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private loading = new BehaviorSubject<boolean>(false);
  loading$ = this.loading.asObservable();
  private cachedData: any = null;
  private readonly CACHE_KEY = 'bsn-data-cache';

  constructor() {
    // Load cached data on service initialization
    this.loadFromCache();
  }

  private loadFromCache() {
    const cached = localStorage.getItem(this.CACHE_KEY);
    if (cached) {
      try {
        this.cachedData = JSON.parse(cached);
      } catch (e) {
        console.error('Error parsing cache:', e);
        localStorage.removeItem(this.CACHE_KEY);
      }
    }
  }

  private saveToCache(data: any) {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to cache:', e);
    }
  }

  async getData() {
    // First, try to return cached data if available
    if (this.cachedData) {
      // Trigger background refresh
      this.refreshDataInBackground();
      return this.cachedData;
    }

    // If no cache, load from network
    return this.fetchAndCacheData();
  }

  private async fetchAndCacheData() {
    this.loading.next(true);
    try {
      const response = await fetch('/assets/data.json');
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      this.cachedData = data;
      this.saveToCache(data);
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      // If we have cached data, return it as fallback
      if (this.cachedData) {
        return this.cachedData;
      }
      throw error;
    } finally {
      this.loading.next(false);
    }
  }

  private async refreshDataInBackground() {
    try {
      const response = await fetch('/assets/data.json');
      if (!response.ok) return;

      const data = await response.json();
      // Only update if data has changed
      if (JSON.stringify(data) !== JSON.stringify(this.cachedData)) {
        this.cachedData = data;
        this.saveToCache(data);
      }
    } catch (e) {
      console.error('Background refresh failed:', e);
    }
  }

  async getUniqueTags(): Promise<string[]> {
    const data = await this.getData();
    if (!data?.accounts) return [];

    const tags = new Set<string>();
    Object.values(data.accounts).forEach((account) => {
      if (account.tags) {
        Object.keys(account.tags).forEach((tag) => tags.add(tag));
      }
    });
    return Array.from(tags);
  }

  async getAccountsByTag(tag: string): Promise<[string, any][]> {
    const data = await this.getData();
    if (!data?.accounts) return [];

    const entries = Object.entries(data.accounts).filter(
      ([_, account]) => account.tags && tag in account.tags
    );

    return entries;
  }
}
