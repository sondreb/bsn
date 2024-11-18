import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface BSNData {
  createDate: string;
  knownTokens: string[];
  usedSources: string[];
  accounts: { [key: string]: Account };
}

export interface Account {
  profile?: {
    Name?: string[];
    About?: string[];
    Website?: string[];
  };
  balances: { [key: string]: string };
  tags?: { [key: string]: string[] };
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private bsnData = new BehaviorSubject<BSNData | null>(null);
  private uniqueTags = new BehaviorSubject<Set<string>>(new Set());

  constructor(private http: HttpClient) {
    this.fetchData();
  }

  private fetchData() {
    this.http.get<BSNData>('https://bsn.mtla.me/json').subscribe(data => {
      this.bsnData.next(data);
      this.updateUniqueTags(data);
    });
  }

  private updateUniqueTags(data: BSNData) {
    const tags = new Set<string>();
    Object.values(data.accounts).forEach(account => {
      if (account.tags) {
        Object.keys(account.tags).forEach(tag => tags.add(tag));
      }
    });
    this.uniqueTags.next(tags);
  }

  getData(): Observable<BSNData | null> {
    return this.bsnData.asObservable();
  }

  getUniqueTags(): Observable<Set<string>> {
    return this.uniqueTags.asObservable();
  }

  getAccountsByTag(tag: string): Observable<[string, Account][]> {
    return this.bsnData.pipe(
      map(data => {
        if (!data) return [];
        return Object.entries(data.accounts)
          .filter(([_, account]) => account.tags && account.tags[tag]);
      })
    );
  }
}
