import { Injectable, inject } from '@angular/core';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class RatingService {
  private dataService = inject(DataService);

  calculateRating(account: any): number {
    if (!account) return 0;

    let rating = 0;

    // Base score for having a profile
    if (account.profile) {
      rating += 10;

      // Additional points for profile completeness
      if (account.profile.Name?.[0]) rating += 10;
      if (account.profile.About?.[0]) rating += 10;
      if (account.profile.Website?.length) rating += 10;
    }

    // Points for giving tags (being active in the network)
    const givenTags = Object.keys(account.tags || {}).length;
    rating += Math.min(givenTags * 5, 30); // Max 30 points for giving tags

    // Points for receiving tags (being recognized by others)
    const receivedTags = this.countReceivedTags(account);
    rating += Math.min(receivedTags * 10, 30); // Max 30 points for received tags

    return Math.min(rating, 100); // Cap at 100
  }

  private countReceivedTags(account: any): number {
    let count = 0;
    const data = this.dataService.data();
    const accountAddress = Object.entries(data?.accounts || {})
      .find(([_, acc]) => acc === account)?.[0];

    if (!accountAddress || !data?.accounts) return 0;

    // Count tags received from other accounts
    for (const [fromAddress, accountData] of Object.entries(data.accounts)) {
      if (fromAddress === accountAddress || !accountData.tags) continue;

      for (const values of Object.values(accountData.tags)) {
        if (Array.isArray(values) && values.includes(accountAddress)) {
          count++;
        }
      }
    }

    return count;
  }
}
