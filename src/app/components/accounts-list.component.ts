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
            <div
              class="header-content"
              [routerLink]="['/accounts', account[0]]"
            >
              @if (account[1].profile?.Name) {
              <h3>{{ account[1].profile.Name[0] }}</h3>
              } @else if (getNickname(account[0])) {
              <h3>
                <em>{{ getNickname(account[0]) }}</em>
              </h3>
              }
              <h4 class="address-display" [title]="account[0]">
                {{ account[0] | address }}
                <span
                  class="rating"
                  [class.high]="getRating(account[1]) > 70"
                  [class.medium]="
                    getRating(account[1]) > 30 && getRating(account[1]) <= 70
                  "
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

      .websites {
        margin-top: 15px;
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

      .search-container {
        margin-bottom: 2rem;
      }

      .search-input {
        width: 100%;
        padding: 1rem;
        border: 2px solid var(--input-border);
        border-radius: var(--border-radius-md);
        font-size: 1rem;
        transition: all var(--transition-duration) ease;
        box-shadow: var(--card-shadow);
        background: var(--input-bg);
        color: var(--text-primary);
      }

      .search-input:focus {
        outline: none;
        border-color: var(--input-border-focus);
        box-shadow: 0 4px 16px var(--accent-light);
      }

      .search-input::placeholder {
        color: var(--text-tertiary);
      }

      .filters {
        background: var(--card-bg-secondary);
        padding: 1.5rem;
        border-radius: var(--border-radius-md);
        margin-bottom: 2rem;
        border: 1px solid var(--border-color-light);
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
        transition: all var(--transition-duration) ease;
        color: var(--text-primary);
      }

      .filter-group label:hover {
        color: var(--accent-color);
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
        background: var(--card-bg);
        border-radius: var(--border-radius-md);
        padding: 1.5rem;
        box-shadow: var(--card-shadow);
        transition: all var(--transition-duration) ease;
        border: 1px solid var(--border-color-light);
      }

      .account-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--card-shadow-hover);
        border-color: var(--accent-color);
      }

      .account-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        cursor: pointer;
        padding: 0.5rem;
        margin: -0.5rem;
        border-radius: var(--border-radius-sm);
        transition: background var(--transition-duration) ease;
      }

      .account-header:hover {
        background: var(--hover-bg);
      }

      .header-content {
        flex: 1;
      }

      .favorite-button {
        padding: 0.5rem;
        font-size: 1.2rem;
        background: transparent;
        border: 2px solid var(--accent-color);
        border-radius: var(--border-radius-sm);
        cursor: pointer;
        transition: all var(--transition-duration) ease;
        color: var(--accent-color);
        margin-left: 1rem;
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

      .account-header h3 {
        margin: 0 0 0.5rem 0;
        color: var(--text-primary);
        font-size: 1.2rem;
      }

      .address-display {
        font-family: 'Monaco', 'Consolas', monospace;
        font-size: 0.9rem;
        color: var(--text-secondary);
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

      .tag-values {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 1rem;
      }

      .tag-value {
        background: var(--tag-bg);
        padding: 0.5rem 1rem;
        border-radius: 999px;
        font-size: 0.9rem;
        text-decoration: none;
        color: var(--tag-text);
        transition: all var(--transition-duration) ease;
        border: 1px solid transparent;
      }

      .tag-value:hover {
        background: var(--tag-hover);
        transform: translateY(-2px);
        border-color: var(--accent-color);
        box-shadow: 0 2px 8px var(--accent-light);
      }

      .tag-name {
        opacity: 0.8;
        margin-left: 0.25rem;
      }

      .about {
        margin: 1rem 0;
        color: var(--text-secondary);
        font-size: 0.95rem;
        line-height: 1.6;
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
    ]
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
      return (
        data[1].profile?.Name?.[0] ||
        this.nicknameService.getNickname(address) ||
        null
      );
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
