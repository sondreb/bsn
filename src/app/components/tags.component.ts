import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';
import { RouterLink } from '@angular/router';

interface TagStats {
  name: string;
  count: number;
}

@Component({
    selector: 'app-tags',
    imports: [CommonModule, RouterLink],
    template: `
    <div class="tags-container">
      <h2>Tags Overview</h2>
      <div class="tags-grid">
        @for (tag of tagStats; track tag.name) {
          <a [routerLink]="['/tags', tag.name]" class="tag-card">
            <div class="tag-name">{{ tag.name }}</div>
            <div class="tag-count">Used {{ tag.count }} times</div>
          </a>
        }
      </div>
    </div>
  `,
    styles: [`
    .tags-container {
      padding: 20px;
    }

    h2 {
      color: var(--text-primary);
      margin-bottom: 1.5rem;
    }

    .tags-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
    }
    .tag-card {
      background: var(--card-bg);
      padding: 20px;
      border-radius: var(--border-radius-md);
      text-align: center;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
      transition: all var(--transition-duration) ease;
      border: 1px solid var(--border-color-light);
      box-shadow: var(--card-shadow);
    }
    .tag-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--card-shadow-hover);
      border-color: var(--accent-color);
    }
    .tag-name {
      font-weight: 700;
      margin-bottom: 8px;
      color: var(--text-primary);
      font-size: 1.1em;
    }
    .tag-count {
      color: var(--text-secondary);
      font-size: 0.9em;
    }
  `]
})
export class TagsComponent implements OnInit {
  dataService = inject(DataService);
  tagStats: TagStats[] = [];

  ngOnInit() {
    const data = this.dataService.data();
    if (!data?.accounts) return;

    const tagCounts = new Map<string, number>();

    // Count instances of each tag
    Object.values(data.accounts).forEach(account => {
      if (account.tags) {
        Object.keys(account.tags).forEach(tag => {
          const count = tagCounts.get(tag) || 0;
          tagCounts.set(tag, count + 1);
        });
      }
    });

    // Convert to array and sort by count (descending)
    this.tagStats = Array.from(tagCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }
}
