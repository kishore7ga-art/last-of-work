import { Component, inject, ChangeDetectionStrategy, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Router } from '@angular/router';
import { BuilderStore } from '../../../store/builder.store';
import { StorageService } from '../../../services/storage.service';
import { PageApiService } from '../../../services/page-api.service';
import { ToastService } from '../../../services/toast.service';
import { ThemeService } from '../../../services/theme.service';
import { AutoSaveService } from '../../../services/auto-save.service';
import { exportPageToHtml } from '../../../utils/html-exporter';
import { CanvasComponent } from '../canvas/canvas.component';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="toolbar">

      <!-- LEFT: Logo + Page Title -->
      <div class="toolbar-left">
        <!-- Logo -->
        <div class="logo" (click)="goHome()" style="cursor: pointer;">
          <div class="logo-icon">
            <lucide-icon name="layers" [size]="15"></lucide-icon>
          </div>
          <span class="logo-text">MyBuilder</span>
        </div>
        
        <div class="toolbar-divider"></div>
        
        <!-- Page title (editable) -->
        <div class="page-title-wrap">
          <input
            class="page-title-input"
            type="text"
            [value]="store.pageTitle()"
            (input)="onTitleChange($event)"
            (blur)="onTitleBlur()"
            placeholder="Untitled Page"
            maxlength="60"
          />
          <lucide-icon name="pencil" [size]="11" class="title-edit-icon"></lucide-icon>
        </div>
      </div>

      <!-- CENTER: Device + Edit Mode -->
      <div class="toolbar-center">
        <!-- Device toggle -->
        <div class="device-toggle">
          <button class="device-btn"
            [class.active]="store.previewMode() === 'desktop'"
            (click)="setDevice('desktop')"
            title="Desktop">
            <lucide-icon name="monitor" [size]="15"></lucide-icon>
          </button>
          <button class="device-btn"
            [class.active]="store.previewMode() === 'tablet'"
            (click)="setDevice('tablet')"
            title="Tablet">
            <lucide-icon name="tablet" [size]="15"></lucide-icon>
          </button>
          <button class="device-btn"
            [class.active]="store.previewMode() === 'mobile'"
            (click)="setDevice('mobile')"
            title="Mobile">
            <lucide-icon name="smartphone" [size]="15"></lucide-icon>
          </button>
        </div>
        
        <!-- Mobile edit badge -->
        @if (store.editMode() === 'mobile') {
          <div class="mobile-edit-badge">
            <span class="badge-dot"></span>
            EDITING MOBILE
          </div>
        }
      </div>

      <!-- RIGHT: Actions -->
      <div class="toolbar-right">
        <!-- Undo / Redo -->
        <div class="btn-group">
          <button class="icon-btn"
            [disabled]="!store.canUndo()"
            (click)="store.undo()"
            title="Undo (Ctrl+Z)">
            <lucide-icon name="undo-2" [size]="15"></lucide-icon>
          </button>
          <button class="icon-btn"
            [disabled]="!store.canRedo()"
            (click)="store.redo()"
            title="Redo (Ctrl+Shift+Z)">
            <lucide-icon name="redo-2" [size]="15"></lucide-icon>
          </button>
        </div>
        
        <div class="toolbar-divider"></div>
        
        <!-- History -->
        <button class="icon-btn"
          (click)="openHistory()"
          title="Version History">
          <lucide-icon name="history" [size]="15"></lucide-icon>
        </button>
        
        <!-- Theme -->
        <button class="icon-btn"
          (click)="openThemes()"
          title="Themes">
          <lucide-icon name="palette" [size]="15"></lucide-icon>
          <span class="theme-dot"
            [style.background]="themeService.activeTheme().colors.primary">
          </span>
        </button>
        
        <!-- Settings -->
        <button class="icon-btn"
          (click)="openSettings()"
          title="Page Settings">
          <lucide-icon name="settings" [size]="15"></lucide-icon>
        </button>
        
        <div class="toolbar-divider"></div>
        
        <!-- Save status -->
        <div class="save-indicator">
          @switch (saveStatus()) {
            @case ('saving') {
              <div class="status saving">
                <div class="save-spinner"></div>
                <span>Saving...</span>
              </div>
            }
            @case ('saved') {
              <div class="status saved">
                <span class="status-check">✓</span>
                <span>Saved</span>
              </div>
            }
            @case ('error') {
              <div class="status error">
                <span>Failed</span>
                <button (click)="autoSave.forceSave()">
                  Retry
                </button>
              </div>
            }
            @default {
              @if (hasUnsaved()) {
                <div class="status unsaved">
                  <span class="status-dot orange pulse"></span>
                  <span>Unsaved</span>
                </div>
              } @else {
                <div class="status idle">
                  <span>{{ lastSaved() }}</span>
                </div>
              }
            }
          }
        </div>
        
        <!-- Preview -->
        <button class="toolbar-btn preview-btn"
          (click)="openPreview()">
          <lucide-icon name="eye" [size]="14"></lucide-icon>
          Preview
        </button>
        
        <!-- Publish -->
        <button class="toolbar-btn publish-btn"
          [class.published]="isPublished()"
          (click)="togglePublish()">
          <lucide-icon 
            [name]="isPublished() ? 'globe' : 'upload'"
            [size]="14"></lucide-icon>
          {{ isPublished() ? 'Published' : 'Publish' }}
        </button>
      </div>

    </header>
  `,
  styles: [`
    :host { display: block; flex: 0 0 auto; z-index: 100; position: relative; }
    
    .toolbar {
      height: 52px;
      background: #08080f;
      border-bottom: 1px solid #1a1a24;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 12px;
      flex-shrink: 0;
      gap: 8px;
      position: relative;
      z-index: 100;
    }

    // LEFT
    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 0;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
      
      .logo-icon {
        width: 28px;
        height: 28px;
        background: linear-gradient(
          135deg, #4f6ef7, #7c3aed);
        border-radius: 7px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        flex-shrink: 0;
      }
      
      .logo-text {
        font-size: 15px;
        font-weight: 700;
        color: #f1f1f3;
        letter-spacing: -0.02em;
        white-space: nowrap;
      }
    }

    .toolbar-divider {
      width: 1px;
      height: 20px;
      background: #1a1a24;
      flex-shrink: 0;
    }

    .page-title-wrap {
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
      position: relative;
      
      .title-edit-icon {
        color: #2a2a3d;
        flex-shrink: 0;
        transition: color 150ms;
      }
      
      &:focus-within .title-edit-icon {
        color: #4f6ef7;
      }
    }

    .page-title-input {
      background: transparent;
      border: none;
      border-bottom: 1px solid transparent;
      color: #c8c8d8;
      font-size: 13px;
      font-weight: 500;
      padding: 3px 6px;
      border-radius: 4px;
      max-width: 180px;
      min-width: 80px;
      width: auto;
      transition: all 150ms;
      
      &:focus {
        outline: none;
        background: #111118;
        border-bottom-color: #4f6ef7;
        color: #f1f1f3;
      }
      
      &::placeholder { color: #2a2a3d; }
    }

    // CENTER
    .toolbar-center {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .device-toggle {
      display: flex;
      background: #111118;
      border: 1px solid #1a1a24;
      border-radius: 8px;
      padding: 3px;
      gap: 2px;
    }

    .device-btn {
      width: 28px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: 5px;
      color: #4a4a6a;
      cursor: pointer;
      transition: all 150ms;
      
      &:hover { color: #8b8ba0; }
      
      &.active {
        background: #4f6ef7;
        color: white;
      }
    }

    .mobile-edit-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      background: rgba(249,115,22,0.12);
      border: 1px solid rgba(249,115,22,0.3);
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 10px;
      font-weight: 700;
      color: #f97316;
      letter-spacing: 0.06em;
      
      .badge-dot {
        width: 5px;
        height: 5px;
        background: #f97316;
        border-radius: 50%;
        animation: dotPulse 1.5s infinite;
      }
    }

    @keyframes dotPulse {
      0%,100% { opacity: 1; transform: scale(1); }
      50%     { opacity: 0.5; transform: scale(1.3); }
    }

    // RIGHT
    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .btn-group {
      display: flex;
      gap: 1px;
    }

    .icon-btn {
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: 6px;
      color: #4a4a6a;
      cursor: pointer;
      transition: all 150ms;
      position: relative;
      
      &:hover:not(:disabled) {
        background: #111118;
        color: #c8c8d8;
      }
      
      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      
      .theme-dot {
        position: absolute;
        bottom: 4px;
        right: 4px;
        width: 5px;
        height: 5px;
        border-radius: 50%;
      }
    }

    .save-status-container {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 8px;
    }

    .save-status {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      
      &.idle {
        .status-text { color: #4a4a6a; }
      }
      
      &.saving {
        background: rgba(79,110,247,0.1);
        border: 1px solid rgba(79,110,247,0.2);
      }
      
      &.saved {
        background: rgba(34,197,94,0.1);
        border: 1px solid rgba(34,197,94,0.2);
        animation: savedFade 3s forwards;
      }
      
      &.error {
        background: rgba(239,68,68,0.1);
        border: 1px solid rgba(239,68,68,0.2);
      }
      
      &.unsaved {
        background: rgba(249,115,22,0.1);
        border: 1px solid rgba(249,115,22,0.2);
      }
      
      &.offline {
        background: rgba(107,114,128,0.1);
        border: 1px solid rgba(107,114,128,0.2);
        .status-text { color: #9ca3af; }
      }
    }

    @keyframes savedFade {
      0%, 70% { opacity: 1; }
      100% { opacity: 0; }
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
      
      &.green  { background: #22c55e; }
      &.orange { background: #f97316; }
      &.red    { background: #ef4444; }
      
      &.pulse {
        animation: dotPulse 1.5s infinite;
      }
    }

    .save-spinner {
      width: 12px;
      height: 12px;
      border: 2px solid rgba(79,110,247,0.3);
      border-top-color: #4f6ef7;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      flex-shrink: 0;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .status-check {
      color: #22c55e;
      font-weight: 700;
      font-size: 14px;
    }

    .status-text {
      color: #8b8ba0;
      white-space: nowrap;
      font-size: 12px;
      
      &.saving-text { color: #4f6ef7; }
    }

    .save-now-btn, .retry-btn {
      background: none;
      border: 1px solid currentColor;
      border-radius: 4px;
      padding: 1px 6px;
      font-size: 10px;
      cursor: pointer;
      color: inherit;
      
      &:hover { opacity: 0.8; }
    }

    .toolbar-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 0 12px;
      height: 30px;
      border: none;
      border-radius: 7px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 150ms;
      white-space: nowrap;
      
      &.preview-btn {
        background: #111118;
        border: 1px solid #2a2a3d;
        color: #c8c8d8;
        
        &:hover {
          background: #1a1a24;
          border-color: #4f6ef7;
          color: white;
        }
      }
      
      &.publish-btn {
        background: linear-gradient(
          135deg, #4f6ef7, #7c3aed);
        color: white;
        
        &:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 
            0 4px 12px rgba(79,110,247,0.4);
        }
        
        &.published {
          background: linear-gradient(
            135deg, #059669, #10b981);
        }
      }
    }
  `]
})
export class ToolbarComponent {
  store = inject(BuilderStore);
  private storageService = inject(StorageService);
  private pageApi = inject(PageApiService);
  private toast = inject(ToastService);
  private router = inject(Router);
  themeService = inject(ThemeService);
  autoSave = inject(AutoSaveService);

  isTitleFocused = signal(false);

  @Input() canvas!: CanvasComponent;
  @Input() pageId: string | null = null;
  @Input() savingStatus: string = 'Saved';
  @Input() unresolvedCommentCount: number = 0;
  @Output() saveRequest = new EventEmitter<void>();
  @Output() historyToggle = new EventEmitter<void>();
  @Output() themesToggle = new EventEmitter<void>();
  @Output() commentsToggle = new EventEmitter<void>();
  @Output() previewToggle = new EventEmitter<void>();
  @Output() settingsToggle = new EventEmitter<void>();
  @Output() mobileOrderToggle = new EventEmitter<void>();

  saveStatus = this.autoSave.saveStatus;
  isSaving = this.autoSave.isSaving;
  lastSaved = this.autoSave.lastSavedText;
  hasUnsaved = this.autoSave.hasUnsavedChanges;

  setDevice(mode: 'desktop' | 'tablet' | 'mobile') {
    this.store.setPreviewMode(mode);
    if (mode === 'mobile') {
      this.store.setEditMode('mobile');
    } else {
      this.store.setEditMode('desktop');
    }
  }

  isPublished() {
    return this.store.published();
  }

  forceSave() {
    this.autoSave.forceSave();
  }

  openHistory() {
    this.historyToggle.emit();
  }

  openThemes() {
    this.themesToggle.emit();
  }

  openSettings() {
    this.settingsToggle.emit();
  }

  openPreview() {
    this.previewToggle.emit();
  }

  togglePublish() {
    this.publish();
  }

  exportDropdownOpen = false;

  toggleEditMode() {
    const nextMode = this.store.editMode() === 'desktop' ? 'mobile' : 'desktop';
    this.store.setEditMode(nextMode);
    
    const hasSeen = localStorage.getItem('builder_mobile_onboard');
    if (nextMode === 'mobile' && !hasSeen) {
      this.toast.success('📱 Mobile Edit Mode Active! Changes here ONLY affect mobile view styles.');
      localStorage.setItem('builder_mobile_onboard', 'true');
    }
  }
  
  fonts = [
    { label: 'Inter', value: 'Inter, sans-serif' },
    { label: 'Roboto', value: 'Roboto, sans-serif' },
    { label: 'Poppins', value: 'Poppins, sans-serif' },
    { label: 'Montserrat', value: 'Montserrat, sans-serif' },
    { label: 'Playfair Display', value: '"Playfair Display", serif' },
    { label: 'Merriweather', value: 'Merriweather, serif' }
  ];

  onTitleChange(event: Event): void {
    const title = (event.target as HTMLInputElement).value;
    this.store.setPageTitle(title);
  }

  onTitleFocus(): void {
    this.isTitleFocused.set(true);
  }

  onTitleBlur(): void {
    this.isTitleFocused.set(false);
    this.autoSave.forceSave();
  }
  
  saveHistoryTooltip(): string {
    const log = this.autoSave.saveLog();
    if (!log.length) return 'No saves yet';
    return log.slice(0, 5).map(entry => {
      const time = entry.timestamp.toLocaleTimeString();
      return `${time} - ${entry.reason} (${entry.blockCount} blocks)`;
    }).join('\n');
  }

  save() {
    this.autoSave.forceSave();
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
    const themeCss = this.themeService.generateThemeCSS(this.themeService.activeTheme());
    const html = exportPageToHtml(title, this.store.blocks(), {
      metaDescription: this.store.metaDescription(),
      ogImage: this.store.ogImage(),
      canonicalUrl: this.store.canonicalUrl()
    }, this.store.globalStyles(), themeCss);
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
