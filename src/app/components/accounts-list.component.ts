import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';
import { AddressPipe } from '../pipes/address.pipe';
import { map } from 'rxjs';
import { RouterLink } from '@angular/router';

// Add this interface if it doesn't exist
interface BSNData {
  accounts: Record<string, any>;
  [key: string]: any;
}

@Component({
  selector: 'app-accounts-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AddressPipe, RouterLink],
  template: `
    <div class="accounts-container">
      <div class="filters">
        <h3>Filter by Tag</h3>
        <select [(ngModel)]="selectedTag" (change)="filterByTag()">
          <option value="">All Accounts</option>
          @for (tag of uniqueTags; track tag) {
          <option [value]="tag">{{ tag }}</option>
          }
        </select>
      </div>

      <div class="accounts-grid">
        @for (account of filteredAccounts; track account[0]) {
        <div class="account-card">
          <div class="account-header" [routerLink]="['/accounts', account[0]]">
            @if (account[1].profile?.Name) {
              <h3>{{ account[1].profile.Name[0] }}</h3>
            }
            <h4 class="address-display" [title]="account[0]">
              {{ account[0] | address }}
            </h4>
          </div>
          
          @if (account[1].profile?.About) {
            <p class="about">{{ account[1].profile.About[0] }}</p>
          }
          
          @if (account[1].profile?.Website) {
            <div class="websites">
              @for (website of account[1].profile.Website; track website) {
                <a [href]="website" target="_blank" rel="noopener">{{ website }}</a>
              }
            </div>
          }

          @if (account[1].tags) {
          <div class="tags">
            @for (tagEntry of account[1].tags | keyvalue; track tagEntry.key) {
            <div class="tag">
              <span>{{ tagEntry.key }}:</span>
              <div class="tag-values">
                @for (value of (tagEntry.value || []); track value) {
                <span class="tag-value" [title]="value">{{
                  value | address
                }}
                @if (getNameForAddress(value)) {
                  <span class="tag-name">[{{ getNameForAddress(value) }}]</span>
                }
                </span>
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
      .about {
        margin: 8px 0;
        font-style: italic;
        color: #666;
      }
      
      .websites {
        margin: 8px 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      .websites a {
        color: #007bff;
        font-size: 0.9em;
        text-decoration: none;
      }
      
      .websites a:hover {
        text-decoration: underline;
      }
      .tag-name {
        margin-left: 4px;
        color: #666;
        font-size: 0.9em;
      }
      .account-header {
        cursor: pointer;
        transition: opacity 0.2s;
        padding: 4px;
        margin: -4px;
        border-radius: 4px;
      }
      .account-header:hover {
        opacity: 0.8;
        background: rgba(0,0,0,0.05);
      }
      .account-header h3 {
        margin: 0 0 8px 0;
      }
      .address-display {
        margin: 0;
      }
    `,
  ],
})
export class AccountsListComponent implements OnInit {
  dataService = inject(DataService);
  
  uniqueTags: string[] = [];
  selectedTag = '';
  filteredAccounts: [string, any][] = [];

  async ngOnInit() {
    this.uniqueTags = await this.dataService.getUniqueTags();
    await this.filterByTag();
  }

  async filterByTag() {
    if (this.selectedTag) {
      this.filteredAccounts = await this.dataService.getAccountsByTag(this.selectedTag);
    } else {
      const data = await this.dataService.getData();
      this.filteredAccounts = this.sortAccounts(
        data ? Object.entries(data['accounts']) : []
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

   getNameForAddress(address: string): string | null {
    const data = this.filteredAccounts.find(([addr]) => addr === address);
    if (data && data[1].profile?.Name?.[0]) {
      return data[1].profile.Name[0];
    }
    return null;
  }
}
