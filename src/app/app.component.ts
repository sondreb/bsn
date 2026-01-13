import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from './services/data.service';
import { SwUpdate } from '@angular/service-worker';
import { ThemeService } from './services/theme.service';

@Component({
    selector: 'app-root',
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
        <div class="header-actions">
          <button 
            class="theme-toggle" 
            (click)="toggleTheme()" 
            [attr.aria-label]="themeService.isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'"
            title="Toggle theme"
          >
            <svg *ngIf="themeService.isDarkMode()" viewBox="0 0 24 24" fill="currentColor">
              <!-- Moon icon -->
              <path d="M12 11.807C10.7418 10.5483 9.88488 8.94484 9.53762 7.1993C9.19037 5.45375 9.36832 3.64444 10.049 2C8.10826 2.38205 6.3256 3.33431 4.92899 4.735C1.02399 8.64 1.02399 14.972 4.92899 18.877C8.83499 22.783 15.166 22.782 19.072 18.877C20.4723 17.4805 21.4245 15.6983 21.807 13.758C20.1625 14.4385 18.3533 14.6164 16.6077 14.2692C14.8622 13.9219 13.2588 13.0651 12 11.807V11.807Z"/>
            
            
            </svg>
            <svg *ngIf="!themeService.isDarkMode()" viewBox="0 0 24 24" fill="currentColor">
            
            <!-- Sun icon -->
            <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"/>
              <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
            </svg>
          </button>
          <button
            *ngIf="showInstallButton"
            (click)="installPwa()"
            class="install-button"
          >
            Install App
          </button>
        </div>
      </header>

      <div *ngIf="updateAvailable" class="update-banner">
        A new version is available.
        <button (click)="updateApp()" class="update-button">Update Now</button>
      </div>

      <nav class="tabs">
        <a routerLink="/accounts" routerLinkActive="active">Accounts</a>
        <a routerLink="/balances" routerLinkActive="active">Balances</a>
        <a routerLink="/tokens" routerLinkActive="active">Known Tokens</a>
        <a routerLink="/volunteers" routerLinkActive="active">Volunteers</a>
        <a routerLink="/tags" routerLinkActive="active">Tags</a>
        <a routerLink="/relationships" routerLinkActive="active">🌐 Relationships</a>
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
        background: var(--background);
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
        background: var(--card-bg);
        border-radius: 12px;
        box-shadow: var(--card-shadow);
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      header h1 {
        margin: 0;
        font-size: 2rem;
        background: var(--accent-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 700;
      }

      .install-button {
        padding: 0.75rem 1.5rem;
        background: var(--accent-gradient);
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
        background: var(--card-bg);
        padding: 0.5rem;
        margin-bottom: 2rem;
        border-radius: 12px;
        box-shadow: var(--card-shadow);
      }

      .tabs a {
        padding: 1rem 1.5rem;
        border-radius: 8px;
        text-decoration: none;
        color: var(--text-secondary);
        font-weight: 500;
        flex: 1;
        text-align: center;
        transition: all 0.3s ease;
      }

      .tabs a.active {
        background: var(--accent-gradient);
        color: white;
        font-weight: 600;
      }

      .tabs a:hover:not(.active) {
        background: rgba(128, 128, 128, 0.1);
        color: var(--text-primary);
      }

      main {
        background: var(--card-bg);
        border-radius: 12px;
        box-shadow: var(--card-shadow);
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

        .header-actions {
          justify-content: center;
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
    ]
})
export class AppComponent implements OnInit {
  private dataService = inject(DataService);
  private swUpdate = inject(SwUpdate);
  private router = inject(Router);
  public themeService = inject(ThemeService);

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
  
  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
