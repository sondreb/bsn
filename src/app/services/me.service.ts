import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MeService {
  private readonly STORAGE_KEY = 'bsn_me_account';
  private _meAccount = signal<string | null>(this.loadFromStorage());

  meAccount() {
    return this._meAccount();
  }

  setMeAccount(address: string) {
    this._meAccount.set(address);
    localStorage.setItem(this.STORAGE_KEY, address);
  }

  clearMeAccount() {
    this._meAccount.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  isMe(address: string): boolean {
    return this._meAccount() === address;
  }

  private loadFromStorage(): string | null {
    try {
      return localStorage.getItem(this.STORAGE_KEY);
    } catch {
      return null;
    }
  }
}
