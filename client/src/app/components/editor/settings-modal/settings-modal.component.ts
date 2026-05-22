import { Component, inject, Output, EventEmitter, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BuilderStore } from '../../../store/builder.store';
import { PageApiService } from '../../../services/page-api.service';
import { ToastService } from '../../../services/toast.service';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-backdrop">
      <div class="settings-modal">
        <div class="modal-header">
          <h2>Page Settings</h2>
          <button class="icon-btn" (click)="close.emit()" title="Close (Esc)">
            <lucide-icon name="x" [size]="20"></lucide-icon>
          </button>
        </div>

        <div class="modal-content">
          <div class="tabs">
            <button class="tab-btn" [class.active]="activeTab() === 'general'" (click)="activeTab.set('general')">General</button>
            <button class="tab-btn" [class.active]="activeTab() === 'seo'" (click)="activeTab.set('seo')">SEO</button>
            <button class="tab-btn" [class.active]="activeTab() === 'styles'" (click)="activeTab.set('styles')">Styles</button>
            <button class="tab-btn danger-tab" [class.active]="activeTab() === 'danger'" (click)="activeTab.set('danger')">Danger Zone</button>
          </div>

          <div class="tab-content" [ngSwitch]="activeTab()">
            <!-- General Tab -->
            <div *ngSwitchCase="'general'" class="tab-pane">
              <label>
                <span>Page Title</span>
                <input type="text" [ngModel]="store.pageTitle()" (ngModelChange)="store.updatePageMetadata('pageTitle', $event)" placeholder="E.g., Home Page">
              </label>
              <label>
                <span>URL Slug</span>
                <input type="text" [ngModel]="store.pageSlug()" (ngModelChange)="store.updatePageMetadata('pageSlug', $event)" placeholder="e.g., home-page">
              </label>
              <label>
                <span>Custom Domain</span>
                <input type="text" [ngModel]="store.customDomain()" (ngModelChange)="store.updatePageMetadata('customDomain', $event)" placeholder="www.mywebsite.com">
              </label>
            </div>

            <!-- SEO Tab -->
            <div *ngSwitchCase="'seo'" class="tab-pane">
              <!-- Meta Title -->
              <div class="field">
                <label>Meta Title
                  <span class="char-count">
                    {{ store.seoSettings().metaTitle.length }}/60
                  </span>
                </label>
                <input
                  type="text"
                  [value]="store.seoSettings().metaTitle"
                  (input)="updateSEO('metaTitle', $event)"
                  maxlength="60"
                  placeholder="Page title for search engines"
                />
              </div>

              <!-- Meta Description -->
              <div class="field">
                <label>Meta Description
                  <span class="char-count"
                    [class.over]="store.seoSettings().metaDescription.length > 160">
                    {{ store.seoSettings().metaDescription.length }}/160
                  </span>
                </label>
                <textarea
                  [value]="store.seoSettings().metaDescription"
                  (input)="updateSEO('metaDescription', $event)"
                  maxlength="160"
                  rows="3"
                  placeholder="Description for search engines"
                ></textarea>
              </div>

              <!-- OG Image -->
              <div class="field">
                <label>Social Share Image (OG Image)</label>
                <input
                  type="url"
                  [value]="store.seoSettings().ogImage"
                  (input)="updateSEO('ogImage', $event)"
                  placeholder="https://..."
                />
                @if (store.seoSettings().ogImage) {
                  <img 
                    [src]="store.seoSettings().ogImage"
                    class="og-preview"
                    alt="OG Image preview"
                  />
                }
              </div>

              <!-- Canonical URL -->
              <div class="field">
                <label>Canonical URL</label>
                <input
                  type="url"
                  [value]="store.seoSettings().canonicalUrl"
                  (input)="updateSEO('canonicalUrl', $event)"
                  placeholder="https://..."
                />
              </div>

              <!-- Keywords -->
              <div class="field">
                <label>Keywords</label>
                <input
                  type="text"
                  [value]="store.seoSettings().keywords"
                  (input)="updateSEO('keywords', $event)"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>

              <!-- Live Google preview -->
              <div class="seo-preview">
                <span class="preview-label">Search Preview:</span>
                <div class="google-result">
                  <div class="g-url">
                    yourdomain.com/{{ store.pageSlug() }}
                  </div>
                  <div class="g-title">
                    {{ store.seoSettings().metaTitle || store.pageTitle() }}
                  </div>
                  <div class="g-desc">
                    {{ store.seoSettings().metaDescription || 'No description set' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Styles Tab -->
            <div *ngSwitchCase="'styles'" class="tab-pane">
              <label>
                <span>Font Family</span>
                <select [ngModel]="store.globalStyles().fontFamily" (ngModelChange)="updateStyle('fontFamily', $event)">
                  <option *ngFor="let font of fonts" [value]="font.value">{{ font.label }}</option>
                </select>
              </label>
              <div class="palette-grid">
                <label>
                  <span>Primary</span>
                  <input type="color" [ngModel]="store.globalStyles().primaryColor" (ngModelChange)="updateStyle('primaryColor', $event)">
                </label>
                <label>
                  <span>Secondary</span>
                  <input type="color" [ngModel]="store.globalStyles().secondaryColor" (ngModelChange)="updateStyle('secondaryColor', $event)">
                </label>
                <label>
                  <span>Accent</span>
                  <input type="color" [ngModel]="store.globalStyles().accentColor" (ngModelChange)="updateStyle('accentColor', $event)">
                </label>
              </div>
              <label>
                <span>Base Font Size</span>
                <input type="text" [ngModel]="store.globalStyles().baseFontSize" (ngModelChange)="updateStyle('baseFontSize', $event)">
              </label>
            </div>

            <!-- Danger Zone Tab -->
            <div *ngSwitchCase="'danger'" class="tab-pane">
              <div class="danger-box">
                <h4>Clear all blocks</h4>
                <p>Removes all content from this page. This action can be undone.</p>
                <button class="btn-danger" (click)="clearBlocks()">Clear Blocks</button>
              </div>
              <div class="danger-box">
                <h4>Delete this page</h4>
                <p>Permanently deletes this page. This action cannot be undone.</p>
                <button class="btn-danger" (click)="deletePage()">Delete Page</button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-primary" (click)="saveSettings()">Save Settings</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop { position: fixed; inset: 0; z-index: 9999; display: grid; place-items: center; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); padding: 20px; animation: fadeIn 0.2s; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .settings-modal { width: 100%; max-width: 600px; background: #111118; border: 1px solid #2a2a3d; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid #2a2a3d; }
    .modal-header h2 { font-size: 18px; font-weight: 600; color: white; margin: 0; }
    .icon-btn { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 6px; color: #a1a1aa; background: transparent; transition: 0.2s; }
    .icon-btn:hover { background: rgba(255,255,255,0.1); color: white; }
    
    .modal-content { display: flex; flex-direction: column; height: 450px; }
    .tabs { display: flex; border-bottom: 1px solid #2a2a3d; padding: 0 16px; background: #151520; }
    .tab-btn { padding: 14px 16px; font-size: 13px; font-weight: 500; color: #a1a1aa; background: transparent; border: none; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: 0.2s; }
    .tab-btn:hover { color: white; }
    .tab-btn.active { color: #3b82f6; border-bottom-color: #3b82f6; }
    .tab-btn.danger-tab.active { color: #ef4444; border-bottom-color: #ef4444; }
    
    .tab-content { flex: 1; overflow-y: auto; padding: 24px; }
    .tab-pane { display: flex; flex-direction: column; gap: 16px; animation: fadeIn 0.2s; }
    
    label { display: flex; flex-direction: column; gap: 6px; }
    label span.char-count { font-size: 10px; color: #a1a1aa; font-weight: normal; float: right; text-transform: none; letter-spacing: normal; }
    label span.char-count.over { color: #ef4444; }
    label { font-size: 11px; font-weight: 600; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.05em; }
    .og-preview { width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-top: 8px; border: 1px solid #2a2a3d; }
    input[type="text"], input[type="email"], select, textarea { width: 100%; background: #0a0a0f; border: 1px solid #2a2a3d; border-radius: 6px; padding: 10px 14px; color: white; font-size: 14px; transition: 0.2s; outline: none; }
    input[type="text"]:focus, textarea:focus, select:focus { border-color: #3b82f6; }
    input[type="color"] { width: 100%; height: 36px; border: 1px solid #2a2a3d; border-radius: 6px; background: #0a0a0f; padding: 4px; cursor: pointer; }
    
    .palette-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    
    .seo-preview { margin-top: 8px; border-top: 1px dashed #2a2a3d; padding-top: 16px; }
    .preview-label { font-size: 12px; color: #a1a1aa; margin-bottom: 8px; display: block; }
    .google-result { background: white; padding: 16px; border-radius: 8px; font-family: Arial, sans-serif; }
    .g-url { font-size: 12px; color: #202124; margin-bottom: 4px; }
    .g-title { font-size: 20px; color: #1a0dab; margin-bottom: 4px; line-height: 1.2; text-decoration: none; }
    .g-desc { font-size: 14px; color: #4d5156; line-height: 1.4; }
    
    .danger-box { border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 16px; background: rgba(239, 68, 68, 0.05); }
    .danger-box h4 { margin: 0 0 6px 0; color: #ef4444; font-size: 15px; font-weight: 600; }
    .danger-box p { margin: 0 0 16px 0; color: #a1a1aa; font-size: 13px; line-height: 1.4; }
    .btn-danger { background: #ef4444; color: white; border: none; border-radius: 6px; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .btn-danger:hover { background: #dc2626; }
    
    .modal-footer { padding: 16px 24px; border-top: 1px solid #2a2a3d; display: flex; justify-content: flex-end; background: #151520; }
    .btn-primary { background: #3b82f6; color: white; border: none; border-radius: 6px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
    .btn-primary:hover { background: #2563eb; }
  `]
})
export class SettingsModalComponent {
  store = inject(BuilderStore);
  private pageApi = inject(PageApiService);
  private toast = inject(ToastService);
  private router = inject(Router);

  @Output() close = new EventEmitter<void>();

  activeTab = signal<'general' | 'seo' | 'styles' | 'danger'>('general');

  fonts = [
    { label: 'Inter', value: 'Inter, sans-serif' },
    { label: 'Roboto', value: 'Roboto, sans-serif' },
    { label: 'Poppins', value: 'Poppins, sans-serif' },
    { label: 'Montserrat', value: 'Montserrat, sans-serif' },
    { label: 'Playfair Display', value: '"Playfair Display", serif' },
    { label: 'Merriweather', value: 'Merriweather, serif' }
  ];

  updateStyle(key: string, value: string) {
    this.store.updateGlobalStyles({ [key]: value } as any);
  }

  updateSEO(field: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.store.updateSEO({ [field]: value });
  }

  saveSettings() {
    const pageId = this.store.activePageId();
    if (!pageId || pageId === 'temp' || pageId === 'new') {
      this.toast.info('Please save the page first before applying settings.');
      this.close.emit();
      return;
    }

    this.pageApi.updatePage(pageId, {
      title: this.store.pageTitle(),
      seo: this.store.seoSettings(),
      canonicalUrl: this.store.canonicalUrl(),
      customDomain: this.store.customDomain(),
      globalStyles: this.store.globalStyles()
    }).subscribe({
      next: () => {
        this.toast.success('Settings saved successfully');
        this.close.emit();
      },
      error: () => this.toast.error('Failed to save settings')
    });
  }

  clearBlocks() {
    if (confirm('Are you sure you want to clear all blocks? This action can be undone via Undo.')) {
      this.store.clearCanvas();
      this.toast.info('Canvas cleared');
      this.activeTab.set('general');
    }
  }

  deletePage() {
    const pageId = this.store.activePageId();
    if (!pageId || pageId === 'temp' || pageId === 'new') return;

    if (confirm('Are you absolutely sure you want to delete this page? This cannot be undone.')) {
      this.pageApi.deletePage(pageId).subscribe({
        next: () => {
          this.toast.success('Page deleted');
          this.router.navigate(['/dashboard']);
        },
        error: () => this.toast.error('Failed to delete page')
      });
    }
  }
}
