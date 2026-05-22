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
    <header class="premium-toolbar">
      <section class="toolbar-left">
        <button class="brand" (click)="goHome()" title="Dashboard">
          <span class="brand-mark">M</span>
          <span class="brand-name">MyBuilder</span>
        </button>
        <div class="page-title-wrapper">
          <input
            type="text"
            class="page-title-input"
            [value]="store.pageTitle()"
            (input)="onTitleChange($event)"
            (blur)="onTitleBlur()"
            (focus)="onTitleFocus()"
            placeholder="Untitled Page"
            maxlength="100"
          />
          <span class="title-edit-icon" *ngIf="!isTitleFocused()">✏️</span>
        </div>
      </section>

      <section class="toolbar-center">
        <!-- Section 1: View (Preview) Mode Switcher -->
        <div class="view-mode-section">
          <span class="section-label">VIEW</span>
          <div class="device-toggle">
            <button class="device-btn" title="Desktop View" (click)="store.setPreviewMode('desktop')" [class.active]="store.previewMode() === 'desktop'">
              <lucide-icon name="monitor" [size]="14"></lucide-icon>
            </button>
            <button class="device-btn" title="Tablet View" (click)="store.setPreviewMode('tablet')" [class.active]="store.previewMode() === 'tablet'">
              <lucide-icon name="tablet" [size]="14"></lucide-icon>
            </button>
            <button class="device-btn" title="Mobile View" (click)="store.setPreviewMode('mobile')" [class.active]="store.previewMode() === 'mobile'">
              <lucide-icon name="smartphone" [size]="14"></lucide-icon>
            </button>
          </div>
        </div>

        <span class="toolbar-divider"></span>

        <!-- Section 2: Edit Mode Switcher (Combined Badge & Button) -->
        <div class="edit-mode-section">
          <button 
            class="edit-mode-pill" 
            [class.desktop-edit]="store.editMode() === 'desktop'" 
            [class.mobile-edit]="store.editMode() === 'mobile'"
            (click)="toggleEditMode()" 
            [title]="store.editMode() === 'desktop' ? 'Switch to Mobile Editing' : 'Switch to Desktop Editing'">
            <span class="pulse-dot" *ngIf="store.editMode() === 'mobile'"></span>
            <lucide-icon [name]="store.editMode() === 'desktop' ? 'monitor' : 'smartphone'" [size]="13"></lucide-icon>
            <span class="badge-text">{{ store.editMode() === 'desktop' ? 'Editing Desktop' : 'Editing Mobile' }}</span>
          </button>
        </div>

        <span class="toolbar-divider"></span>

        <!-- Sync toggle & Mobile reorder controls -->
        <div class="sync-section">
          <div class="sync-toggle-wrap" (click)="store.toggleSyncMode()" title="When active, desktop edits sync automatically to mobile view">
            <button class="sync-switch" [class.on]="store.syncMobileWithDesktop()"></button>
            <span class="sync-label">Sync Mobile</span>
          </div>

          <button 
            *ngIf="store.previewMode() === 'mobile'" 
            (click)="mobileOrderToggle.emit()" 
            class="mobile-order-btn" 
            title="Reorder blocks for mobile view">
            <lucide-icon name="arrow-up-down" [size]="13"></lucide-icon>
            <span class="btn-text">Reorder</span>
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
          <span class="btn-text hide-lg">History</span>
        </button>
        <button class="toolbar-btn ghost" (click)="themesToggle.emit()" title="Global Theme">
          <lucide-icon name="palette" [size]="15"></lucide-icon>
          <span class="btn-text hide-lg">Themes</span>
          <div class="theme-indicator" [style.background]="themeService.activeTheme().colors.primary || '#3b82f6'" title="Active Theme"></div>
        </button>
        <button class="toolbar-btn ghost" (click)="commentsToggle.emit()" title="Comments">
          <lucide-icon name="message-square" [size]="15"></lucide-icon>
          <span class="btn-text hide-lg">Comments</span>
          <span *ngIf="unresolvedCommentCount > 0" class="bg-amber-500 text-gray-900 text-[10px] font-extrabold rounded-full px-1.5 min-w-4 h-4 flex items-center justify-center ml-1">{{ unresolvedCommentCount }}</span>
        </button>
        <button class="toolbar-btn ghost" (click)="settingsToggle.emit()" title="Settings">
          <lucide-icon name="settings" [size]="15"></lucide-icon>
          <span class="btn-text hide-lg">Settings</span>
        </button>

        <button class="toolbar-btn outline preview-anims-btn"
          [class.playing]="canvas.previewAnimations()"
          (click)="canvas.toggleAnimPreview()"
          title="Preview Animations">
          <lucide-icon [name]="canvas.previewAnimations() ? 'sparkles' : 'play'" [size]="14"></lucide-icon>
          <span class="btn-text hide-md">{{ canvas.previewAnimations() ? 'Stop Anims' : 'Preview Anims' }}</span>
        </button>

        <button class="toolbar-btn outline" (click)="preview()" title="Preview">
          <lucide-icon name="eye" [size]="15"></lucide-icon>
          <span class="btn-text hide-sm">Preview</span>
        </button>
        <!-- Save Status Indicator -->
        <div class="save-status-wrapper">
          <!-- IDLE STATE: No recent changes -->
          <div *ngIf="autoSave.saveStatus() === 'idle' && !autoSave.hasUnsavedChanges()" class="save-status idle">
            <span class="status-dot green"></span>
            <span class="status-text hide-md" [title]="saveHistoryTooltip()">
              {{ autoSave.lastSavedText() }}
            </span>
          </div>

          <!-- SAVING STATE: Spinner + text -->
          <div *ngIf="autoSave.saveStatus() === 'saving'" class="save-status saving">
            <div class="spinner"></div>
            <span class="status-text saving-text hide-md">Saving...</span>
          </div>

          <!-- SAVED STATE: Green checkmark -->
          <div *ngIf="autoSave.saveStatus() === 'saved'" class="save-status saved">
            <lucide-icon name="check" [size]="14" class="text-green-500"></lucide-icon>
            <span class="status-text hide-md">Saved</span>
          </div>

          <!-- ERROR STATE: Red warning -->
          <div *ngIf="autoSave.saveStatus() === 'error'" class="save-status error">
            <span class="status-dot red pulse"></span>
            <span class="status-text error-text hide-md">Save failed</span>
            <button class="retry-btn" (click)="autoSave.forceSave()">Retry</button>
          </div>

          <!-- OFFLINE STATE: Gray cloud -->
          <div *ngIf="autoSave.saveStatus() === 'offline'" class="save-status offline">
            <span class="offline-icon">☁️</span>
            <span class="status-text offline-text hide-md">Offline</span>
          </div>

          <!-- UNSAVED CHANGES: Orange dot -->
          <div *ngIf="autoSave.hasUnsavedChanges() && autoSave.saveStatus() === 'idle'" class="save-status unsaved">
            <span class="status-dot orange pulse"></span>
            <span class="status-text hide-md">Unsaved changes</span>
            <button class="save-now-btn" (click)="autoSave.forceSave()">Save now</button>
          </div>
        </div>

        <!-- Manual Save Button -->
        <button 
          class="toolbar-btn ghost"
          (click)="autoSave.forceSave()"
          [disabled]="autoSave.saveStatus() === 'saving'"
          [title]="'Last saved: ' + autoSave.lastSavedText()">
          <lucide-icon name="save" [size]="15"></lucide-icon>
          <span class="btn-text hide-md">Save</span>
        </button>
        <div class="dropdown">
          <button class="toolbar-btn outline" (click)="toggleExportDropdown()" title="Export">
            <lucide-icon name="download" [size]="15"></lucide-icon>
            <span class="btn-text hide-md">Export</span>
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
          <span class="btn-text hide-sm">{{ store.published() ? 'Unpublish' : 'Publish' }}</span>
        </button>
      </section>
    </header>

    <!-- Warning banner when sync is OFF and mobile edit mode is active -->
    <div *ngIf="!store.syncMobileWithDesktop() && store.editMode() === 'mobile'" class="mobile-edit-banner animate-fade-in">
      <lucide-icon name="alert-triangle" [size]="14" class="mr-2"></lucide-icon>
      <span>📱 Mobile Edit Mode — Changes only apply to mobile view styles</span>
    </div>
  `,
  styles: [`
    :host { display: block; flex: 0 0 auto; z-index: 10; position: relative; }
    
    .premium-toolbar {
      height: 52px;
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border-subtle);
      padding: 0 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      color: var(--text-primary);
      user-select: none;
    }
    
    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    
    .toolbar-center {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      flex-grow: 1;
      min-width: 0;
    }
    
    .toolbar-right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
      flex-shrink: 0;
    }
    
    .brand {
      display: flex;
      align-items: center;
      gap: 9px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
    }
    
    .brand-mark {
      width: 30px;
      height: 30px;
      display: grid;
      place-items: center;
      border-radius: 8px;
      background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
      color: white;
      font-weight: 800;
      font-size: 15px;
      box-shadow: 0 8px 24px rgba(79, 110, 247, 0.25);
    }
    
    .brand-name {
      font-size: 15px;
      font-weight: 700;
      color: white;
      transition: display 0.15s ease;
    }
    
    .toolbar-divider {
      width: 1px;
      height: 20px;
      background: var(--border-subtle);
      flex-shrink: 0;
      margin: 0 2px;
    }
    
    .page-title-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    .title-edit-icon {
      position: absolute;
      right: 8px;
      font-size: 10px;
      opacity: 0.5;
      pointer-events: none;
    }
    
    .page-title-input {
      width: 150px;
      height: 32px;
      border: 1px solid transparent;
      border-bottom: 1px solid transparent;
      border-radius: 6px;
      background: transparent;
      color: var(--text-primary);
      padding: 0 24px 0 10px;
      font-weight: 500;
      outline: none;
      transition: all 150ms ease;
      font-size: 13px;
    }
    
    .page-title-input:hover, .page-title-input:focus {
      background: var(--bg-tertiary);
      border-color: var(--border-subtle);
    }
    
    .page-title-input:focus {
      border-bottom-color: #4f6ef7;
      width: 180px;
    }
    
    /* View / Edit sections styling */
    .view-mode-section, .edit-mode-section, .sync-section {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    
    .section-label {
      font-size: 9px;
      font-weight: 800;
      color: var(--text-muted);
      letter-spacing: 0.1em;
    }
    
    .device-toggle {
      height: 30px;
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 2px;
      border-radius: 999px;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-subtle);
    }
    
    .device-btn {
      width: 28px;
      height: 24px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      color: var(--text-secondary);
      transition: all 150ms ease;
      background: transparent;
      border: none;
      cursor: pointer;
    }
    
    .device-btn:hover {
      color: white;
    }
    
    .device-btn.active {
      color: white;
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }
    
    .edit-mode-pill {
      height: 30px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      white-space: nowrap;
      cursor: pointer;
      transition: all 150ms ease;
      border: none;
    }
    
    .edit-mode-pill.desktop-edit {
      color: #3b82f6;
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.2);
    }
    
    .edit-mode-pill.desktop-edit:hover {
      background: rgba(59, 130, 246, 0.18);
      border-color: rgba(59, 130, 246, 0.4);
    }
    
    .edit-mode-pill.mobile-edit {
      color: #f97316;
      background: rgba(249, 115, 22, 0.1);
      border: 1px solid rgba(249, 115, 22, 0.2);
    }
    
    .edit-mode-pill.mobile-edit:hover {
      background: rgba(249, 115, 22, 0.18);
      border-color: rgba(249, 115, 22, 0.4);
    }
    
    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #f97316;
      animation: pulse 1.5s infinite;
    }
    
    @keyframes pulse {
      0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.7); }
      70% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(249, 115, 22, 0); }
      100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
    }
    
    .sync-toggle-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }
    
    .sync-switch {
      width: 32px;
      height: 18px;
      border-radius: 999px;
      background: var(--border-active);
      position: relative;
      transition: background 150ms ease;
      border: none;
      cursor: pointer;
    }
    
    .sync-switch:after {
      content: '';
      position: absolute;
      width: 14px;
      height: 14px;
      top: 2px;
      left: 2px;
      border-radius: 50%;
      background: white;
      transition: transform 150ms ease;
    }
    
    .sync-switch.on {
      background: var(--accent-blue);
    }
    
    .sync-switch.on:after {
      transform: translateX(14px);
    }
    
    .sync-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary);
      white-space: nowrap;
    }
    
    .mobile-order-btn {
      height: 30px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-radius: 6px;
      padding: 0 10px;
      font-size: 11px;
      font-weight: 700;
      color: #f97316;
      background: rgba(249, 115, 22, 0.08);
      border: 1px dashed rgba(249, 115, 22, 0.3);
      transition: all 150ms ease;
      cursor: pointer;
    }
    
    .mobile-order-btn:hover {
      background: rgba(249, 115, 22, 0.15);
      border-style: solid;
    }
    
    .mobile-edit-banner {
      height: 32px;
      background: #fff7ed;
      border-bottom: 1px solid #ffedd5;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #c2410c;
      font-size: 12px;
      font-weight: 600;
      box-shadow: inset 0 -1px 2px rgba(249, 115, 22, 0.04);
    }
    
    .mr-2 {
      margin-right: 8px;
    }
    
    .animate-fade-in {
      animation: bannerIn 250ms ease;
    }
    
    @keyframes bannerIn {
      from { height: 0; opacity: 0; }
      to { height: 32px; opacity: 1; }
    }
    
    .editor-icon-btn {
      width: 30px;
      height: 30px;
      display: grid;
      place-items: center;
      border-radius: 6px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 150ms ease;
      background: transparent;
      border: none;
    }
    
    .editor-icon-btn:hover:not(:disabled) {
      color: white;
      background: var(--bg-tertiary);
    }
    
    .editor-icon-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    
    .toolbar-btn {
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border-radius: 6px;
      padding: 0 10px;
      min-width: 32px;
      font-size: 12px;
      font-weight: 600;
      transition: all 150ms ease;
      white-space: nowrap;
      cursor: pointer;
      background: transparent;
      border: none;
    }
    
    .toolbar-btn.ghost {
      color: var(--text-secondary);
    }
    
    .toolbar-btn.ghost:hover {
      color: white;
      background: var(--bg-tertiary);
    }
    
    .toolbar-btn.outline {
      color: var(--text-primary);
      border: 1px solid var(--border-subtle);
    }
    
    .toolbar-btn.outline:hover {
      background: var(--bg-tertiary);
    }
    
    .toolbar-btn.publish {
      color: white;
      padding: 0 16px;
      background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
      box-shadow: 0 0 0 0 rgba(79, 110, 247, 0.4);
    }
    
    .toolbar-btn.preview-anims-btn.playing {
      color: var(--accent-teal) !important;
      border-color: rgba(6, 182, 212, 0.4) !important;
      background: rgba(6, 182, 212, 0.08) !important;
      box-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
    }
    
    .toolbar-btn.publish:hover {
      box-shadow: 0 0 0 2px rgba(79, 110, 247, 0.4);
      transform: translateY(-1px);
    }
    
    .dropdown {
      position: relative;
    }
    
    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 8px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      width: 180px;
      z-index: 100;
      overflow: hidden;
    }
    
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 10px 12px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
      text-align: left;
      border: none;
      background: transparent;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .dropdown-item:hover {
      background: var(--bg-tertiary);
    }
    
    .dropdown-item:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .theme-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-left: 2px;
      box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
    }
    
    /* Save Status Styles */
    .save-status-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 12px;
      height: 32px;
      border-radius: 8px;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-subtle);
      min-width: 130px;
      transition: all 0.15s ease;
    }
    
    .save-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
    }
    
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
    
    .status-dot.green {
      background: #22c55e;
    }
    
    .status-dot.red {
      background: #ef4444;
    }
    
    .status-dot.orange {
      background: #f97316;
    }
    
    .status-dot.pulse {
      animation: pulse 1.5s infinite;
    }
    
    .spinner {
      width: 12px;
      height: 12px;
      border: 2px solid var(--border-subtle);
      border-top-color: #4f6ef7;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .saving-text {
      color: #4f6ef7;
    }
    
    .error-text {
      color: #ef4444;
    }
    
    .offline-text {
      color: #9ca3af;
    }
    
    .retry-btn, .save-now-btn {
      background: none;
      border: 1px solid currentColor;
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 10px;
      cursor: pointer;
      color: inherit;
    }
    
    .status-text {
      color: var(--text-secondary);
      white-space: nowrap;
      font-size: 12px;
    }
    
    /* PROGRESSIVE RESPONSIVE LAYOUT SYSTEM */
    @media (max-width: 1900px) {
      .btn-text.hide-lg {
        display: none !important;
      }
      .toolbar-btn {
        padding: 0 8px;
      }
    }
    
    @media (max-width: 1680px) {
      .btn-text.hide-md {
        display: none !important;
      }
      .save-status-wrapper .status-text {
        display: none !important;
      }
      .save-status-wrapper {
        min-width: 0;
        padding: 0 8px;
      }
    }
    
    @media (max-width: 1450px) {
      .btn-text.hide-sm {
        display: none !important;
      }
      .brand-name {
        display: none !important;
      }
      .section-label {
        display: none !important;
      }
      .sync-label {
        display: none !important;
      }
    }
    
    @media (max-width: 1200px) {
      .edit-mode-pill .badge-text {
        display: none !important;
      }
      .mobile-order-btn .btn-text {
        display: none !important;
      }
      .edit-mode-pill {
        padding: 0 8px;
        justify-content: center;
      }
      .mobile-order-btn {
        padding: 0 8px;
        width: 32px;
        justify-content: center;
      }
      .premium-toolbar {
        gap: 8px;
      }
      .toolbar-center {
        gap: 6px;
      }
    }
    
    @media (max-width: 1050px) {
      .view-mode-section {
        display: none !important;
      }
      .toolbar-center .toolbar-divider:first-of-type {
        display: none !important;
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
