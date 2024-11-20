import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';
import { RouterLink } from '@angular/router';
import { AddressPipe } from '../pipes/address.pipe';
import { FavoritesService } from '../services/favorites.service';

@Component({
  selector: 'app-balances',
  imports: [CommonModule, FormsModule, RouterLink, AddressPipe],
  template: `
    <div class="balances-container">
      <header>
        <h2>Account Balances</h2>
        <div class="sort-controls">
          <label>Sort by:</label>
          <select [(ngModel)]="selectedToken" (change)="updateSort()">
            @for (token of tokenList; track token) {
            <option [value]="token">{{ token }}</option>
            }
          </select>
          <label class="favorites-filter">
            <input
              type="checkbox"
              [ngModel]="showFavoritesOnly()"
              (ngModelChange)="toggleFavoritesOnly($event)"
            />
            Show Favorites Only
          </label>
        </div>
      </header>

      <div class="accounts-grid">
        @for (account of sortedAccounts(); track account.address) {
        <div class="account-card">
          <div class="account-header">
            <a
              [routerLink]="['/accounts', account.address]"
              class="account-link"
            >
              @if (account.name) {
              <h3>{{ account.name }}</h3>
              }
              <div class="address">{{ account.address | address }}</div>
            </a>
          </div>
          <div class="balances-grid">
            @for (balance of account.balances | keyvalue; track balance.key) {
            <div
              class="balance-item"
              [class.highlighted]="balance.key === selectedToken()"
            >
              <span class="token">{{ balance.key }}</span>
              <span class="amount">
                {{ formatBalance(balance.value) }}
              </span>
            </div>
            }
          </div>
        </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .balances-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }

      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .sort-controls {
        display: flex;
        gap: 10px;
        align-items: center;
      }

      select {
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #ddd;
        font-size: 1rem;
      }

      .accounts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }

      .account-card {
        background: white;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .account-header {
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
      }

      .account-link {
        text-decoration: none;
        color: inherit;
      }

      .account-link h3 {
        margin: 0 0 5px 0;
        color: #764ba2;
      }

      .address {
        font-family: monospace;
        font-size: 0.9em;
        color: #666;
      }

      .balances-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 10px;
      }

      .balance-item {
        background: #f5f5f5;
        padding: 8px;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        transition: all 0.3s ease;
      }

      .balance-item.highlighted {
        background: #764ba222;
        border: 1px solid #764ba244;
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(118, 75, 162, 0.1);
      }

      .balance-item.highlighted .token {
        color: #764ba2;
        font-weight: 600;
      }

      .balance-item.highlighted .amount {
        color: #764ba2;
        font-weight: 600;
      }

      .token {
        font-size: 0.8em;
        color: #666;
      }

      .amount {
        font-weight: 500;
      }

      .amount.highlighted {
        color: #764ba2;
        font-weight: 600;
      }

      .favorites-filter {
        margin-left: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
      }
    `,
  ],
})
export class BalancesComponent {
  private dataService = inject(DataService);
  private favoritesService = inject(FavoritesService);

  tokenList = [
    'EURMTL',
    'MTLAP',
    'MTLRECT',
    'SATSMTL',
    'USDM',
    'XLM',
    'BTCMTL',
    'USDC',
  ];

  selectedToken = signal<string>('EURMTL'); // Changed default value
  showFavoritesOnly = signal<boolean>(
    this.favoritesService.getBalancesFavoritesOnly()
  );

  updateSort() {
    this.selectedToken.set(this.selectedToken());
  }

  sortedAccounts = computed(() => {
    const data = this.dataService.data();
    if (!data?.accounts) return [];

    let accounts = Object.entries(data.accounts)
      .map(([address, account]) => ({
        address,
        name: account.profile?.Name?.[0],
        balances: account.balances || {},
      }))
      .filter((account) => Object.keys(account.balances).length > 0);

    // Filter by favorites if enabled
    if (this.showFavoritesOnly()) {
      accounts = accounts.filter((account) =>
        this.favoritesService.isFavorite(account.address)
      );
    }

    return accounts.sort((a, b) => {
      const balanceA = Number(a.balances[this.selectedToken()] || 0);
      const balanceB = Number(b.balances[this.selectedToken()] || 0);
      return balanceB - balanceA; // Sort in descending order
    });
  });

  toggleFavoritesOnly(value: boolean) {
    this.showFavoritesOnly.set(value);
    this.favoritesService.setBalancesFavoritesOnly(value);
  }

  formatBalance(value: string | number | any): string {
    if (value === undefined) {
      return '0';
    }

    const num = Number(value);
    if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + 'B';
    }
    if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + 'M';
    }
    if (num >= 1e3) {
      return (num / 1e3).toFixed(2) + 'K';
    }
    return num.toFixed(2);
  }
}
