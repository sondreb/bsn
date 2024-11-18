import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  calculateRating(account: any): number {
    if (!account) return 0;
    
    let rating = 0;
    
    // Base points for having tags
    const tagCount = Object.keys(account.tags || {}).length;
    rating += Math.min(tagCount * 10, 40); // Up to 40 points for tags
    
    // Points for profile completeness
    if (account.profile) {
      if (account.profile.Name?.length > 0) {
        rating += 20; // 20 points for having a name
      }
      
      if (account.profile.About?.length > 0) {
        rating += 20; // 20 points for having an about section
      }
      
      if (account.profile.Website?.length > 0) {
        rating += 20; // 20 points for having website(s)
      }
    }
    
    // Cap at 100
    return Math.min(rating, 100);
  }
}
