import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-known-tokens',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tokens-container">
      <h2>Known Tokens</h2>
      <div class="token-grid">
        @for (token of knownTokens$ | async; track token) {
        <div class="token-card">{{ token }}</div>
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
      }
    `,
  ],
})
export class KnownTokensComponent {
  dataService = inject(DataService);

  knownTokens$ = this.dataService
    .getData()
    .pipe(map((data) => data?.knownTokens || []));

  constructor() {}
}
