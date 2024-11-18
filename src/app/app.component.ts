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
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    header h1 {
      margin: 0;
      font-size: 1.8rem;
      color: #333;
    }

    .install-button {
      margin-left: auto;
      padding: 8px 16px;
      background-color: #764ba2;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .install-button:hover {
      background-color: #667eea;
    }

    .tabs {
      display: flex;
      gap: 1px;
      background: rgba(255, 255, 255, 0.2);
      padding: 1px;
      margin-bottom: 20px;
      border-radius: 8px;
      overflow: hidden;
    }
    .tabs a {
      padding: 12px 24px;
      background: rgba(255, 255, 255, 0.9);
      text-decoration: none;
      color: #666;
      flex: 1;
      text-align: center;
      transition: all 0.3s ease;
    }
    .tabs a.active {
      background: #fff;
      color: #764ba2;
      font-weight: bold;
    }
    .tabs a:hover:not(.active) {
      background: rgba(255, 255, 255, 1);
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
