import { Injectable, computed, inject, signal, Injector, NgZone } from '@angular/core';
import { PageApiService } from './page-api.service';
import { BuilderStore } from '../store/builder.store';
import { ThemeService } from './theme.service';
import { ToastService } from './toast.service';
import { firstValueFrom } from 'rxjs';
import { CanvasBlock } from '../store/builder.models';
import { environment } from '../../environments/environment';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  canonicalUrl: string;
  keywords: string;
}

export interface PageSettings {
  favicon: string;
  customCss: string;
  customJs: string;
  themeId: string;
}

export interface SavePayload {
  pageId: string;
  title?: string;
  blocks?: CanvasBlock[];
  mobileBlocks?: any;
  themeId?: string;
  customTheme?: any;
  seo?: SEOSettings;
  settings?: PageSettings;
  updatedAt?: string;
}

export interface SaveLogEntry {
  timestamp: Date;
  reason: string;
  success: boolean;
  blockCount: number;
}

@Injectable({ providedIn: 'root' })
export class AutoSaveService {
  private pageApi = inject(PageApiService);
  private injector = inject(Injector);
  private themeService = inject(ThemeService);
  private toast = inject(ToastService, { optional: true });
  private ngZone = inject(NgZone);

  private get store(): BuilderStore {
    return this.injector.get(BuilderStore);
  }

  // ── Public state signals ──────────────────────────────
  saveStatus   = signal<SaveStatus>('idle');
  lastSavedAt  = signal<Date | null>(null);
  lastSavedText = computed(() => {
    const date = this.lastSavedAt();
    if (!date) return 'Not saved';
    return 'Saved ' + this.getTimeAgo(date);
  });
  isSaving           = computed(() => this.saveStatus() === 'saving');
  hasUnsavedChanges  = signal<boolean>(false);
  isOnline           = signal<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  pendingSave        = signal<boolean>(false);
  currentPageId      = signal<string | null>(null);
  saveError          = signal<string | null>(null);
  saveLog            = signal<SaveLogEntry[]>([]);

  // ── Internal ──────────────────────────────────────────
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly DEBOUNCE_MS = 800;

  /** Tracks which sections of the page have changed. */
  private changedFields = new Set<string>();

  /**
   * When true, ALL triggerSave() calls are silently dropped.
   * Set during page load to prevent spurious auto-saves.
   */
  private _suppressSaves = false;
  private lastSaveReason = '';

  // ── Lifecycle ─────────────────────────────────────────

  /** Call once after the page has fully loaded into the store. */
  init(pageId: string): void {
    this.destroy();                     // tear down any previous page's timers
    this.currentPageId.set(pageId);
    this.changedFields.clear();
    this.hasUnsavedChanges.set(false);
    this._suppressSaves = false;

    this._setupOnlineDetection();
    this._setupBeforeUnload();
    this._setupVisibilityChange();
    this._loadLastSavedTime(pageId);
  }

  /**
   * Suppress all auto-saves during initial page load.
   * Call BEFORE loading blocks/settings into the store.
   */
  suppressDuringLoad(): void {
    this._suppressSaves = true;
  }

  /**
   * Resume normal auto-saving after load completes.
   * Clears the dirty flags so nothing is immediately saved.
   */
  resumeAfterLoad(): void {
    this._suppressSaves = false;
    this.changedFields.clear();
    this.hasUnsavedChanges.set(false);
    // Cancel any timer that may have been queued before suppression was set
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.saveStatus() !== 'saving') {
      this.saveStatus.set('idle');
    }
  }

  // ── Trigger ───────────────────────────────────────────

  triggerSave(reason: string = 'unknown'): void {
    // Drop silently during page load
    if (this._suppressSaves) return;
    if (!this.currentPageId()) return;

    if (!environment.production) {
      console.log('[AutoSave] triggered:', reason);
    }

    // Mark dirty flags
    if (reason.includes('block') || 
        reason.includes('template') || 
        reason === 'added' || 
        reason === 'reorder' || 
        reason === 'undo' || 
        reason === 'redo' || 
        reason === 'component-added' || 
        reason === 'theme-changed' || 
        reason === 'global-styles-updated' || 
        reason === 'unknown' || 
        reason === 'force') {
      this.changedFields.add('blocks');
    }
    if (reason.includes('title') || reason === 'metadata-updated' || reason === 'unknown' || reason === 'force' || reason === 'title-changed') {
      this.changedFields.add('title');
    }
    if (reason.includes('seo') || reason === 'unknown' || reason === 'force' || reason === 'seo-updated') {
      this.changedFields.add('seo');
    }

    this.hasUnsavedChanges.set(true);
    this.lastSaveReason = reason;

    // Cancel previous debounce
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    // Offline: queue and wait
    if (!this.isOnline()) {
      this.pendingSave.set(true);
      this.saveStatus.set('offline');
      return;
    }

    // Debounced save
    this.ngZone.runOutsideAngular(() => {
      this.debounceTimer = setTimeout(() => {
        this.ngZone.run(() => this._executeSave());
      }, this.DEBOUNCE_MS);
    });
  }

  forceSave(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    // Mark all dirty so we always send the full latest state
    this.changedFields.add('blocks');
    this.changedFields.add('title');
    this.changedFields.add('seo');
    this._executeSave();
  }

  destroy(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = null;
    this.currentPageId.set(null);
    this._suppressSaves = false;
    this.changedFields.clear();
  }

  // ── Core save ─────────────────────────────────────────

  private async _executeSave(): Promise<void> {
    const pageId = this.currentPageId();
    if (!pageId) return;

    this.saveStatus.set('saving');  // ← SHOW SPINNER
    this.saveError.set(null);

    const snapshot = new Set(this.changedFields);
    this.changedFields.clear();

    try {
      const payload = this._buildPayload(snapshot);

      // Add timeout to prevent hanging
      const saveWithTimeout = Promise.race([
        firstValueFrom(
          this.pageApi.updatePage(pageId, payload)
        ),
        new Promise((_, reject) =>
          setTimeout(() =>
            reject(new Error('Save timeout')),
            8000  // 8 second max
          )
        )
      ]);

      const updatedPage = (await saveWithTimeout) as any;
      this.saveStatus.set('saved');  // ← SHOW CHECK
      this.lastSavedAt.set(new Date(updatedPage?.updatedAt ?? new Date()));
      this.hasUnsavedChanges.set(false);
      this.pendingSave.set(false);

      this.saveLog.update(log => [{
        timestamp: new Date(),
        reason: this.lastSaveReason,
        success: true,
        blockCount: this.store.blocks().length
      }, ...log].slice(0, 20));

      setTimeout(() => {
        if (this.saveStatus() === 'saved')
          this.saveStatus.set('idle');
      }, 3000);
    } catch(e: any) {
      // Restore dirty flags so the next retry sends everything
      snapshot.forEach(field => this.changedFields.add(field));

      this.saveStatus.set('error');  // ← SHOW ERROR
      this.saveError.set(e?.message || 'Save failed. Retrying…');

      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => this.ngZone.run(() => this._executeSave()), 5000);
      });
    }
  }

  private _buildPayload(snapshot: Set<string>): SavePayload {
    const payload: SavePayload = {
      pageId: this.currentPageId()!,
      updatedAt: new Date().toISOString()
    };
    if (snapshot.has('blocks')) payload.blocks = this.store.blocks();
    if (snapshot.has('title'))  payload.title  = this.store.pageTitle();
    if (snapshot.has('seo'))    payload.seo    = this.store.seoSettings();
    return payload;
  }

  // ── Online / offline ──────────────────────────────────

  private _onlineHandler  = () => this._handleOnline();
  private _offlineHandler = () => this._handleOffline();
  private _beforeUnload   = (e: BeforeUnloadEvent) => this._handleBeforeUnload(e);
  private _visibilityChange = () => this._handleVisibilityChange();

  private _setupOnlineDetection(): void {
    window.removeEventListener('online',  this._onlineHandler);
    window.removeEventListener('offline', this._offlineHandler);
    window.addEventListener('online',  this._onlineHandler);
    window.addEventListener('offline', this._offlineHandler);
  }

  private _handleOnline(): void {
    this.isOnline.set(true);
    if (this.saveStatus() !== 'saving') this.saveStatus.set('idle');
    if (this.pendingSave()) this._executeSave();
  }

  private _handleOffline(): void {
    this.isOnline.set(false);
    this.saveStatus.set('offline');
  }

  private _setupBeforeUnload(): void {
    window.removeEventListener('beforeunload', this._beforeUnload);
    window.addEventListener('beforeunload', this._beforeUnload);
  }

  private _handleBeforeUnload(e: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges()) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure?';
    }
  }

  private _setupVisibilityChange(): void {
    document.removeEventListener('visibilitychange', this._visibilityChange);
    document.addEventListener('visibilitychange', this._visibilityChange);
  }

  private _handleVisibilityChange(): void {
    if (document.hidden && this.hasUnsavedChanges() && !this._suppressSaves) {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this._executeSave();
    }
  }

  // ── Helpers ───────────────────────────────────────────

  private async _loadLastSavedTime(pageId: string): Promise<void> {
    try {
      const page = await firstValueFrom(this.pageApi.getPage(pageId));
      if (page?.updatedAt) {
        this.lastSavedAt.set(new Date(page.updatedAt));
        this.saveStatus.set('idle');
      }
    } catch {
      // Non-critical — silently ignore
    }
  }

  getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 10)  return 'just now';
    if (seconds < 60)  return seconds + 's ago';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)  return minutes + 'm ago';
    const hours = Math.floor(minutes / 60);
    if (hours < 24)    return hours + 'h ago';
    return date.toLocaleDateString();
  }
}
