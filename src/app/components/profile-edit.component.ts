import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { Profile } from '../interfaces/profile.interface';
import { AddressPipe } from '../pipes/address.pipe';
import * as StellarSdk from '@stellar/stellar-sdk';

@Component({
    selector: 'app-profile-edit',
    imports: [CommonModule, FormsModule, AddressPipe],
    template: `
    <div class="edit-container">
      <h2>Edit Profile for {{ address | address }}</h2>

      <div class="form-group">
        <h3>Names</h3>
        @for (name of profile.Name || ['']; track $index) {
        <div class="array-input">
          <input
            type="text"
            [(ngModel)]="profile.Name![$index]"
            placeholder="Name"
          />
          <button (click)="removeFromArray('Name', $index)">×</button>
        </div>
        }
        <button class="add-button" (click)="addToArray('Name')">
          + Add Name
        </button>
      </div>

      <div class="form-group">
        <h3>About</h3>
        @for (about of profile.About || ['']; track $index) {
        <div class="array-input">
          <input
            type="text"
            [(ngModel)]="profile.About![$index]"
            placeholder="About"
          />
          <button (click)="removeFromArray('About', $index)">×</button>
        </div>
        }
        <button class="add-button" (click)="addToArray('About')">
          + Add About
        </button>
      </div>

      <div class="form-group">
        <h3>Websites</h3>
        @for (website of profile.Website || ['']; track $index) {
        <div class="array-input">
          <input
            type="url"
            [(ngModel)]="profile.Website![$index]"
            placeholder="https://"
          />
          <button (click)="removeFromArray('Website', $index)">×</button>
        </div>
        }
        <button class="add-button" (click)="addToArray('Website')">
          + Add Website
        </button>
      </div>

      <div class="form-group">
        <h3>Network</h3>
        <select [(ngModel)]="selectedNetwork" class="network-select">
          <option value="TESTNET">Testnet</option>
          <option value="PUBLIC">Public Network</option>
        </select>
      </div>

      <div class="actions">
        <button class="generate-button" (click)="generateTransaction()">
          Generate Transaction
        </button>
      </div>

      @if (transaction) {
      <div class="transaction-output">
        <h3>Generated Transaction</h3>
        <div class="xdr-container">
          <pre>{{ transaction }}</pre>
          <button class="copy-button" (click)="copyToClipboard()">
            {{ copied ? 'Copied!' : 'Copy XDR' }}
          </button>
        </div>
        <p class="help-text">
          This is a Stellar transaction in XDR format. Copy it and sign it using
          your preferred Stellar wallet.
        </p>
      </div>
      }
    </div>
  `,
    styles: [
        `
      .edit-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }

      h2, h3 {
        color: var(--text-primary);
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
        padding: 10px 12px;
        border: 2px solid var(--input-border);
        border-radius: var(--border-radius-sm);
        font-size: 1rem;
        background: var(--input-bg);
        color: var(--text-primary);
        transition: all var(--transition-duration) ease;
      }

      .array-input input:focus {
        outline: none;
        border-color: var(--input-border-focus);
        box-shadow: 0 2px 8px var(--accent-light);
      }

      .array-input input::placeholder {
        color: var(--text-tertiary);
      }

      .array-input button {
        padding: 8px 12px;
        background: #ff4444;
        color: white;
        border: none;
        border-radius: var(--border-radius-sm);
        cursor: pointer;
        transition: all var(--transition-duration) ease;
      }

      .array-input button:hover {
        background: #cc0000;
        transform: scale(1.05);
      }

      .add-button {
        padding: 10px 18px;
        background: #4caf50;
        color: white;
        border: none;
        border-radius: var(--border-radius-sm);
        cursor: pointer;
        margin-top: 8px;
        transition: all var(--transition-duration) ease;
        box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
      }

      .add-button:hover {
        background: #45a049;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
      }

      .actions {
        margin-top: 2rem;
      }

      .generate-button {
        padding: 14px 28px;
        background: var(--accent-gradient);
        color: white;
        border: none;
        border-radius: var(--border-radius-sm);
        cursor: pointer;
        font-size: 1.1rem;
        font-weight: 600;
        transition: all var(--transition-duration) ease;
        box-shadow: 0 4px 12px var(--accent-light);
      }

      .generate-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px var(--accent-light);
      }

      .transaction-output {
        margin-top: 2rem;
        padding: 1.5rem;
        background: var(--card-bg-secondary);
        border-radius: var(--border-radius-md);
        border: 1px solid var(--border-color-light);
      }

      .transaction-output h3 {
        margin-top: 0;
      }

      .transaction-output pre {
        background: var(--card-bg);
        padding: 1rem;
        border-radius: var(--border-radius-sm);
        overflow-x: auto;
        color: var(--text-primary);
        border: 1px solid var(--border-color-light);
      }

      .help-text {
        color: var(--text-secondary);
        font-style: italic;
        margin-top: 1rem;
        line-height: 1.6;
      }

      .network-select {
        padding: 10px 12px;
        border: 2px solid var(--input-border);
        border-radius: var(--border-radius-sm);
        font-size: 1rem;
        margin-top: 8px;
        width: 220px;
        background: var(--input-bg);
        color: var(--text-primary);
        cursor: pointer;
        transition: all var(--transition-duration) ease;
      }

      .network-select:focus {
        outline: none;
        border-color: var(--input-border-focus);
        box-shadow: 0 2px 8px var(--accent-light);
      }

      .xdr-container {
        position: relative;
        background: var(--card-bg-tertiary);
        padding: 1rem;
        border-radius: var(--border-radius-sm);
        margin: 1rem 0;
        border: 1px solid var(--border-color-light);
      }

      .xdr-container pre {
        color: var(--text-primary);
        overflow-x: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
        margin: 0;
        padding-right: 100px;
        font-family: 'Monaco', 'Consolas', monospace;
      }

      .copy-button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        padding: 8px 16px;
        background: var(--accent-gradient);
        color: white;
        border: none;
        border-radius: var(--border-radius-sm);
        cursor: pointer;
        transition: all var(--transition-duration) ease;
        box-shadow: 0 2px 8px var(--accent-light);
      }

      .copy-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px var(--accent-light);
      }
    `,
    ]
})
export class ProfileEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataService = inject(DataService);

  address = '';
  profile: Profile = {};
  selectedNetwork = 'TESTNET';
  transaction = '';
  copied = false;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.address = params.get('address') || '';
      const data = this.dataService.data();
      if (data?.accounts?.[this.address]?.profile) {
        this.profile = JSON.parse(
          JSON.stringify(data.accounts[this.address].profile)
        );
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

  async generateTransaction() {
    // Clean up empty values
    Object.keys(this.profile).forEach((key) => {
      const field = key as keyof Profile;
      this.profile[field] = this.profile[field]?.filter(
        (value) => value.trim() !== ''
      );
      if (this.profile[field]?.length === 0) {
        delete this.profile[field];
      }
    });

    try {
      // Select network
      const network =
        this.selectedNetwork === 'TESTNET'
          ? StellarSdk.Networks.TESTNET
          : StellarSdk.Networks.PUBLIC;

      // Create a server object
      const server = new StellarSdk.Horizon.Server(
        this.selectedNetwork === 'TESTNET'
          ? 'https://horizon-testnet.stellar.org'
          : 'https://horizon.stellar.org'
      );

      // Get account sequence number
      const account = await server.loadAccount(this.address);

      // Start building the transaction
      const fee: string = (await server.fetchBaseFee()).toString();
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: fee,
        networkPassphrase: network,
      });

      // Convert profile to manageDatum operations
      const profileStr = JSON.stringify(this.profile);
      const encoder = new TextEncoder();
      const profileData = encoder.encode(profileStr);

      // Split data into chunks if needed (Stellar has a 64-byte limit per ManageData entry)
      const chunkSize = 64;
      const chunks = [];
      for (let i = 0; i < profileData.length; i += chunkSize) {
        chunks.push(profileData.slice(i, i + chunkSize));
      }

      // Add clear existing profile data operation
      transaction.addOperation(
        StellarSdk.Operation.manageData({
          name: 'profile_clear',
          value: new Uint8Array([1]) as any,
        })
      );

      // Add operations for each chunk
      chunks.forEach((chunk: any, index) => {
        transaction.addOperation(
          StellarSdk.Operation.manageData({
            name: `profile_${index}`,
            value: chunk, // chunk is already a Uint8Array from TextEncoder
          })
        );
      });

      // Set relatively short timeout
      transaction.setTimeout(30);

      // Build transaction
      const builtTx = transaction.build();

      // Get XDR
      this.transaction = builtTx.toXDR();
    } catch (error) {
      console.error('Error generating transaction:', error);
      this.transaction = 'Error generating transaction. Please try again.';
    }
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.transaction).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }
}
