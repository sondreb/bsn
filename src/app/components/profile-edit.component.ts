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
        background: #4caf50;
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

      .network-select {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        margin-top: 8px;
        width: 200px;
      }

      .xdr-container {
        position: relative;
        background: #1e1e1e;
        padding: 1rem;
        border-radius: 4px;
        margin: 1rem 0;
      }

      .xdr-container pre {
        color: #fff;
        overflow-x: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
        margin: 0;
        padding-right: 100px;
      }

      .copy-button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        padding: 8px 16px;
        background: #764ba2;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .copy-button:hover {
        background: #653991;
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
