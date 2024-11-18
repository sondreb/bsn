import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';
import { AddressPipe } from '../pipes/address.pipe';
import { map } from 'rxjs';

// Add this interface if it doesn't exist
interface BSNData {
  accounts: Record<string, any>;
  [key: string]: any;
}

@Component({
  selector: 'app-accounts-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AddressPipe],
  template: `
    <div class="accounts-container">
      <div class="filters">
        <h3>Filter by Tag</h3>
        <select [(ngModel)]="selectedTag" (change)="filterByTag()">
          <option value="">All Accounts</option>
          @for (tag of uniqueTags$ | async; track tag) {
            <option [value]="tag">{{ tag }}</option>
          }
        </select>
      </div>

      <div class="accounts-grid">
        @for (account of filteredAccounts$ | async; track account[0]) {
          <div class="account-card">
            <h4 class="address-display" [title]="account[0]">
              {{ account[0] | address }}
            </h4>
            @if (account[1].profile?.Name) {
              <p>Name: {{ account[1].profile.Name[0] }}</p>
            }
            @if (account[1].tags) {
              <div class="tags">
                @for (tagEntry of account[1].tags | keyvalue; track tagEntry.key) {
                  <div class="tag">
                    <span>{{ tagEntry.key }}:</span>
                    <div class="tag-values">
                      @for (value of (tagEntry.value || []); track value) {
                        <span class="tag-value" [title]="value">{{ value | address }}</span>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .accounts-container {
        padding: 20px;
      }
      .filters {
        margin-bottom: 20px;
      }
      .accounts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }
      .account-card {
        padding: 15px;
        background: #f5f5f5;
        border-radius: 8px;
      }
      .tags {
        margin-top: 10px;
      }
      .tag {
        background: #e0e0e0;
        padding: 4px 8px;
        margin: 4px;
        border-radius: 4px;
        display: inline-block;
      }
      .address-display {
        cursor: help;
      }
      .tag-values {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
      .tag-value {
        background: #007bff22;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 0.9em;
        cursor: help;
      }
    `,
  ],
})
export class AccountsListComponent {
  dataService = inject(DataService);

  uniqueTags$ = this.dataService.getUniqueTags();
  selectedTag = '';
  filteredAccounts$ = this.dataService
    .getData()
    .pipe(
      map((data: BSNData | null) => (data ? Object.entries(data['accounts']) : [])),
      map(accounts => this.sortAccounts(accounts))
    );

  constructor() {}

  filterByTag() {
    if (this.selectedTag) {
      this.filteredAccounts$ = this.dataService.getAccountsByTag(
        this.selectedTag
      );
    } else {
      this.filteredAccounts$ = this.dataService
        .getData()
        .pipe(
          map((data: BSNData | null) => (data ? Object.entries(data['accounts']) : [])),
          map(accounts => this.sortAccounts(accounts))
        );
    }
  }

  private getTagCount(account: any): number {
    return Object.keys(account.tags || {}).length;
  }

  private sortAccounts(accounts: [string, any][]): [string, any][] {
    return accounts.sort((a, b) => {
      // Primary sort: number of tags (descending)
      const tagsA = this.getTagCount(a[1]);
      const tagsB = this.getTagCount(b[1]);
      if (tagsA !== tagsB) return tagsB - tagsA;

      // Secondary sort: by name
      const nameA = (a[1].name || '').toLowerCase();
      const nameB = (b[1].name || '').toLowerCase();
      if (nameA !== nameB) {
        if (!nameA) return 1;
        if (!nameB) return -1;
        return nameA.localeCompare(nameB);
      }

      // Tertiary sort: by address
      return a[0].localeCompare(b[0]);
    });
  }
}
