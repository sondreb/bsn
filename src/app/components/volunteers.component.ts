import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';
import { AddressPipe } from '../pipes/address.pipe';

@Component({
  selector: 'app-volunteers',
  standalone: true,
  imports: [CommonModule, AddressPipe],
  template: `
    <div class="volunteers-container">
      <h2>Volunteer Programs</h2>
      <div class="volunteer-list">
        @for (item of volunteerList; track item.address) {
          <div class="volunteer-item">
            <span class="address">{{ item.address | address }}</span>
            @if (item.name) {
              <span class="name">[{{ item.name }}]</span>
            }
            <span class="count">({{ item.count }} volunteers)</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .volunteers-container {
      padding: 20px;
    }
    .volunteer-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .volunteer-item {
      padding: 10px;
      background: #f5f5f5;
      border-radius: 4px;
    }
    .name {
      margin-left: 8px;
      color: #666;
    }
    .count {
      margin-left: 8px;
      color: #007bff;
    }
  `]
})
export class VolunteersComponent implements OnInit {
  dataService = inject(DataService);
  volunteerList: Array<{address: string, name?: string, count: number}> = [];

  async ngOnInit() {
    const data = await this.dataService.getData();
    if (!data?.accounts) return;

    const volunteers = new Map<string, number>();
    
    // Collect all volunteer addresses and their counts
    Object.values(data.accounts).forEach(account => {
      if (account.tags?.IAmVolunteerFor) {
        account.tags.IAmVolunteerFor.forEach((address: string) => {
          volunteers.set(address, (volunteers.get(address) || 0) + 1);
        });
      }
    });

    // Convert to array and add names where available
    this.volunteerList = Array.from(volunteers.entries()).map(([address, count]) => {
      const accountData = Object.entries(data.accounts).find(([addr]) => addr === address);
      return {
        address,
        name: accountData?.[1].profile?.Name?.[0],
        count
      };
    }).sort((a, b) => b.count - a.count);
  }
}
