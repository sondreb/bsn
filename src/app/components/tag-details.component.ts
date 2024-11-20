import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../services/data.service';
import { AddressPipe } from '../pipes/address.pipe';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-tag-details',
    imports: [CommonModule, AddressPipe, RouterLink],
    template: `
    <div class="tag-details-container">
      <h2>Tag: {{ tagName }}</h2>

      <div class="columns">
        <div class="column">
          <h3>From</h3>
          @for (entry of givenFrom; track entry.address) {
          <a [routerLink]="['/accounts', entry.address]" class="address-link">
            {{ entry.address | address }}
            @if (entry.name) {
            <span class="name">[{{ entry.name }}]</span>
            }
          </a>
          }
        </div>

        <div class="column">
          <h3>To</h3>
          @for (entry of receivedTo; track entry.address) {
          <a [routerLink]="['/accounts', entry.address]" class="address-link">
            {{ entry.address | address }}
            @if (entry.name) {
            <span class="name">[{{ entry.name }}]</span>
            }
          </a>
          }
        </div>
      </div>
    </div>
  `,
    styles: [
        `
      .tag-details-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }
      .columns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
        margin-top: 20px;
      }
      .column {
        background: #f5f5f5;
        padding: 20px;
        border-radius: 8px;
      }
      .address-link {
        display: block;
        padding: 8px;
        text-decoration: none;
        color: inherit;
        border-radius: 4px;
        margin: 4px 0;
        transition: background-color 0.2s;
      }
      .address-link:hover {
        background: #e0e0e0;
      }
      .name {
        color: #666;
        margin-left: 8px;
      }
      h3 {
        margin-top: 0;
        padding-bottom: 10px;
        border-bottom: 1px solid #ddd;
      }
    `,
    ]
})
export class TagDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);

  tagName = '';
  givenFrom: Array<{ address: string; name?: string }> = [];
  receivedTo: Array<{ address: string; name?: string }> = [];

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.tagName = params.get('name') || '';
      this.loadTagDetails();
    });
  }

  private loadTagDetails() {
    const data = this.dataService.data();
    if (!data?.accounts) return;

    this.givenFrom = [];
    this.receivedTo = [];

    // Scan through all accounts
    Object.entries(data.accounts).forEach(([address, account]) => {
      const name = account.profile?.Name?.[0];

      // Check if this account gives the tag
      if (account.tags?.[this.tagName]) {
        this.givenFrom.push({ address, name });

        // Add all receivers of this tag
        account.tags[this.tagName].forEach((receiverAddress: string) => {
          const receiverName =
            data.accounts[receiverAddress]?.profile?.Name?.[0];
          if (!this.receivedTo.some((e) => e.address === receiverAddress)) {
            this.receivedTo.push({
              address: receiverAddress,
              name: receiverName,
            });
          }
        });
      }
    });

    // Sort both arrays by address
    this.givenFrom.sort((a, b) => a.address.localeCompare(b.address));
    this.receivedTo.sort((a, b) => a.address.localeCompare(b.address));
  }
}
