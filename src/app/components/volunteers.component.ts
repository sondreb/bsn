import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';
import { AddressPipe } from '../pipes/address.pipe';

interface VolunteerProgram {
  address: string;
  name?: string;
  count: number;
  volunteers: Array<{
    address: string;
    name?: string;
  }>;
  isExpanded?: boolean;
}

@Component({
  selector: 'app-volunteers',
  standalone: true,
  imports: [CommonModule, AddressPipe],
  template: `
    <div class="volunteers-container">
      <h2>Volunteer Programs</h2>
      <div class="volunteer-list">
        @for (program of volunteerList; track program.address) {
          <div class="volunteer-item">
            <div class="program-header" (click)="program.isExpanded = !program.isExpanded">
              <div class="program-info">
                <span class="address">{{ program.address | address }}</span>
                @if (program.name) {
                  <span class="name">[{{ program.name }}]</span>
                }
                <span class="count">({{ program.count }} volunteers)</span>
              </div>
              <span class="expand-icon">{{ program.isExpanded ? '▼' : '▶' }}</span>
            </div>

            @if (program.isExpanded) {
              <div class="volunteers-detail">
                @for (volunteer of program.volunteers; track volunteer.address) {
                  <div class="volunteer-entry">
                    <span class="address">{{ volunteer.address | address }}</span>
                    @if (volunteer.name) {
                      <span class="name">[{{ volunteer.name }}]</span>
                    }
                  </div>
                }
              </div>
            }
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
      background: #f5f5f5;
      border-radius: 4px;
      overflow: hidden;
    }
    .program-header {
      padding: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      user-select: none;
      transition: background-color 0.2s;
    }
    .program-header:hover {
      background: #e8e8e8;
    }
    .program-info {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .name {
      color: #666;
    }
    .count {
      color: #007bff;
    }
    .expand-icon {
      color: #666;
      font-size: 0.8em;
    }
    .volunteers-detail {
      padding: 10px;
      background: white;
      border-top: 1px solid #eee;
    }
    .volunteer-entry {
      padding: 6px 10px;
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .volunteer-entry:hover {
      background: #f8f8f8;
    }
  `]
})
export class VolunteersComponent implements OnInit {
  dataService = inject(DataService);
  volunteerList: VolunteerProgram[] = [];

  async ngOnInit() {
    const data = await this.dataService.getData();
    if (!data?.accounts) return;

    const volunteers = new Map<string, Set<string>>();
    const accountsMap = new Map(Object.entries(data.accounts));
    
    // Collect all volunteer addresses and their programs
    Object.entries(data.accounts).forEach(([address, account]) => {
      if (account.tags?.IAmVolunteerFor) {
        account.tags.IAmVolunteerFor.forEach((programAddress: string) => {
          if (!volunteers.has(programAddress)) {
            volunteers.set(programAddress, new Set());
          }
          volunteers.get(programAddress)?.add(address);
        });
      }
    });

    // Convert to array with names and sorted by volunteer count
    this.volunteerList = Array.from(volunteers.entries())
      .map(([address, volunteerSet]) => ({
        address,
        name: accountsMap.get(address)?.profile?.Name?.[0],
        count: volunteerSet.size,
        volunteers: Array.from(volunteerSet).map(volunteerAddress => ({
          address: volunteerAddress,
          name: accountsMap.get(volunteerAddress)?.profile?.Name?.[0]
        })),
        isExpanded: false
      }))
      .sort((a, b) => b.count - a.count);
  }
}
