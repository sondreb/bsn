import { Injectable, signal, computed, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Signal for the current theme
  private themeSignal = signal<'light' | 'dark'>('light');
  
  // Computed value that determines if dark mode is active
  public isDarkMode = computed(() => this.themeSignal() === 'dark');
  
  constructor() {
    // Check for user's system preference on initialization
    this.detectPreferredTheme();
    
    // Apply the theme immediately when service is initialized
    effect(() => {
      this.applyTheme(this.themeSignal());
    });
    
    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!this.hasUserPreference()) {
        this.themeSignal.set(e.matches ? 'dark' : 'light');
      }
    });
  }

  /**
   * Initialize theme based on stored preference or system preference
   */
  private detectPreferredTheme(): void {
    // Check if theme preference exists in localStorage
    const storedTheme = localStorage.getItem('theme-preference');
    
    if (storedTheme) {
      // Use stored preference if available
      this.themeSignal.set(storedTheme as 'light' | 'dark');
    } else {
      // Otherwise use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.themeSignal.set(prefersDark ? 'dark' : 'light');
    }
  }
  
  /**
   * Toggle between light and dark themes
   */
  public toggleTheme(): void {
    const newTheme = this.themeSignal() === 'light' ? 'dark' : 'light';
    this.themeSignal.set(newTheme);
    localStorage.setItem('theme-preference', newTheme);
  }
  
  /**
   * Get the current theme value
   */
  public getCurrentTheme(): 'light' | 'dark' {
    return this.themeSignal();
  }
  
  /**
   * Check if user has explicitly set a theme preference
   */
  private hasUserPreference(): boolean {
    return localStorage.getItem('theme-preference') !== null;
  }
  
  /**
   * Apply the selected theme to the document
   */
  private applyTheme(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Also update meta theme-color for PWA
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? '#121212' : '#ffffff'
      );
    }
  }
}