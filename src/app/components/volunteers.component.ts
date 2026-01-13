import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';
import { AddressPipe } from '../pipes/address.pipe';
import { RouterLink } from '@angular/router';

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
    imports: [CommonModule, AddressPipe, RouterLink],
    template: `
    <div class="volunteers-container">
      <h2>Volunteer Programs</h2>
      <div class="volunteer-list">
        @for (program of volunteerList; track program.address) {
        <div class="volunteer-item">
          <div
            class="program-header"
            (click)="program.isExpanded = !program.isExpanded"
          >
            <div class="program-info">
              <span class="address">{{ program.address | address }}</span>
              @if (program.name) {
              <span class="name">[{{ program.name }}]</span>
              }
              <span class="count">({{ program.count }} volunteers)</span>
            </div>
            <span class="expand-icon">{{
              program.isExpanded ? '▼' : '▶'
            }}</span>
          </div>

          @if (program.isExpanded) {
          <div class="volunteers-detail">
            @for (volunteer of program.volunteers; track volunteer.address) {
            <div class="volunteer-entry">
              <a
                [routerLink]="['/accounts', volunteer.address]"
                class="volunteer-link"
              >
                <span class="address">{{ volunteer.address | address }}</span>
                @if (volunteer.name) {
                <span class="name">[{{ volunteer.name }}]</span>
                }
              </a>
            </div>
            }
          </div>
          }
        </div>
        }
      </div>
    </div>
  `,
    styles: [
        `
      .volunteers-container {
        padding: 20px;
      }

      h2 {
        color: var(--text-primary);
        margin-bottom: 1.5rem;
      }

      .volunteer-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .volunteer-item {
        background: var(--card-bg);
        border-radius: var(--border-radius-md);
        overflow: hidden;
        border: 1px solid var(--border-color-light);
        box-shadow: var(--card-shadow);
        transition: all var(--transition-duration) ease;
      }

      .volunteer-item:hover {
        box-shadow: var(--card-shadow-hover);
        border-color: var(--accent-color);
      }

      .program-header {
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        user-select: none;
        transition: all var(--transition-duration) ease;
        background: var(--card-bg-secondary);
      }
      .program-header:hover {
        background: var(--hover-bg);
      }
      .program-info {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
      }

      .address {
        color: var(--text-primary);
        font-family: monospace;
      }

      .name {
        color: var(--text-secondary);
        font-size: 0.9em;
      }
      .count {
        color: var(--accent-color);
        font-weight: 600;
      }
      .expand-icon {
        color: var(--text-secondary);
        font-size: 0.9em;
        transition: transform var(--transition-duration) ease;
      }
      .volunteers-detail {
        padding: 12px 16px;
        background: var(--card-bg);
        border-top: 1px solid var(--border-color-light);
      }
      .volunteer-entry {
        padding: 6px 10px;
        display: flex;
        gap: 8px;
        align-items: center;
        border-radius: var(--border-radius-sm);
        transition: background var(--transition-duration) ease;
      }
      .volunteer-entry:hover {
        background: var(--hover-bg);
      }
      .volunteer-link {
        text-decoration: none;
        color: var(--text-primary);
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 6px 10px;
        border-radius: var(--border-radius-sm);
        transition: all var(--transition-duration) ease;
        width: 100%;
      }
      .volunteer-link:hover {
        background: var(--hover-bg);
        transform: translateX(4px);
      }
    `,
    ]
})
export class VolunteersComponent implements OnInit {
  dataService = inject(DataService);
  volunteerList: VolunteerProgram[] = [];

  async ngOnInit() {
    const data = this.dataService.data();
    if (!data?.accounts) return;

    const volunteers = new Map<string, Set<string>>();
    const accountsMap = new Map<string, any>(Object.entries(data.accounts));

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
        volunteers: Array.from(volunteerSet).map((volunteerAddress) => ({
          address: volunteerAddress,
          name: accountsMap.get(volunteerAddress)?.profile?.Name?.[0],
        })),
        isExpanded: false,
      }))
      .sort((a, b) => b.count - a.count);
  }
}
