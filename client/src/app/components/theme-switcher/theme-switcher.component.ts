import {
  Component, inject, ChangeDetectionStrategy, signal, computed, Output, EventEmitter, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ThemeService } from '../../services/theme.service';
import { ToastService } from '../../services/toast.service';
import { SiteTheme, THEME_CATEGORIES, GOOGLE_FONT_OPTIONS } from '../../data/themes.data';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Backdrop -->
    <div class="ts-backdrop" (click)="close.emit()"></div>

    <!-- Panel -->
    <aside class="ts-panel animate-slide-in">

      <!-- Header -->
      <div class="ts-header">
        <div class="ts-header-left">
          <lucide-icon name="palette" [size]="18" class="ts-header-icon"></lucide-icon>
          <span>Themes</span>
        </div>
        <button class="ts-close-btn" (click)="close.emit()">
          <lucide-icon name="x" [size]="18"></lucide-icon>
        </button>
      </div>

      <!-- Active Theme Indicator -->
      <div class="ts-active-bar">
        <div class="ts-active-dot" [style.background]="themeService.activeTheme().colors.primary"></div>
        <span class="ts-active-label">Active:</span>
        <span class="ts-active-name">{{ themeService.activeTheme().name }}</span>
        <span *ngIf="themeService.isCustomActive()" class="ts-custom-badge">Custom</span>
      </div>

      <!-- Tab bar -->
      <div class="ts-tabs">
        <button [class.active]="activeTab() === 'presets'" (click)="activeTab.set('presets')">
          <lucide-icon name="layout-grid" [size]="13"></lucide-icon> Presets
        </button>
        <button [class.active]="activeTab() === 'custom'" (click)="activeTab.set('custom')">
          <lucide-icon name="sliders-horizontal" [size]="13"></lucide-icon> Custom
        </button>
      </div>

      <!-- ── PRESETS TAB ─────────────────────────────────────── -->
      <ng-container *ngIf="activeTab() === 'presets'">
        <!-- Category pills -->
        <div class="ts-cat-row">
          <button
            *ngFor="let cat of categories"
            class="ts-cat-pill"
            [class.active]="themeService.selectedCategory() === cat.value"
            (click)="themeService.selectedCategory.set(cat.value)">
            {{ cat.label }}
          </button>
        </div>

        <!-- Themes grid -->
        <div class="ts-grid" id="themes-grid">
          <div
            *ngFor="let theme of themeService.filteredThemes()"
            class="ts-card"
            [class.active]="themeService.activeTheme().id === theme.id"
            (mouseenter)="themeService.previewTheme(theme)"
            (mouseleave)="themeService.cancelPreview()"
            (click)="applyPreset(theme)">

            <!-- Color preview strips -->
            <div class="ts-preview">
              <div class="ts-strip" [style.background]="theme.thumbnail.primary" style="flex:4"></div>
              <div class="ts-strip" [style.background]="theme.thumbnail.secondary" style="flex:2.5"></div>
              <div class="ts-strip" [style.background]="theme.thumbnail.accent" style="flex:2"></div>
              <div class="ts-strip" [style.background]="theme.thumbnail.bg" style="flex:1.5; border-left: 1px solid rgba(255,255,255,0.1)"></div>
            </div>

            <!-- Font preview -->
            <div class="ts-font-preview" [style.background]="theme.colors.surface" [style.color]="theme.colors.text">
              <span class="ts-font-aa" [style.font-family]="theme.fonts.heading + ', sans-serif'" [style.font-weight]="theme.fonts.headingWeight">Aa</span>
              <span class="ts-font-body-sample" [style.font-family]="theme.fonts.body + ', sans-serif'">{{ theme.fonts.body }}</span>
            </div>

            <!-- Card footer -->
            <div class="ts-card-footer">
              <div>
                <div class="ts-card-name">{{ theme.name }}</div>
                <div class="ts-card-cat">{{ theme.category }}</div>
              </div>
              <lucide-icon *ngIf="themeService.activeTheme().id === theme.id" name="check-circle" [size]="16" class="ts-check"></lucide-icon>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ── CUSTOM TAB ──────────────────────────────────────── -->
      <ng-container *ngIf="activeTab() === 'custom'">
        <div class="ts-custom-wrap">

          <!-- Base theme picker -->
          <div class="ts-section">
            <span class="ts-section-title">Base Theme</span>
            <select class="ts-select" [(ngModel)]="customBaseId" (ngModelChange)="onBaseChange($event)">
              <option *ngFor="let t of themeService.themes" [value]="t.id">{{ t.name }}</option>
            </select>
          </div>

          <!-- Colors -->
          <div class="ts-section">
            <span class="ts-section-title">Colors</span>
            <div class="ts-color-grid">
              <label *ngFor="let c of colorKeys" class="ts-color-row">
                <input type="color" [ngModel]="customColors[c]" (ngModelChange)="customColors[c] = $event; onCustomChange()" />
                <span class="ts-color-label">{{ colorLabels[c] }}</span>
                <input class="ts-color-hex" [ngModel]="customColors[c]" (ngModelChange)="customColors[c] = $event; onCustomChange()" maxlength="7" />
              </label>
            </div>
          </div>

          <!-- Fonts -->
          <div class="ts-section">
            <span class="ts-section-title">Typography</span>
            <label class="ts-field-label">Heading Font
              <select class="ts-select" [(ngModel)]="customFonts.heading" (ngModelChange)="onCustomChange()">
                <option *ngFor="let f of fontOptions" [value]="f">{{ f }}</option>
              </select>
            </label>
            <label class="ts-field-label">Body Font
              <select class="ts-select" [(ngModel)]="customFonts.body" (ngModelChange)="onCustomChange()">
                <option *ngFor="let f of fontOptions" [value]="f">{{ f }}</option>
              </select>
            </label>
            <label class="ts-field-label">Heading Weight
              <select class="ts-select" [(ngModel)]="customFonts.headingWeight" (ngModelChange)="onCustomChange()">
                <option value="400">400 – Normal</option>
                <option value="600">600 – Semi-Bold</option>
                <option value="700">700 – Bold</option>
                <option value="800">800 – Extra Bold</option>
              </select>
            </label>
            <label class="ts-field-label">Base Font Size
              <select class="ts-select" [(ngModel)]="customFonts.baseSize" (ngModelChange)="onCustomChange()">
                <option value="14px">14px – Small</option>
                <option value="15px">15px</option>
                <option value="16px">16px – Normal</option>
                <option value="18px">18px – Large</option>
              </select>
            </label>
          </div>

          <!-- Border Radius -->
          <div class="ts-section">
            <span class="ts-section-title">Shape</span>
            <label class="ts-field-label">
              <span>Button Radius: {{ customRadius.button }}</span>
              <input type="range" min="0" max="40" [value]="radiusToNum(customRadius.button)"
                     (input)="onRadiusChange($event)" class="ts-range" />
            </label>
            <div class="ts-radius-preview">
              <button class="ts-radius-sample" [style.border-radius]="customRadius.button"
                      [style.background]="customColors['primary']" [style.color]="customColors['buttonText']">
                Preview Button
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="ts-custom-actions">
            <button class="ts-btn-preview" (click)="previewCustom()">
              <lucide-icon name="eye" [size]="14"></lucide-icon> Preview
            </button>
            <button class="ts-btn-apply" (click)="applyCustom()">
              <lucide-icon name="check" [size]="14"></lucide-icon> Apply Custom Theme
            </button>
          </div>

          <!-- Import / Export -->
          <div class="ts-io-row">
            <button class="ts-btn-io" (click)="exportTheme()">
              <lucide-icon name="download" [size]="13"></lucide-icon> Export JSON
            </button>
            <label class="ts-btn-io" style="cursor:pointer">
              <lucide-icon name="upload" [size]="13"></lucide-icon> Import JSON
              <input type="file" accept=".json" style="display:none" (change)="importTheme($event)">
            </label>
          </div>
        </div>
      </ng-container>
    </aside>
  `,
  styles: [`
    :host { display: block; }

    /* Backdrop */
    .ts-backdrop {
      position: fixed; inset: 0; z-index: 998;
      background: rgba(0,0,0,0.35); backdrop-filter: blur(2px);
    }

    /* Panel */
    .ts-panel {
      position: fixed; top: 0; right: 0; bottom: 0; width: 340px; z-index: 999;
      background: #0d0d14; border-left: 1px solid #2a2a3d;
      display: flex; flex-direction: column; overflow: hidden;
      box-shadow: -8px 0 40px rgba(0,0,0,0.5);
    }
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
    .animate-slide-in { animation: slideIn 280ms cubic-bezier(0.25,0.46,0.45,0.94); }

    /* Header */
    .ts-header {
      height: 54px; flex: 0 0 auto; display: flex; align-items: center;
      justify-content: space-between; padding: 0 16px;
      border-bottom: 1px solid #1e1e2e; background: #0a0a0f;
    }
    .ts-header-left { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700; color: #f1f1f3; }
    .ts-header-icon { color: var(--accent-blue, #4f6ef7); }
    .ts-close-btn { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 6px; background: #1a1a2e; border: 1px solid #2a2a3d; color: #8b8ba0; cursor: pointer; transition: all 150ms; }
    .ts-close-btn:hover { color: white; background: #252540; }

    /* Active bar */
    .ts-active-bar {
      display: flex; align-items: center; gap: 8px; padding: 10px 16px;
      background: rgba(79,110,247,0.07); border-bottom: 1px solid #1e1e2e; flex: 0 0 auto;
    }
    .ts-active-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .ts-active-label { font-size: 11px; color: #8b8ba0; font-weight: 600; }
    .ts-active-name { font-size: 12px; color: #f1f1f3; font-weight: 700; }
    .ts-custom-badge { font-size: 9px; font-weight: 800; background: rgba(79,110,247,0.2); color: #818cf8; border-radius: 4px; padding: 1px 6px; }

    /* Tabs */
    .ts-tabs { display: flex; flex: 0 0 auto; border-bottom: 1px solid #1e1e2e; background: #0a0a0f; }
    .ts-tabs button { flex: 1; height: 38px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px; font-weight: 700; color: #8b8ba0; background: transparent; border: none; border-bottom: 2px solid transparent; cursor: pointer; transition: all 150ms; }
    .ts-tabs button.active { color: white; border-bottom-color: var(--accent-blue, #4f6ef7); }
    .ts-tabs button:hover:not(.active) { color: #c8c8d8; }

    /* Category pills */
    .ts-cat-row { display: flex; gap: 6px; padding: 12px 12px 6px; overflow-x: auto; flex: 0 0 auto; scrollbar-width: none; }
    .ts-cat-row::-webkit-scrollbar { display: none; }
    .ts-cat-pill { height: 26px; padding: 0 10px; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap; background: #1a1a2e; border: 1px solid #2a2a3d; color: #8b8ba0; cursor: pointer; transition: all 150ms; flex-shrink: 0; }
    .ts-cat-pill.active { background: rgba(79,110,247,0.15); border-color: rgba(79,110,247,0.4); color: #818cf8; }
    .ts-cat-pill:hover:not(.active) { color: white; border-color: #3a3a5e; }

    /* Themes grid */
    .ts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 10px 12px 20px; overflow-y: auto; flex: 1; }
    .ts-card {
      border-radius: 10px; overflow: hidden; cursor: pointer; border: 1px solid #2a2a3d;
      background: #111118; transition: all 200ms ease;
    }
    .ts-card:hover { border-color: rgba(79,110,247,0.5); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
    .ts-card.active { border-color: rgba(79,110,247,0.8); box-shadow: 0 0 0 2px rgba(79,110,247,0.3); }
    .ts-preview { display: flex; height: 64px; }
    .ts-strip { height: 100%; transition: flex 200ms; }
    .ts-font-preview { display: flex; align-items: center; gap: 6px; padding: 6px 8px; font-size: 11px; min-height: 28px; }
    .ts-font-aa { font-size: 16px; line-height: 1; }
    .ts-font-body-sample { font-size: 9px; opacity: 0.65; }
    .ts-card-footer { display: flex; align-items: center; justify-content: space-between; padding: 6px 8px 8px; }
    .ts-card-name { font-size: 11px; font-weight: 700; color: #e2e2ee; }
    .ts-card-cat { font-size: 9px; color: #5a5a80; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 1px; }
    .ts-check { color: #4f6ef7; }

    /* Custom tab */
    .ts-custom-wrap { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 14px; }
    .ts-section { display: flex; flex-direction: column; gap: 8px; padding: 12px; background: #111118; border: 1px solid #1e1e2e; border-radius: 10px; }
    .ts-section-title { font-size: 10px; font-weight: 800; color: #8b8ba0; text-transform: uppercase; letter-spacing: 0.1em; }
    .ts-select { width: 100%; height: 32px; background: #0d0d14; border: 1px solid #2a2a3d; border-radius: 6px; color: #f1f1f3; font-size: 12px; padding: 0 8px; outline: none; cursor: pointer; }
    .ts-select:focus { border-color: rgba(79,110,247,0.5); }
    .ts-field-label { display: flex; flex-direction: column; gap: 5px; font-size: 11px; font-weight: 600; color: #8b8ba0; }
    .ts-color-grid { display: flex; flex-direction: column; gap: 6px; }
    .ts-color-row { display: flex; align-items: center; gap: 8px; }
    .ts-color-row input[type="color"] { width: 28px; height: 28px; border: 1px solid #2a2a3d; border-radius: 6px; background: transparent; cursor: pointer; padding: 2px; flex-shrink: 0; }
    .ts-color-label { font-size: 11px; color: #8b8ba0; font-weight: 600; flex: 1; }
    .ts-color-hex { width: 80px; height: 28px; background: #0d0d14; border: 1px solid #2a2a3d; border-radius: 5px; color: #f1f1f3; font-size: 11px; font-family: monospace; padding: 0 6px; outline: none; }
    .ts-range { width: 100%; accent-color: var(--accent-blue, #4f6ef7); margin-top: 4px; }
    .ts-radius-preview { display: flex; justify-content: center; padding: 8px 0 0; }
    .ts-radius-sample { padding: 8px 20px; font-size: 12px; font-weight: 700; border: none; cursor: pointer; transition: all 150ms; }

    /* Action buttons */
    .ts-custom-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .ts-btn-preview {
      height: 36px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      border-radius: 8px; font-size: 12px; font-weight: 700;
      background: #1a1a2e; border: 1px solid #2a2a3d; color: #8b8ba0; cursor: pointer; transition: all 150ms;
    }
    .ts-btn-preview:hover { color: white; border-color: #4a4a6e; }
    .ts-btn-apply {
      height: 36px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      border-radius: 8px; font-size: 12px; font-weight: 700;
      background: linear-gradient(135deg, var(--accent-blue, #4f6ef7), var(--accent-purple, #7c3aed));
      border: none; color: white; cursor: pointer; transition: all 150ms;
    }
    .ts-btn-apply:hover { opacity: 0.88; transform: translateY(-1px); }

    .ts-io-row { display: flex; gap: 8px; }
    .ts-btn-io {
      flex: 1; height: 32px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      border-radius: 6px; font-size: 11px; font-weight: 700;
      background: #111118; border: 1px solid #1e1e2e; color: #8b8ba0; cursor: pointer; transition: all 150ms;
    }
    .ts-btn-io:hover { color: white; border-color: #3a3a5e; }
  `]
})
export class ThemeSwitcherComponent implements OnDestroy {
  @Output() close = new EventEmitter<void>();

  themeService = inject(ThemeService);
  private toast = inject(ToastService);

  readonly categories = THEME_CATEGORIES;
  readonly fontOptions = GOOGLE_FONT_OPTIONS;

  activeTab = signal<'presets' | 'custom'>('presets');

  // Custom builder state — initialise from active theme
  customBaseId = this.themeService.activeTheme().id;
  customColors: Record<string, string> = { ...this.themeService.activeTheme().colors } as any;
  customFonts = { ...this.themeService.activeTheme().fonts };
  customRadius = { ...this.themeService.activeTheme().borderRadius };

  readonly colorKeys = ['primary', 'secondary', 'accent', 'background', 'text', 'buttonText'] as const;
  readonly colorLabels: Record<string, string> = {
    primary: 'Primary', secondary: 'Secondary', accent: 'Accent',
    background: 'Background', text: 'Text', buttonText: 'Button Text'
  };

  // ── Preset tab ──────────────────────────────────────────────────────────────

  applyPreset(theme: SiteTheme): void {
    this.themeService.cancelPreview();
    this.themeService.applyTheme(theme);
    this.toast.success(`✓ ${theme.name} applied!`);
    // Sync custom builder state to the new preset
    this.customBaseId = theme.id;
    this.customColors = { ...theme.colors } as any;
    this.customFonts = { ...theme.fonts };
    this.customRadius = { ...theme.borderRadius };
  }

  // ── Custom tab ──────────────────────────────────────────────────────────────

  onBaseChange(id: string): void {
    const base = this.themeService.getThemeById(id);
    if (!base) return;
    this.customColors = { ...base.colors } as any;
    this.customFonts = { ...base.fonts };
    this.customRadius = { ...base.borderRadius };
    this.onCustomChange();
  }

  onCustomChange(): void {
    const base = this.themeService.getThemeById(this.customBaseId) ?? this.themeService.themes[0];
    const theme = this.themeService.createCustomTheme(
      base,
      this.customColors as any,
      this.customFonts as any,
      this.customRadius
    );
    this.themeService.previewTheme(theme);
  }

  previewCustom(): void {
    this.onCustomChange();
    this.toast.success('Previewing custom theme — click Apply to keep it.');
  }

  applyCustom(): void {
    const base = this.themeService.getThemeById(this.customBaseId) ?? this.themeService.themes[0];
    const theme = this.themeService.createCustomTheme(
      base,
      this.customColors as any,
      this.customFonts as any,
      this.customRadius
    );
    this.themeService.cancelPreview();
    this.themeService.applyCustomTheme(theme);
    this.toast.success('✓ Custom theme applied!');
  }

  onRadiusChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    const px = `${val}px`;
    this.customRadius = {
      ...this.customRadius,
      button: px,
      card: `${Math.round(+val * 1.4)}px`,
      medium: `${Math.round(+val * 0.7)}px`
    };
    this.onCustomChange();
  }

  radiusToNum(val: string): number {
    return parseInt(val, 10) || 0;
  }

  exportTheme(): void {
    const json = this.themeService.exportThemeAsJson(this.themeService.activeTheme());
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${this.themeService.activeTheme().id}-theme.json`;
    a.click();
    this.toast.success('Theme exported!');
  }

  importTheme(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const theme = JSON.parse(e.target?.result as string) as SiteTheme;
        this.customColors = { ...theme.colors } as any;
        this.customFonts = { ...theme.fonts };
        this.customRadius = { ...theme.borderRadius };
        this.onCustomChange();
        this.toast.success('Theme imported — click Apply to use it.');
      } catch {
        this.toast.error('Invalid theme file');
      }
    };
    reader.readAsText(file);
  }

  ngOnDestroy(): void {
    // Always restore when panel closes
    this.themeService.cancelPreview();
  }
}
