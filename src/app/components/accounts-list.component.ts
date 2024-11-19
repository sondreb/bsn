import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';
import { AddressPipe } from '../pipes/address.pipe';
import { map } from 'rxjs';
import { RouterLink } from '@angular/router';
import { RatingService } from '../services/rating.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';
import { FavoritesService } from '../services/favorites.service';
import { NicknameService } from '../services/nickname.service';

// Add this interface if it doesn't exist
interface BSNData {
  accounts: Record<string, any>;
  [key: string]: any;
}

@Component({
  selector: 'app-accounts-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddressPipe,
    RouterLink,
    LoadingSpinnerComponent,
  ],
  template: `
    <div class="accounts-container">
      <div class="search-container">
        <input
          type="search"
          [(ngModel)]="searchQuery"
          (input)="onSearch()"
          placeholder="Search accounts by name or description..."
          class="search-input"
        />
      </div>

      @if (dataService.loading$ | async) {
      <app-loading-spinner />
      } @else {
      <div class="filters">
        <div class="filter-group">
          <label>
            <input
              type="radio"
              name="tagFilter"
              [value]="'withTags'"
              [(ngModel)]="tagFilterMode"
              (change)="filterByTag()"
            />
            With Tags
          </label>
          <label>
            <input
              type="radio"
              name="tagFilter"
              [value]="'withoutTags'"
              [(ngModel)]="tagFilterMode"
              (change)="filterByTag()"
            />
            Without Tags
          </label>
          <label class="favorites-filter">
            <input
              type="checkbox"
              [(ngModel)]="showFavoritesOnly"
              (change)="filterByTag()"
            />
            Favorites Only
          </label>
        </div>

        <!--  <div class="filters">
        <h3>Filter by Tag</h3>
        <select [(ngModel)]="selectedTag" (change)="filterByTag()">
          <option value="">All Accounts</option>
          @for (tag of uniqueTags; track tag) {
          <option [value]="tag">{{ tag }}</option>
          }
        </select>
      </div>-->
      </div>

      <div class="accounts-grid">
        @for (account of filteredAccounts(); track account[0]) {
        <div class="account-card">
          <div class="account-header">
            <div class="header-content" [routerLink]="['/accounts', account[0]]">
              @if (account[1].profile?.Name) {
                <h3>{{ account[1].profile.Name[0] }}</h3>
              } @else if (getNickname(account[0])) {
                <h3><em>{{ getNickname(account[0]) }}</em></h3>
              }
              <h4 class="address-display" [title]="account[0]">
                {{ account[0] | address }}
                <span
                  class="rating"
                  [class.high]="getRating(account[1]) > 70"
                  [class.medium]="getRating(account[1]) > 30 && getRating(account[1]) <= 70"
                  [class.low]="getRating(account[1]) <= 30"
                >
                  {{ getRating(account[1]) }}
                </span>
              </h4>
            </div>
            <button
              class="favorite-button"
              (click)="toggleFavorite(account[0]); $event.stopPropagation()"
              [class.is-favorite]="isFavorite(account[0])"
            >
              {{ isFavorite(account[0]) ? '★' : '☆' }}
            </button>
          </div>

          @if (account[1].profile?.About) {
          <p class="about">{{ account[1].profile.About[0] }}</p>
          } @if (account[1].profile?.Website) {
          <div class="websites">
            @for (website of account[1].profile.Website; track website) {
            <a [href]="website" target="_blank" rel="noopener">{{ website }}</a>
            }
          </div>
          } @if (account[1].tags && tagFilterMode === 'withTags') {
          <div class="tags">
            @for (tagEntry of account[1].tags | keyvalue; track tagEntry.key) {
            <div class="tag">
              <span>{{ tagEntry.key }}:</span>
              <div class="tag-values">
                @for (value of (tagEntry.value || []); track value) {
                <a
                  class="tag-value"
                  [routerLink]="['/accounts', value]"
                  [title]="value"
                  >{{ value | address }}
                  @if (getNameForAddress(value)) {
                  <span class="tag-name">[{{ getNameForAddress(value) }}]</span>
                  }
                </a>
                }
              </div>
            </div>
            }
          </div>
          }
        </div>
        }
      </div>
      }
    </div>
  `,
  styles: [
    `
      .accounts-container {
        padding: 1rem;
      }

      .search-container {
        margin-bottom: 2rem;
      }

      .search-input {
        width: 100%;
        padding: 1rem;
        border: 2px solid #eee;
        border-radius: 12px;
        font-size: 1rem;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }

      .search-input:focus {
        outline: none;
        border-color: #764ba2;
        box-shadow: 0 4px 12px rgba(118, 75, 162, 0.15);
      }

      .filters {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 12px;
        margin-bottom: 2rem;
      }

      .filter-group {
        display: flex;
        gap: 2rem;
        flex-wrap: wrap;
      }

      .filter-group label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .favorites-filter {
        margin-left: auto;
      }

      .accounts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.5rem;
      }

      .account-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
      }

      .account-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
      }

      .account-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        cursor: pointer;
        padding: 0.5rem;
        margin: -0.5rem;
        border-radius: 8px;
      }

      .header-content {
        flex: 1;
      }

      .favorite-button {
        padding: 0.5rem;
        font-size: 1.2rem;
        background: transparent;
        border: 2px solid #764ba2;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: #764ba2;
        margin-left: 1rem;
      }

      .favorite-button.is-favorite {
        background: #764ba2;
        color: white;
      }

      .favorite-button:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(118, 75, 162, 0.2);
      }

      .account-header h3 {
        margin: 0 0 0.5rem 0;
        color: #333;
        font-size: 1.2rem;
      }

      .address-display {
        font-family: 'Monaco', 'Consolas', monospace;
        font-size: 0.9rem;
        color: #666;
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

      .tag-values {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 1rem;
      }

      .tag-value {
        background: #f0f4ff;
        padding: 0.5rem 1rem;
        border-radius: 999px;
        font-size: 0.9rem;
        text-decoration: none;
        color: #4a5568;
        transition: all 0.3s ease;
      }

      .tag-value:hover {
        background: #e2e8ff;
        transform: translateY(-1px);
      }

      .about {
        margin: 1rem 0;
        color: #666;
        font-size: 0.95rem;
        line-height: 1.5;
      }

      @media (max-width: 768px) {
        .accounts-grid {
          grid-template-columns: 1fr;
        }

        .filter-group {
          flex-direction: column;
          gap: 1rem;
        }
      }
    `,
  ],
})
export class AccountsListComponent implements OnInit {
  dataService = inject(DataService);
  private ratingService = inject(RatingService);
  private favoritesService = inject(FavoritesService);
  private nicknameService = inject(NicknameService);

  uniqueTags: string[] = [];
  selectedTag = '';
  tagFilterMode: 'withTags' | 'withoutTags' = 'withoutTags';
  searchQuery = '';
  showFavoritesOnly = this.favoritesService.getShowFavoritesOnly();

  refresh = signal<boolean>(false);

  filteredAccounts = computed(() => {
    const r = this.refresh();
    const data = this.dataService.data();
    if (!data?.accounts) return [];

    let filtered = Object.entries(data.accounts);

    // Apply favorites filter first
    if (this.showFavoritesOnly) {
      console.log('SHOW FAVORITES ONLY!');
      filtered = filtered.filter(([address]) =>
        this.favoritesService.isFavorite(address)
      );
    }

    // Apply search filter only if there's a search query
    const searchQuery = this.dataService.searchQuery().toLowerCase().trim();
    if (searchQuery.length > 0) {
      filtered = filtered.filter(([address, account]) => {
        const name = account.profile?.Name?.[0]?.toLowerCase() || '';
        const about = account.profile?.About?.[0]?.toLowerCase() || '';

        // Check if search query matches start or end of address
        const addressStart = address.slice(0, 4).toLowerCase();
        const addressEnd = address.slice(-4).toLowerCase();
        const isAddressMatch =
          searchQuery.length >= 4 &&
          (addressStart.includes(searchQuery.slice(0, 4)) ||
            addressEnd.includes(searchQuery.slice(-4)));

        return (
          name.includes(searchQuery) ||
          about.includes(searchQuery) ||
          isAddressMatch
        );
      });
    }

    // Apply selected tag filter if exists
    // if (this.selectedTag) {
    //   filtered = filtered.filter(
    //     ([_, account]) => account.tags && this.selectedTag in account.tags
    //   );
    // }

    return this.sortAccounts(filtered);
  });

  constructor() {
    // Set up effect to update unique tags when data changes
    effect(() => {
      const data = this.dataService.data();
      if (!data?.accounts) {
        this.uniqueTags = [];
        return;
      }

      const tags = new Set<string>();
      Object.values(data.accounts).forEach((account) => {
        if (account.tags) {
          Object.keys(account.tags).forEach((tag) => tags.add(tag));
        }
      });
      this.uniqueTags = Array.from(tags).sort();
    });
    this.onSearch = this.debounce(this.onSearch.bind(this), 300);
  }

  async ngOnInit() {
    await this.dataService.getData();
  }

  filterByTag() {
    this.favoritesService.setShowFavoritesOnly(this.showFavoritesOnly);
    this.refresh.set(!this.refresh());
  }

  private getTagCount(account: any): number {
    return Object.keys(account.tags || {}).length;
  }

  private sortAccounts(accounts: [string, any][]): [string, any][] {
    return accounts.sort((a, b) => {
      // Primary sort: rating (descending)
      const ratingA = this.getRating(a[1]);
      const ratingB = this.getRating(b[1]);
      if (ratingA !== ratingB) return ratingB - ratingA;

      // Secondary sort: number of tags
      const tagsA = this.getTagCount(a[1]);
      const tagsB = this.getTagCount(b[1]);
      if (tagsA !== tagsB) return tagsB - tagsA;

      return a[0].localeCompare(b[0]);
    });
  }

  getRating(account: any): number {
    return this.ratingService.calculateRating(account);
  }

  getNameForAddress(address: string): string | null {
    const data = this.filteredAccounts().find(([addr]) => addr === address);
    if (data) {
      return data[1].profile?.Name?.[0] || 
             this.nicknameService.getNickname(address) ||
             null;
    }
    return null;
  }

  getNickname(address: string): string | null {
    return this.nicknameService.getNickname(address);
  }

  onSearch() {
    this.dataService.setSearchQuery(this.searchQuery);
  }

  private debounce(fn: Function, delay: number): (...args: any[]) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function (this: any, ...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  toggleFavorite(address: string) {
    this.favoritesService.toggleFavorite(address);
  }

  isFavorite(address: string): boolean {
    return this.favoritesService.isFavorite(address);
  }
}
