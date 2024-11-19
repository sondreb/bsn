import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
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
      :host {
        display: block;
        min-height: 100vh;
        background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
      }

      .app-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
      }

      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      }

      header h1 {
        margin: 0;
        font-size: 2rem;
        background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 700;
      }

      .install-button {
        padding: 0.75rem 1.5rem;
        background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(118, 75, 162, 0.2);
      }

      .install-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(118, 75, 162, 0.3);
      }

      .tabs {
        display: flex;
        gap: 0.5rem;
        background: white;
        padding: 0.5rem;
        margin-bottom: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      }

      .tabs a {
        padding: 1rem 1.5rem;
        border-radius: 8px;
        text-decoration: none;
        color: #666;
        font-weight: 500;
        flex: 1;
        text-align: center;
        transition: all 0.3s ease;
      }

      .tabs a.active {
        background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        color: white;
        font-weight: 600;
      }

      .tabs a:hover:not(.active) {
        background: #f5f7fa;
        color: #764ba2;
      }

      main {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        padding: 2rem;
        min-height: calc(100vh - 200px);
      }

      .update-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
        color: white;
        padding: 1rem;
        text-align: center;
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        font-weight: 500;
      }

      .update-button {
        padding: 0.5rem 1rem;
        background: white;
        color: #4caf50;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
      }

      .update-button:hover {
        background: #f5f5f5;
        transform: translateY(-1px);
      }

      @media (max-width: 768px) {
        .app-container {
          padding: 0.5rem;
        }

        header {
          padding: 1rem;
          margin-bottom: 1rem;
          flex-direction: column;
          gap: 1rem;
          text-align: center;
        }

        .tabs {
          flex-direction: column;
          gap: 0.25rem;
        }

        main {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  private dataService = inject(DataService);
  private swUpdate = inject(SwUpdate);
  private router = inject(Router);

  deferredPrompt: any;
  showInstallButton = false;
  updateAvailable = false;

  constructor() {
    // Add router event subscription to scroll to top
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Check if we're navigating to a details page
        if (event.url.includes('/accounts/') || event.url.includes('/tags/')) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });
  }

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
