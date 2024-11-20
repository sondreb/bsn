import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';
import { AddressPipe } from '../pipes/address.pipe';

@Component({
    selector: 'app-known-tokens',
    imports: [CommonModule, AddressPipe],
    template: `
    <div class="tokens-container">
      <h2>Known Tokens</h2>
      <div class="token-grid">
        @for (token of knownTokens; track token) {
          <div class="token-card" [title]="token">
            <div class="token-name">{{ token.split('-')[0] }}</div>
            @if (token.includes('-')) {
              <div class="token-address">{{ token.split('-')[1] | address }}</div>
            }
          </div>
        }
      </div>
    </div>
  `,
    styles: [
        `
      .tokens-container {
        padding: 20px;
      }
      .token-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 10px;
      }
      .token-card {
        padding: 10px;
        background: #f5f5f5;
        border-radius: 4px;
        text-align: center;
        cursor: help;
      }
      .token-name {
        font-weight: bold;
        margin-bottom: 4px;
      }
      .token-address {
        font-size: 0.9em;
        color: #666;
      }
    `,
    ]
})
export class KnownTokensComponent implements OnInit {
  dataService = inject(DataService);
  knownTokens: string[] = [];

  ngOnInit() {
    this.knownTokens = this.dataService.data()?.knownTokens || [];
  }
}
