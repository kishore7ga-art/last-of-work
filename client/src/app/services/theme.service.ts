import { Injectable, computed, signal, inject, Injector } from '@angular/core';
import { AutoSaveService } from './auto-save.service';
import { THEMES, SiteTheme, ThemeCategory, GOOGLE_FONT_OPTIONS } from '../data/themes.data';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'builder_active_theme_id';

  readonly themes = THEMES;
  readonly fontOptions = GOOGLE_FONT_OPTIONS;

  activeTheme = signal<SiteTheme>(THEMES[0]);
  customTheme = signal<SiteTheme | null>(null);
  selectedCategory = signal<ThemeCategory | 'all'>('all');
  isPreviewing = signal(false);
  
  private injector = inject(Injector);

  private get autoSave(): AutoSaveService {
    return this.injector.get(AutoSaveService);
  }

  /** Themes filtered by current category pill */
  filteredThemes = computed(() => {
    const cat = this.selectedCategory();
    return cat === 'all' ? this.themes : this.themes.filter(t => t.category === cat);
  });

  /** Is the currently active theme a custom one? */
  isCustomActive = computed(() => this.activeTheme().id === 'custom');

  // ── Public API ──────────────────────────────────────────────────────────────

  /** Permanently apply a preset theme */
  applyTheme(theme: SiteTheme, triggerSave = true): void {
    this.activeTheme.set(theme);
    this.applyCSSVariables(theme);
    this.loadGoogleFonts(theme);
    try { localStorage.setItem(this.STORAGE_KEY, theme.id); } catch (_) {}
    
    if (triggerSave) {
      try {
        this.autoSave.triggerSave('theme-changed');
      } catch(e) {}
    }
  }

  /** Temporarily apply theme for hover-preview; does NOT persist */
  previewTheme(theme: SiteTheme): void {
    this.isPreviewing.set(true);
    this.applyCSSVariables(theme);
    this.loadGoogleFonts(theme);
  }

  /** Restore the real active theme after hover-preview ends */
  cancelPreview(): void {
    if (!this.isPreviewing()) return;
    this.isPreviewing.set(false);
    this.applyCSSVariables(this.activeTheme());
    this.loadGoogleFonts(this.activeTheme());
  }

  /** Apply a fully custom theme object */
  applyCustomTheme(theme: SiteTheme, triggerSave = true): void {
    const custom: SiteTheme = { ...theme, id: 'custom', name: 'Custom', category: theme.category };
    this.customTheme.set(custom);
    this.activeTheme.set(custom);
    this.applyCSSVariables(custom);
    this.loadGoogleFonts(custom);
    try { localStorage.setItem(this.STORAGE_KEY, 'custom'); } catch (_) {}
    
    if (triggerSave) {
      try {
        this.autoSave.triggerSave('theme-changed');
      } catch(e) {}
    }
  }

  /** Call once on app init — restores persisted theme */
  loadSavedTheme(): void {
    try {
      const savedId = localStorage.getItem(this.STORAGE_KEY);
      if (savedId) {
        const found = this.themes.find(t => t.id === savedId);
        if (found) { this.applyTheme(found, false); return; }
      }
    } catch (_) {}
    this.applyTheme(THEMES[0], false);
  }

  /** Returns the theme the builder should save alongside the page */
  getThemeForSave(): { themeId: string; customTheme: SiteTheme | null } {
    return {
      themeId: this.activeTheme().id,
      customTheme: this.activeTheme().id === 'custom' ? this.activeTheme() : null
    };
  }

  /** Restore a theme that was loaded with a page from the server */
  restoreFromPage(themeId: string | undefined, customTheme: SiteTheme | null | undefined): void {
    if (!themeId) { this.loadSavedTheme(); return; }
    if (themeId === 'custom' && customTheme) {
      this.applyCustomTheme(customTheme, false);
      return;
    }
    const found = this.themes.find(t => t.id === themeId);
    if (found) { this.applyTheme(found, false); return; }
    this.loadSavedTheme();
  }

  getThemeById(id: string): SiteTheme | undefined {
    return this.themes.find(t => t.id === id);
  }

  /** Create a custom SiteTheme by merging partial overrides onto a base */
  createCustomTheme(
    base: SiteTheme,
    colorOverrides: Partial<SiteTheme['colors']>,
    fontOverrides: Partial<SiteTheme['fonts']>,
    radiusOverrides: Partial<SiteTheme['borderRadius']>
  ): SiteTheme {
    return {
      ...base,
      id: 'custom',
      name: 'Custom',
      colors: { ...base.colors, ...colorOverrides },
      fonts: { ...base.fonts, ...fontOverrides },
      borderRadius: { ...base.borderRadius, ...radiusOverrides }
    };
  }

  /** Export a theme as a JSON string for download */
  exportThemeAsJson(theme: SiteTheme): string {
    return JSON.stringify(theme, null, 2);
  }

  /** Generate :root CSS variable block (used in HTML export) */
  generateThemeCSS(theme: SiteTheme): string {
    const fonts = [...new Set([theme.fonts.heading, theme.fonts.body])]
      .map(f => f.replace(/ /g, '+'))
      .join('&family=');

    return `
@import url('https://fonts.googleapis.com/css2?family=${fonts}:wght@400;600;700;800&display=swap');

:root {
  --theme-primary: ${theme.colors.primary};
  --theme-primary-hover: ${theme.colors.primaryHover};
  --theme-primary-light: ${theme.colors.primaryLight};
  --theme-secondary: ${theme.colors.secondary};
  --theme-accent: ${theme.colors.accent};
  --theme-bg: ${theme.colors.background};
  --theme-surface: ${theme.colors.surface};
  --theme-surface-hover: ${theme.colors.surfaceHover};
  --theme-text: ${theme.colors.text};
  --theme-text-muted: ${theme.colors.textMuted};
  --theme-text-light: ${theme.colors.textLight};
  --theme-border: ${theme.colors.border};
  --theme-border-light: ${theme.colors.borderLight};
  --theme-button-text: ${theme.colors.buttonText};
  --theme-success: ${theme.colors.success};
  --theme-error: ${theme.colors.error};
  --theme-warning: ${theme.colors.warning};
  --theme-font-heading: '${theme.fonts.heading}', sans-serif;
  --theme-font-body: '${theme.fonts.body}', sans-serif;
  --theme-font-mono: ${theme.fonts.mono};
  --theme-font-size: ${theme.fonts.baseSize};
  --theme-heading-weight: ${theme.fonts.headingWeight};
  --theme-radius-sm: ${theme.borderRadius.small};
  --theme-radius-md: ${theme.borderRadius.medium};
  --theme-radius-lg: ${theme.borderRadius.large};
  --theme-radius-full: ${theme.borderRadius.full};
  --theme-radius-btn: ${theme.borderRadius.button};
  --theme-radius-card: ${theme.borderRadius.card};
  --theme-shadow-sm: ${theme.shadows.small};
  --theme-shadow-md: ${theme.shadows.medium};
  --theme-shadow-lg: ${theme.shadows.large};
  --theme-shadow-btn: ${theme.shadows.button};
  --theme-shadow-card: ${theme.shadows.card};
}

body {
  font-family: var(--theme-font-body);
  background-color: var(--theme-bg);
  color: var(--theme-text);
  font-size: var(--theme-font-size);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--theme-font-heading);
  font-weight: var(--theme-heading-weight);
  color: var(--theme-text);
}

a { color: var(--theme-primary); }
`.trim();
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  applyCSSVariables(theme: SiteTheme): void {
    const r = document.documentElement;
    const s = (k: string, v: string) => r.style.setProperty(k, v);

    // Colors
    s('--theme-primary', theme.colors.primary);
    s('--theme-primary-hover', theme.colors.primaryHover);
    s('--theme-primary-light', theme.colors.primaryLight);
    s('--theme-secondary', theme.colors.secondary);
    s('--theme-accent', theme.colors.accent);
    s('--theme-bg', theme.colors.background);
    s('--theme-surface', theme.colors.surface);
    s('--theme-surface-hover', theme.colors.surfaceHover);
    s('--theme-text', theme.colors.text);
    s('--theme-text-muted', theme.colors.textMuted);
    s('--theme-text-light', theme.colors.textLight);
    s('--theme-border', theme.colors.border);
    s('--theme-border-light', theme.colors.borderLight);
    s('--theme-button-text', theme.colors.buttonText);
    s('--theme-success', theme.colors.success);
    s('--theme-error', theme.colors.error);
    s('--theme-warning', theme.colors.warning);

    // Fonts
    s('--theme-font-heading', `'${theme.fonts.heading}', sans-serif`);
    s('--theme-font-body', `'${theme.fonts.body}', sans-serif`);
    s('--theme-font-mono', theme.fonts.mono);
    s('--theme-font-size', theme.fonts.baseSize);
    s('--theme-heading-weight', theme.fonts.headingWeight);

    // Border radius
    s('--theme-radius-sm', theme.borderRadius.small);
    s('--theme-radius-md', theme.borderRadius.medium);
    s('--theme-radius-lg', theme.borderRadius.large);
    s('--theme-radius-full', theme.borderRadius.full);
    s('--theme-radius-btn', theme.borderRadius.button);
    s('--theme-radius-card', theme.borderRadius.card);

    // Shadows
    s('--theme-shadow-sm', theme.shadows.small);
    s('--theme-shadow-md', theme.shadows.medium);
    s('--theme-shadow-lg', theme.shadows.large);
    s('--theme-shadow-btn', theme.shadows.button);
    s('--theme-shadow-card', theme.shadows.card);
  }

  loadGoogleFonts(theme: SiteTheme): void {
    // Remove old theme font links
    document.querySelectorAll('link[data-theme-font]').forEach(el => el.remove());

    const fonts = [...new Set([theme.fonts.heading, theme.fonts.body])]
      .filter(f => !f.startsWith('ui-') && !f.includes('monospace'))
      .map(f => f.replace(/ /g, '+'));

    if (!fonts.length) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.setAttribute('data-theme-font', 'true');
    link.href = `https://fonts.googleapis.com/css2?family=${fonts.map(f => f + ':wght@400;600;700;800').join('&family=')}&display=swap`;
    document.head.appendChild(link);
  }
}
// catchError

