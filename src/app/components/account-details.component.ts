import { Component, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BSNData, DataService } from '../services/data.service';
import { AddressPipe } from '../pipes/address.pipe';
import { RouterLink } from '@angular/router';
import { RatingService } from '../services/rating.service';
import { FavoritesService } from '../services/favorites.service';
import { FormsModule } from '@angular/forms';
import { NicknameService } from '../services/nickname.service';

@Component({
  selector: 'app-account-details',
  imports: [CommonModule, AddressPipe, RouterLink, FormsModule],
  template: `
    <div class="account-container" *ngIf="account">
      <header class="account-header">
        <div>
          @if (account.profile?.Name) {
          <h2>{{ account.profile.Name[0] }}</h2>
          } @else {
          <div class="nickname-container">
            <input
              type="text"
              [(ngModel)]="nickname"
              (blur)="saveNickname()"
              placeholder="Add a nickname..."
              class="nickname-input"
            />
            @if (nickname) {
            <button class="remove-nickname" (click)="removeNickname()">
              ×
            </button>
            }
          </div>
          }
          <div
            class="address-display"
            [title]="'Click to copy: ' + address"
            (click)="copyToClipboard(address)"
          >
            <span class="address-text">{{ address | address }}</span>
            <span class="copy-icon">📋</span>
            @if (showCopiedMessage) {
            <span class="copied-message">Copied!</span>
            }
            <span
              class="rating"
              [class.high]="getRating() > 70"
              [class.medium]="getRating() > 30 && getRating() <= 70"
              [class.low]="getRating() <= 30"
            >
              {{ getRating() }}
            </span>
            <button
              class="edit-button"
              [routerLink]="['/accounts', address, 'edit']"
            >
              Edit Profile
            </button>
          </div>
        </div>
        <button
          class="favorite-button"
          (click)="toggleFavorite()"
          [class.is-favorite]="isFavorite()"
        >
          {{ isFavorite() ? '★' : '☆' }}
        </button>
      </header>

      @if (account.profile) {
      <section class="profile-section">
        @if (account.profile.About) {
        <p class="about">{{ account.profile.About[0] }}</p>
        } @if (account.profile.Website) {
        <div class="websites">
          <h4>Websites</h4>
          @for (website of account.profile.Website; track website) {
          <a [href]="website" target="_blank" rel="noopener">{{ website }}</a>
          }
        </div>
        }
      </section>
      }

      <div class="external-links">
        <h4>More insight</h4>
        <a
          [href]="'https://stellar.expert/explorer/public/account/' + address"
          target="_blank"
          rel="noopener"
          >Stellar Expert</a
        >
        <a
          [href]="'https://scopuly.com/account/' + address"
          target="_blank"
          rel="noopener"
          >Scopuly</a
        >
      </div>

      @if (account.balances) {
      <section class="balances-section">
        <h3>Account Balances</h3>
        <div class="balances-grid">
          @for (balance of getBalances(); track balance.asset) {
          <div class="balance-item">
            <span class="asset-code">{{ balance.asset }}</span>
            <span class="balance-amount">{{ balance.amount }}</span>
          </div>
          }
        </div>
      </section>
      }

      <div class="tags-container">
        @if (account.tags) {
        <section class="tags-section">
          <h3>Outgoing tags</h3>
          @for (tagGroup of getGivenTagGroups(); track tagGroup.type) {
          <div class="tag-group">
            <h4>
              {{ tagGroup.type }}
              <span class="tag-count">({{ tagGroup.values.length }})</span>
            </h4>
            <div class="tag-values">
              @for (value of tagGroup.values; track value) {
              <a
                class="tag-value"
                [routerLink]="['/accounts', value]"
                [title]="value"
              >
                {{ value | address }}
                @if (getNameForAddress(value)) {
                <span class="tag-name">[{{ getNameForAddress(value) }}]</span>
                }
              </a>
              }
            </div>
          </div>
          }
        </section>
        } @if (getReceivedTagGroups().length > 0) {
        <section class="tags-section">
          <h3>Incoming tags</h3>
          @for (tagGroup of getReceivedTagGroups(); track tagGroup.type) {
          <div class="tag-group">
            <h4>
              {{ tagGroup.type }}
              <span class="tag-count">({{ tagGroup.tags.length }})</span>
            </h4>
            <div class="tag-values">
              @for (tag of tagGroup.tags; track tag.fromAddress) {
              <a
                class="tag-value"
                [routerLink]="['/accounts', tag.fromAddress]"
              >
                {{ tag.fromAddress | address }}
                @if (getNameForAddress(tag.fromAddress)) {
                <span class="tag-name"
                  >[{{ getNameForAddress(tag.fromAddress) }}]</span
                >
                }
              </a>
              }
            </div>
          </div>
          }
        </section>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .account-container {
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
      }
      .account-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 2px solid var(--border-color-light);
      }
      .address-display {
        font-family: monospace;
        padding: 8px 12px;
        background: var(--card-bg-tertiary);
        border-radius: var(--border-radius-sm);
        cursor: pointer;
        transition: all var(--transition-duration) ease;
        display: flex;
        align-items: center;
        gap: 8px;
        position: relative;
        border: 1px solid var(--border-color-light);
      }
      .address-display:hover {
        background: var(--hover-bg);
        border-color: var(--accent-color);
        box-shadow: 0 2px 8px var(--accent-light);
      }
      .address-text {
        flex: 1;
        color: var(--text-primary);
      }
      .copy-icon {
        font-size: 0.9em;
        opacity: 0.6;
      }
      .address-display:hover .copy-icon {
        opacity: 1;
      }
      .copied-message {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: var(--accent-color);
        color: white;
        padding: 6px 12px;
        border-radius: var(--border-radius-sm);
        font-size: 0.85em;
        pointer-events: none;
        animation: fadeOut 1.5s forwards;
        box-shadow: 0 2px 8px var(--accent-light);
      }
      @keyframes fadeOut {
        0% {
          opacity: 1;
        }
        70% {
          opacity: 1;
        }
        100% {
          opacity: 0;
        }
      }
      .profile-section {
        margin-bottom: 30px;
      }
      .about {
        color: var(--text-secondary);
        font-style: italic;
        margin: 10px 0;
        line-height: 1.6;
      }
      .websites {
        margin-top: 15px;
      }

      .websites h4 {
        margin: 0 0 8px 0;
        color: var(--text-primary);
      }

      .websites a {
        display: block;
        color: var(--link-color);
        text-decoration: none;
        margin: 5px 0;
        transition: color var(--transition-duration) ease;
      }
      .websites a:hover {
        color: var(--link-hover);
        text-decoration: underline;
      }
      .tags-section {
        background: var(--card-bg-secondary);
        padding: 20px;
        border-radius: var(--border-radius-md);
        border: 1px solid var(--border-color-light);
      }

      .tags-section h3 {
        color: var(--text-primary);
      }

      .tag-group {
        margin-bottom: 20px;
      }
      .tag-group h4 {
        margin-bottom: 10px;
        color: var(--text-secondary);
      }
      .tag-values {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .tag-value {
        background: var(--tag-bg);
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 0.9em;
        cursor: pointer;
        text-decoration: none;
        color: var(--tag-text);
        display: inline-flex;
        align-items: center;
        transition: all var(--transition-duration) ease;
        border: 1px solid transparent;
      }
      .tag-value:hover {
        background: var(--tag-hover);
        border-color: var(--accent-color);
        transform: translateY(-2px);
        box-shadow: 0 2px 8px var(--accent-light);
      }
      .tag-name {
        margin-left: 4px;
        opacity: 0.8;
      }
      .rating {
        font-size: 0.9em;
        margin-left: 12px;
        padding: 4px 8px;
        border-radius: 12px;
        display: inline-block;
        font-weight: 600;
      }
      .rating.high {
        background: rgba(76, 175, 80, 0.15);
        color: #4caf50;
      }
      .rating.medium {
        background: rgba(255, 152, 0, 0.15);
        color: #ff9800;
      }
      .rating.low {
        background: rgba(244, 67, 54, 0.15);
        color: #f44336;
      }
      .tags-container {
        display: grid;
        gap: 20px;
      }
      .from-address {
        color: var(--text-secondary);
        font-size: 0.9em;
        margin-right: 4px;
      }
      .favorite-button {
        padding: 0.5rem 1rem;
        font-size: 1.5rem;
        background: transparent;
        border: 2px solid var(--accent-color);
        border-radius: var(--border-radius-sm);
        cursor: pointer;
        transition: all var(--transition-duration) ease;
        color: var(--accent-color);
      }

      .favorite-button.is-favorite {
        background: var(--accent-gradient);
        color: white;
        border-color: transparent;
      }

      .favorite-button:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 12px var(--accent-light);
      }
      .tag-count {
        font-size: 0.8em;
        color: var(--text-tertiary);
        font-weight: normal;
        margin-left: 0.5rem;
      }
      .nickname-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .nickname-input {
        padding: 0.75rem 1rem;
        font-size: 1.2rem;
        border: 2px solid var(--input-border);
        border-radius: var(--border-radius-sm);
        transition: all var(--transition-duration) ease;
        width: 100%;
        max-width: 300px;
        background: var(--input-bg);
        color: var(--text-primary);
      }

      .nickname-input:focus {
        outline: none;
        border-color: var(--input-border-focus);
        box-shadow: 0 2px 8px var(--accent-light);
      }

      .nickname-input::placeholder {
        color: var(--text-tertiary);
      }

      .remove-nickname {
        background: #f44336;
        color: white;
        border: none;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        font-size: 1.2rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--transition-duration) ease;
      }

      .remove-nickname:hover {
        background: #d32f2f;
        transform: scale(1.1);
      }

      .edit-button {
        margin-left: 1rem;
        padding: 6px 14px;
        background: var(--accent-gradient);
        color: white;
        border: none;
        border-radius: var(--border-radius-sm);
        cursor: pointer;
        font-size: 0.9rem;
        transition: all var(--transition-duration) ease;
        box-shadow: 0 2px 8px var(--accent-light);
      }

      .edit-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px var(--accent-light);
      }

      .external-links h4 {
        margin: 0 0 8px 0;
        color: var(--text-primary);
      }

      .external-links {
        margin-bottom: 20px;
      }

      .external-links a {
        display: inline-block;
        color: var(--link-color);
        text-decoration: none;
        margin: 5px 15px 5px 0;
        transition: color var(--transition-duration) ease;
      }
      .external-links a:hover {
        color: var(--link-hover);
        text-decoration: underline;
      }

      .balances-section {
        background: var(--card-bg-secondary);
        padding: 20px;
        border-radius: var(--border-radius-md);
        margin-bottom: 20px;
        border: 1px solid var(--border-color-light);
      }

      .balances-section h3 {
        margin-top: 0;
        margin-bottom: 15px;
        color: var(--text-primary);
      }

      .balances-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
      }

      .balance-item {
        background: var(--card-bg);
        padding: 12px;
        border-radius: var(--border-radius-sm);
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: var(--card-shadow);
        border: 1px solid var(--border-color-light);
        transition: all var(--transition-duration) ease;
      }

      .balance-item:hover {
        transform: translateY(-2px);
        box-shadow: var(--card-shadow-hover);
        border-color: var(--accent-color);
      }

      .asset-code {
        font-weight: 600;
        color: var(--text-primary);
      }

      .balance-amount {
        font-family: monospace;
        color: var(--accent-color);
        font-weight: 500;
      }
    `,
  ],
})
export class AccountDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private ratingService = inject(RatingService);
  private favoritesService = inject(FavoritesService);
  private nicknameService = inject(NicknameService);

  address = '';
  account: any = null;
  private accounts: Record<string, any> = {};

  data: BSNData | null = null;
  nickname = '';
  showCopiedMessage = false;

  constructor() {
    effect(() => {
      if (this.dataService.data()) {
        this.data = this.dataService.data();
        this.accounts = this.data?.accounts || {};

        this.route.paramMap.subscribe(async (params) => {
          this.address = params.get('address') || '';
          // this.address = this.route.snapshot.paramMap.get('address') || '';
          // const data = this.dataService.data();
          this.account = this.data?.accounts?.[this.address];
          this.nickname = this.nicknameService.getNickname(this.address) || '';
        });
      }
    });
  }

  ngOnInit() {}

  objectEntries(obj: any): [string, any][] {
    return Object.entries(obj);
  }

  getNameForAddress(address: string): string | null {
    return (
      this.accounts[address]?.profile?.Name?.[0] ||
      this.nicknameService.getNickname(address) ||
      null
    );
  }

  getRating(): number {
    return this.ratingService.calculateRating(this.account);
  }

  getGivenTagGroups() {
    if (!this.account?.tags) return [];
    return Object.entries(this.account.tags)
      .map(([type, values]) => ({
        type,
        values: values as string[],
      }))
      .sort((a, b) => a.type.localeCompare(b.type));
  }

  getReceivedTagGroups() {
    const tagGroups = new Map<string, Array<{ fromAddress: string }>>();

    // Iterate through all accounts
    for (const [fromAddress, accountData] of Object.entries(this.accounts)) {
      if (fromAddress === this.address || !accountData.tags) continue;

      // Check each tag type in the account
      for (const [tagType, values] of Object.entries(accountData.tags)) {
        if (Array.isArray(values) && values.includes(this.address)) {
          if (!tagGroups.has(tagType)) {
            tagGroups.set(tagType, []);
          }
          tagGroups.get(tagType)?.push({ fromAddress });
        }
      }
    }

    // Convert to sorted array
    return Array.from(tagGroups.entries())
      .map(([type, tags]) => ({ type, tags }))
      .sort((a, b) => a.type.localeCompare(b.type));
  }

  getBalances() {
    if (!this.account?.balances) return [];
    
    return Object.entries(this.account.balances).map(([asset, amount]) => ({
      asset: asset === 'native' ? 'XLM' : asset,
      amount: Number(amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 7
      })
    }));
  }

  toggleFavorite() {
    this.favoritesService.toggleFavorite(this.address);
  }

  isFavorite(): boolean {
    return this.favoritesService.isFavorite(this.address);
  }

  saveNickname() {
    if (this.nickname.trim()) {
      this.nicknameService.setNickname(this.address, this.nickname.trim());
    }
  }

  removeNickname() {
    this.nickname = '';
    this.nicknameService.removeNickname(this.address);
  }

  async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      this.showCopiedMessage = true;
      setTimeout(() => {
        this.showCopiedMessage = false;
      }, 1500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }
}
