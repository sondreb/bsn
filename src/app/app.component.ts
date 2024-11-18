import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  deferredPrompt: any;
  showInstallButton = false;

  ngOnInit() {
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
