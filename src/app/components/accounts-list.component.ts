import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-accounts-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
          <h4>{{ account[0] }}</h4>
          @if (account[1].profile?.Name) {
          <p>Name: {{ account[1].profile?.Name?.[0] }}</p>
          } @if (account[1].tags) {
          <div class="tags">
            @for (tagEntry of account[1].tags | keyvalue; track tagEntry.key) {
            <div class="tag">
              {{ tagEntry.key }}: {{ tagEntry.value.join(', ') }}
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
    `,
  ],
})
export class AccountsListComponent {
  dataService = inject(DataService);

  uniqueTags$ = this.dataService.getUniqueTags();
  selectedTag = '';
  filteredAccounts$ = this.dataService
    .getData()
    .pipe(map((data) => (data ? Object.entries(data.accounts) : [])));

  constructor() {}

  filterByTag() {
    if (this.selectedTag) {
      this.filteredAccounts$ = this.dataService.getAccountsByTag(
        this.selectedTag
      );
    } else {
      this.filteredAccounts$ = this.dataService
        .getData()
        .pipe(map((data) => (data ? Object.entries(data.accounts) : [])));
    }
  }
}
