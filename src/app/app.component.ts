import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from './services/data.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    FormsModule,
  ],
  template: `
    <div class="app-container">
      <header>
        <h1>Blockchain Social Network</h1>
        <button
          *ngIf="showInstallButton"
          (click)="installPwa()"
          class="install-button"
        >
          Install App
        </button>
      </header>

      <div *ngIf="updateAvailable" class="update-banner">
        A new version is available.
        <button (click)="updateApp()" class="update-button">Update Now</button>
      </div>

      <nav class="tabs">
        <a routerLink="/accounts" routerLinkActive="active">Accounts</a>
        <a routerLink="/tokens" routerLinkActive="active">Known Tokens</a>
        <a routerLink="/volunteers" routerLinkActive="active">Volunteers</a>
        <a routerLink="/tags" routerLinkActive="active">Tags</a>
      </nav>

      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
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

      .update-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #4caf50;
        color: white;
        padding: 10px;
        text-align: center;
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
      }

      .update-button {
        padding: 4px 8px;
        background: white;
        color: #4caf50;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
      }

      .update-button:hover {
        background: #eee;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  private dataService = inject(DataService);
  private swUpdate = inject(SwUpdate);

  deferredPrompt: any;
  showInstallButton = false;
  updateAvailable = false;

  constructor() {}

  async ngOnInit() {
    // Load data on app initialization
    await this.dataService.getData();

    // PWA installation logic
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton = true;
    });

    // PWA update logic
    if (this.swUpdate.isEnabled) {
      // Check for updates every 6 hours
      setInterval(() => {
        this.swUpdate.checkForUpdate();
      }, 6 * 60 * 60 * 1000);

      // Subscribe to available updates
      this.swUpdate.versionUpdates.subscribe((event) => {
        switch (event.type) {
          case 'VERSION_READY':
            this.updateAvailable = true;
            break;
          case 'VERSION_INSTALLATION_FAILED':
            console.error('Failed to install app version:', event.error);
            break;
        }
      });

      // Optional: Automatically update during application startup
      try {
        const updateFound = await this.swUpdate.checkForUpdate();
        console.log('Update found on startup:', updateFound);
      } catch (err) {
        console.error('Failed to check for updates:', err);
      }
    }
  }

  async updateApp() {
    try {
      await this.swUpdate.activateUpdate();
      document.location.reload();
    } catch (err) {
      console.error('Failed to activate update:', err);
    }
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
