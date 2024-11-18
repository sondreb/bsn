import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, FormsModule],
  template: `
    <div class="app-container">
      <header>
        <h1>Blockchain Social Network</h1>
        <button *ngIf="showInstallButton" (click)="installPwa()" class="install-button">
          Install App
        </button>
      </header>

      <nav class="tabs">
        <a routerLink="/accounts" routerLinkActive="active">Accounts</a>
        <a routerLink="/tokens" routerLinkActive="active">Known Tokens</a>
        <a routerLink="/volunteers" routerLinkActive="active">Volunteers</a>
      </nav>

      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    /* ...existing styles... */
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 1rem;
      background: #fff;
    }

    header h1 {
      margin: 0;
      font-size: 1.8rem;
    }

    .install-button {
      margin-left: auto; /* Ensures button stays right */
      padding: 8px 16px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .install-button:hover {
      background-color: #0056b3;
    }

    .tabs {
      display: flex;
      gap: 1px;
      background: #ddd;
      padding: 1px;
      margin-bottom: 20px;
    }
    .tabs a {
      padding: 12px 24px;
      background: #f5f5f5;
      text-decoration: none;
      color: #666;
      flex: 1;
      text-align: center;
    }
    .tabs a.active {
      background: #fff;
      color: #000;
      font-weight: bold;
    }
  `]
})
export class AppComponent implements OnInit {
  private dataService = inject(DataService);
  deferredPrompt: any;
  showInstallButton = false;

  async ngOnInit() {
    // Load data on app initialization
    await this.dataService.getData();

    // PWA installation logic
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton = true;
    });
  }

  async installPwa() {
    if (!this.deferredPrompt) return;
    
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      this.showInstallButton = false;
    }
    this.deferredPrompt = null;
  }
}
