import { Component, inject, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Router } from '@angular/router';
import { BuilderStore } from '../../../store/builder.store';
import { StorageService } from '../../../services/storage.service';
import { PageApiService } from '../../../services/page-api.service';
import { ToastService } from '../../../services/toast.service';
import { exportPageToHtml } from '../../../utils/html-exporter';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="premium-toolbar">
      <section class="toolbar-left">
        <button class="brand" (click)="goHome()" title="Dashboard">
          <span class="brand-mark">M</span>
          <span class="brand-name">MyBuilder</span>
        </button>
        <span class="toolbar-divider"></span>
        <input
          class="page-title-input"
          [ngModel]="store.pageTitle()"
          (ngModelChange)="store.updatePageMetadata('pageTitle', $event)"
          placeholder="Untitled Page" />
      </section>

      <section class="toolbar-center">
        <div class="device-toggle">
          <button class="device-btn" title="Desktop" (click)="store.setPreviewMode('desktop')" [class.active]="store.previewMode() === 'desktop'">
            <lucide-icon name="monitor" [size]="16"></lucide-icon>
          </button>
          <button class="device-btn" title="Tablet" (click)="store.setPreviewMode('tablet')" [class.active]="store.previewMode() === 'tablet'">
            <lucide-icon name="tablet" [size]="16"></lucide-icon>
          </button>
          <button class="device-btn" title="Mobile" (click)="store.setPreviewMode('mobile')" [class.active]="store.previewMode() === 'mobile'">
            <lucide-icon name="smartphone" [size]="16"></lucide-icon>
          </button>
        </div>
      </section>

      <section class="toolbar-right">
        <button class="editor-icon-btn" (click)="store.undo()" [disabled]="!store.canUndo()" title="Undo">
          <lucide-icon name="undo-2" [size]="16"></lucide-icon>
        </button>
        <button class="editor-icon-btn" (click)="store.redo()" [disabled]="!store.canRedo()" title="Redo">
          <lucide-icon name="redo-2" [size]="16"></lucide-icon>
        </button>
        <span class="toolbar-divider"></span>
        <button class="toolbar-btn ghost" (click)="historyToggle.emit()" title="Version History">
          <lucide-icon name="history" [size]="15"></lucide-icon>
          <span>History</span>
        </button>
        <button class="toolbar-btn ghost" (click)="settingsToggle.emit()" title="Settings">
          <lucide-icon name="settings" [size]="15"></lucide-icon>
          <span>Settings</span>
        </button>
        <button class="toolbar-btn outline" (click)="preview()" title="Preview">
          <lucide-icon name="eye" [size]="15"></lucide-icon>
          <span>Preview</span>
        </button>
        <button class="toolbar-btn ghost" (click)="save()" title="Save">
          <lucide-icon name="save" [size]="15"></lucide-icon>
          <span>{{ savingStatus === 'Saving...' ? 'Saving' : 'Save' }}</span>
        </button>
        <div class="dropdown">
          <button class="toolbar-btn outline" (click)="toggleExportDropdown()" title="Export">
            <lucide-icon name="download" [size]="15"></lucide-icon>
            <span>Export</span>
          </button>
          <div *ngIf="exportDropdownOpen" class="dropdown-menu">
            <button class="dropdown-item" (click)="exportHtml()">
              <lucide-icon name="file-code" [size]="14"></lucide-icon> Export as HTML
            </button>
            <button class="dropdown-item" (click)="copyLink()" [disabled]="!store.published()">
              <lucide-icon name="link" [size]="14"></lucide-icon> Copy Page Link
            </button>
          </div>
        </div>
        <button class="toolbar-btn publish" *ngIf="pageId && pageId !== 'temp'" (click)="publish()">
          <lucide-icon [name]="store.published() ? 'globe-2' : 'upload-cloud'" [size]="15"></lucide-icon>
          <span>{{ store.published() ? 'Unpublish' : 'Publish' }}</span>
        </button>
      </section>
    </header>
  `,
  styles: [`
    :host { display: block; flex: 0 0 auto; }
    .premium-toolbar {
      height: 52px;
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border-subtle);
      padding: 0 16px;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      color: var(--text-primary);
      user-select: none;
    }
    .toolbar-left, .toolbar-center, .toolbar-right { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .toolbar-right { justify-content: flex-end; }
    .brand { display: flex; align-items: center; gap: 9px; }
    .brand-mark {
      width: 30px; height: 30px; display: grid; place-items: center; border-radius: 8px;
      background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
      color: white; font-weight: 800; font-size: 15px;
      box-shadow: 0 8px 24px rgba(79, 110, 247, 0.25);
    }
    .brand-name { font-size: 15px; font-weight: 700; color: white; }
    .toolbar-divider { width: 1px; height: 24px; background: var(--border-subtle); margin: 0 4px; }
    .page-title-input {
      width: 220px; height: 32px; border: 1px solid transparent; border-radius: 6px;
      background: transparent; color: var(--text-primary); padding: 0 10px; font-weight: 500;
      outline: none; transition: all 150ms ease;
    }
    .page-title-input:hover, .page-title-input:focus { background: var(--bg-tertiary); border-color: var(--border-subtle); }
    .device-toggle { height: 36px; display: flex; align-items: center; gap: 2px; padding: 3px; border-radius: 999px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); }
    .device-btn { width: 30px; height: 28px; display: grid; place-items: center; border-radius: 999px; color: var(--text-secondary); transition: all 150ms ease; }
    .device-btn:hover { color: white; }
    .device-btn.active { color: white; background: var(--accent-blue); box-shadow: 0 0 0 2px rgba(79, 110, 247, 0.25); }
    .toolbar-btn {
      height: 32px; display: inline-flex; align-items: center; gap: 7px; border-radius: 6px; padding: 0 11px;
      font-size: 12px; font-weight: 600; transition: all 150ms ease; white-space: nowrap;
    }
    .toolbar-btn.ghost { color: var(--text-secondary); }
    .toolbar-btn.ghost:hover { color: white; background: var(--bg-tertiary); }
    .toolbar-btn.outline { color: var(--text-primary); border: 1px solid var(--border-subtle); }
    .toolbar-btn.outline:hover { background: var(--bg-tertiary); }
    .toolbar-btn.publish {
      color: white; padding: 0 16px; background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
      box-shadow: 0 0 0 0 rgba(79, 110, 247, 0.4);
    }
    .toolbar-btn.publish:hover { box-shadow: 0 0 0 2px rgba(79, 110, 247, 0.4); transform: translateY(-1px); }
    .modal-backdrop { position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; padding: 18px; background: rgba(0,0,0,0.62); }
    .site-styles-modal { width: min(440px, 100%); border-radius: 14px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); box-shadow: 0 4px 24px rgba(0,0,0,0.4); overflow: hidden; }
    .modal-header { height: 64px; padding: 0 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); }
    .modal-header h2 { font-size: 14px; font-weight: 700; }
    .modal-header p { color: var(--text-secondary); font-size: 12px; }
    .modal-body { padding: 16px; display: grid; gap: 16px; }
    .modal-body label span { display: block; color: var(--text-muted); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
    .palette-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    input[type="color"] { width: 100%; height: 36px; border: 1px solid var(--border-subtle); border-radius: 6px; background: var(--bg-tertiary); padding: 4px; }
    
    .dropdown { position: relative; }
    .dropdown-menu {
      position: absolute; top: 100%; right: 0; margin-top: 8px;
      background: var(--bg-secondary); border: 1px solid var(--border-subtle);
      border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      width: 180px; z-index: 100; overflow: hidden;
    }
    .dropdown-item {
      display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 12px;
      font-size: 13px; font-weight: 500; color: var(--text-primary); text-align: left;
      border: none; background: transparent; cursor: pointer; transition: background 0.2s;
    }
    .dropdown-item:hover { background: var(--bg-tertiary); }
    .dropdown-item:disabled { opacity: 0.5; cursor: not-allowed; hover: { background: transparent; } }
  `]
})
export class ToolbarComponent {
  store = inject(BuilderStore);
  private storageService = inject(StorageService);
  private pageApi = inject(PageApiService);
  private toast = inject(ToastService);
  private router = inject(Router);

  @Input() pageId: string | null = null;
  @Input() savingStatus: string = 'Saved';
  @Output() saveRequest = new EventEmitter<void>();
  @Output() historyToggle = new EventEmitter<void>();
  @Output() previewToggle = new EventEmitter<void>();
  @Output() settingsToggle = new EventEmitter<void>();

  exportDropdownOpen = false;
  
  fonts = [
    { label: 'Inter', value: 'Inter, sans-serif' },
    { label: 'Roboto', value: 'Roboto, sans-serif' },
    { label: 'Poppins', value: 'Poppins, sans-serif' },
    { label: 'Montserrat', value: 'Montserrat, sans-serif' },
    { label: 'Playfair Display', value: '"Playfair Display", serif' },
    { label: 'Merriweather', value: 'Merriweather, serif' }
  ];

  save() {
    if (this.pageId && this.pageId !== 'temp' && this.pageId !== 'new') {
      this.saveRequest.emit();
      return;
    }

    this.storageService.savePage(this.store.blocks());
    this.toast.success('Saved to local storage');
  }

  updateStyle(key: string, value: string) {
    this.store.updateGlobalStyles({ [key]: value } as any);
  }

  preview() {
    this.previewToggle.emit();
  }

  publish() {
    if (!this.pageId || this.pageId === 'temp') return;
    this.pageApi.togglePublish(this.pageId).subscribe({
      next: (res) => {
        this.store.updatePublished(res.published);
        this.toast.success(res.published ? 'Page published!' : 'Page unpublished');
      },
      error: () => this.toast.error('Publish failed')
    });
  }

  toggleExportDropdown() {
    this.exportDropdownOpen = !this.exportDropdownOpen;
  }

  exportHtml() {
    this.exportDropdownOpen = false;
    const title = this.store.pageTitle() || 'MyBuilder Site';
    const slug = this.store.pageSlug() || 'my-site';
    const html = exportPageToHtml(title, this.store.blocks(), {
      metaDescription: this.store.metaDescription(),
      ogImage: this.store.ogImage(),
      canonicalUrl: this.store.canonicalUrl()
    }, this.store.globalStyles());
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${slug}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toast.success('HTML file downloaded!');
  }

  copyLink() {
    this.exportDropdownOpen = false;
    if (!this.store.published()) return;
    const slug = this.store.pageSlug();
    const url = `${window.location.origin}/site/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      this.toast.success('Link copied to clipboard!');
    });
  }

  goHome() {
    this.router.navigate(['/dashboard']);
  }
}
