import { Component, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BSNData, DataService } from '../services/data.service';
import { AddressPipe } from '../pipes/address.pipe';
import { RouterLink } from '@angular/router';
import { RatingService } from '../services/rating.service';
import { FavoritesService } from '../services/favorites.service';

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [CommonModule, AddressPipe, RouterLink],
  template: `
    <div class="account-container" *ngIf="account">
      <header class="account-header">
        <div>
          <h2>Account Details</h2>
          <div class="address-display" [title]="address">
            {{ address | address }}
            <span
              class="rating"
              [class.high]="getRating() > 70"
              [class.medium]="getRating() > 30 && getRating() <= 70"
              [class.low]="getRating() <= 30"
            >
              {{ getRating() }}
            </span>
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
        @if (account.profile.Name) {
        <h3>{{ account.profile.Name[0] }}</h3>
        } @if (account.profile.About) {
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

      <div class="tags-container">
        @if (account.tags) {
        <section class="tags-section">
          <h3>Given Tags</h3>
          @for (tagGroup of getGivenTagGroups(); track tagGroup.type) {
          <div class="tag-group">
            <h4>{{ tagGroup.type }}</h4>
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
          <h3>Received Tags</h3>
          @for (tagGroup of getReceivedTagGroups(); track tagGroup.type) {
          <div class="tag-group">
            <h4>{{ tagGroup.type }}</h4>
            <div class="tag-values">
              @for (tag of tagGroup.tags; track tag.fromAddress) {
              <span class="tag-value">
                <span class="from-address">from</span>
                <a [routerLink]="['/accounts', tag.fromAddress]">
                  {{ tag.fromAddress | address }}
                  @if (getNameForAddress(tag.fromAddress)) {
                  <span class="tag-name"
                    >[{{ getNameForAddress(tag.fromAddress) }}]</span
                  >
                  }
                </a>
              </span>
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
        border-bottom: 1px solid #eee;
      }
      .address-display {
        font-family: monospace;
        padding: 4px 8px;
        background: #f5f5f5;
        border-radius: 4px;
        cursor: help;
        transition: all 0.3s ease;
      }
      .address-display:hover {
        background: #e0e0e0;
      }
      .profile-section {
        margin-bottom: 30px;
      }
      .about {
        color: #666;
        font-style: italic;
        margin: 10px 0;
      }
      .websites {
        margin-top: 15px;
      }
      .websites a {
        display: block;
        color: #007bff;
        text-decoration: none;
        margin: 5px 0;
      }
      .websites a:hover {
        text-decoration: underline;
      }
      .tags-section {
        background: #f8f8f8;
        padding: 20px;
        border-radius: 8px;
      }
      .tag-group {
        margin-bottom: 20px;
      }
      .tag-group h4 {
        margin-bottom: 10px;
        color: #666;
      }
      .tag-values {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .tag-value {
        background: #007bff22;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.9em;
        cursor: pointer;
        text-decoration: none;
        color: inherit;
        display: inline-flex;
        align-items: center;
      }
      .tag-value:hover {
        background: #007bff33;
      }
      .tag-name {
        margin-left: 4px;
        color: #666;
        font-size: 0.9em;
      }
      .rating {
        font-size: 0.9em;
        margin-left: 12px;
        padding: 4px 8px;
        border-radius: 12px;
        display: inline-block;
      }
      .rating.high {
        background: #4caf5022;
        color: #4caf50;
      }
      .rating.medium {
        background: #ff980022;
        color: #ff9800;
      }
      .rating.low {
        background: #f4433622;
        color: #f44336;
      }
      .tags-container {
        display: grid;
        gap: 20px;
      }
      .from-address {
        color: #666;
        font-size: 0.9em;
        margin-right: 4px;
      }
      .favorite-button {
        padding: 0.5rem 1rem;
        font-size: 1.5rem;
        background: transparent;
        border: 2px solid #764ba2;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: #764ba2;
      }

      .favorite-button.is-favorite {
        background: #764ba2;
        color: white;
      }

      .favorite-button:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(118, 75, 162, 0.2);
      }
    `,
  ],
})
export class AccountDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private ratingService = inject(RatingService);
  private favoritesService = inject(FavoritesService);

  address = '';
  account: any = null;
  private accounts: Record<string, any> = {};

  data: BSNData | null = null;

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
        });
      }
    });
  }

  ngOnInit() {}

  objectEntries(obj: any): [string, any][] {
    return Object.entries(obj);
  }

  getNameForAddress(address: string): string | null {
    return this.accounts[address]?.profile?.Name?.[0] || null;
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

  toggleFavorite() {
    this.favoritesService.toggleFavorite(this.address);
  }

  isFavorite(): boolean {
    return this.favoritesService.isFavorite(this.address);
  }
}
