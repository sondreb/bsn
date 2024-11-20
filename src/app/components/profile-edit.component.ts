import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { Profile } from '../interfaces/profile.interface';
import { AddressPipe } from '../pipes/address.pipe';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, AddressPipe],
  template: `
    <div class="edit-container">
      <h2>Edit Profile for {{ address | address }}</h2>

      <div class="form-group">
        <h3>Names</h3>
        @for (name of profile.Name || ['']; track $index) {
          <div class="array-input">
            <input type="text" [(ngModel)]="profile.Name![$index]" placeholder="Name">
            <button (click)="removeFromArray('Name', $index)">×</button>
          </div>
        }
        <button class="add-button" (click)="addToArray('Name')">+ Add Name</button>
      </div>

      <div class="form-group">
        <h3>About</h3>
        @for (about of profile.About || ['']; track $index) {
          <div class="array-input">
            <input type="text" [(ngModel)]="profile.About![$index]" placeholder="About">
            <button (click)="removeFromArray('About', $index)">×</button>
          </div>
        }
        <button class="add-button" (click)="addToArray('About')">+ Add About</button>
      </div>

      <div class="form-group">
        <h3>Websites</h3>
        @for (website of profile.Website || ['']; track $index) {
          <div class="array-input">
            <input type="url" [(ngModel)]="profile.Website![$index]" placeholder="https://">
            <button (click)="removeFromArray('Website', $index)">×</button>
          </div>
        }
        <button class="add-button" (click)="addToArray('Website')">+ Add Website</button>
      </div>

      <div class="actions">
        <button class="generate-button" (click)="generateTransaction()">Generate Transaction</button>
      </div>

      @if (transaction) {
        <div class="transaction-output">
          <h3>Generated Transaction</h3>
          <pre>{{ transaction }}</pre>
          <p class="help-text">
            Copy this transaction and sign it using your Stellar wallet to update your profile.
          </p>
        </div>
      }
    </div>
  `,
  styles: [`
    .edit-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .form-group {
      margin-bottom: 2rem;
    }

    .array-input {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }

    .array-input input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .array-input button {
      padding: 8px 12px;
      background: #ff4444;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .add-button {
      padding: 8px 16px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 8px;
    }

    .actions {
      margin-top: 2rem;
    }

    .generate-button {
      padding: 12px 24px;
      background: #764ba2;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1.1rem;
    }

    .transaction-output {
      margin-top: 2rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .transaction-output pre {
      background: #fff;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }

    .help-text {
      color: #666;
      font-style: italic;
      margin-top: 1rem;
    }
  `]
})
export class ProfileEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataService = inject(DataService);

  address = '';
  profile: Profile = {};
  transaction = '';

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.address = params.get('address') || '';
      const data = this.dataService.data();
      if (data?.accounts?.[this.address]?.profile) {
        this.profile = JSON.parse(JSON.stringify(data.accounts[this.address].profile));
      }
      // Initialize empty arrays if they don't exist
      this.profile.Name = this.profile.Name || [''];
      this.profile.About = this.profile.About || [''];
      this.profile.Website = this.profile.Website || [''];
    });
  }

  addToArray(field: keyof Profile) {
    if (!this.profile[field]) {
      this.profile[field] = [];
    }
    (this.profile[field] as string[]).push('');
  }

  removeFromArray(field: keyof Profile, index: number) {
    if (this.profile[field] && this.profile[field]!.length > 1) {
      this.profile[field]!.splice(index, 1);
    }
  }

  generateTransaction() {
    // Clean up empty values
    Object.keys(this.profile).forEach(key => {
      const field = key as keyof Profile;
      this.profile[field] = this.profile[field]?.filter(value => value.trim() !== '');
      if (this.profile[field]?.length === 0) {
        delete this.profile[field];
      }
    });

    // Create a Stellar transaction (example format)
    const transaction = {
      type: 'manageData',
      source: this.address,
      data: {
        profile: JSON.stringify(this.profile)
      }
    };

    this.transaction = JSON.stringify(transaction, null, 2);
  }
}
