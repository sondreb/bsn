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

      h2 {
        color: var(--text-primary);
        margin-bottom: 1.5rem;
      }

      .token-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 12px;
      }
      .token-card {
        padding: 16px;
        background: var(--card-bg);
        border-radius: var(--border-radius-md);
        text-align: center;
        cursor: help;
        transition: all var(--transition-duration) ease;
        border: 1px solid var(--border-color-light);
        box-shadow: var(--card-shadow);
      }

      .token-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--card-shadow-hover);
        border-color: var(--accent-color);
      }

      .token-name {
        font-weight: 700;
        margin-bottom: 6px;
        color: var(--text-primary);
        font-size: 1.1em;
      }
      .token-address {
        font-size: 0.9em;
        color: var(--text-secondary);
        font-family: monospace;
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
