import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';

interface TagStats {
  name: string;
  count: number;
}

@Component({
  selector: 'app-tags',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tags-container">
      <h2>Tag Statistics</h2>
      <div class="tags-grid">
        @for (tag of tagStats; track tag.name) {
          <div class="tag-card">
            <div class="tag-name">{{ tag.name }}</div>
            <div class="tag-count">{{ tag.count }} instances</div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .tags-container {
      padding: 20px;
    }
    .tags-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }
    .tag-card {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    .tag-name {
      font-weight: bold;
      margin-bottom: 8px;
    }
    .tag-count {
      color: #666;
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
