import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../services/data.service';
import { AddressPipe } from '../pipes/address.pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [CommonModule, AddressPipe, RouterLink],
  template: `
    <div class="account-container" *ngIf="account">
      <header class="account-header">
        <h2>Account Details</h2>
        <div class="address-display" [title]="address">
          {{ address | address }}
        </div>
      </header>

      @if (account.profile) {
        <section class="profile-section">
          @if (account.profile.Name) {
            <h3>{{ account.profile.Name[0] }}</h3>
          }
          @if (account.profile.About) {
            <p class="about">{{ account.profile.About[0] }}</p>
          }
          @if (account.profile.Website) {
            <div class="websites">
              <h4>Websites</h4>
              @for (website of account.profile.Website; track website) {
                <a [href]="website" target="_blank" rel="noopener">{{ website }}</a>
              }
            </div>
          }
        </section>
      }

      @if (account.tags) {
        <section class="tags-section">
          <h3>Tags</h3>
          @for (tag of objectEntries(account.tags); track tag[0]) {
            <div class="tag-group">
              <h4>{{ tag[0] }}</h4>
              <div class="tag-values">
                @for (value of tag[1]; track value) {
                  <a class="tag-value" [routerLink]="['/accounts', value]" [title]="value">
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
      }
    </div>
  `,
  styles: [`
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
  `]
})
export class AccountDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);

  address = '';
  account: any = null;
  private accounts: Record<string, any> = {};

  async ngOnInit() {
    this.address = this.route.snapshot.paramMap.get('address') || '';
    const data = await this.dataService.getData();
    this.account = data?.accounts?.[this.address];
    this.accounts = data?.accounts || {};
  }

  objectEntries(obj: any): [string, any][] {
    return Object.entries(obj);
  }

  getNameForAddress(address: string): string | null {
    return this.accounts[address]?.profile?.Name?.[0] || null;
  }
}
