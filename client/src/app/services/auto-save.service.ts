import { Injectable, computed, inject, signal, Injector } from '@angular/core';
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

  private get builderStore(): BuilderStore {
    return this.injector.get(BuilderStore);
  }

  // Save status signals
  saveStatus = signal<SaveStatus>('idle');
  lastSavedAt = signal<Date | null>(null);
  lastSavedText = computed(() => {
    const date = this.lastSavedAt();
    if (!date) return 'Never saved';
    return 'Saved ' + this.getTimeAgo(date);
  });
  isSaving = computed(() => this.saveStatus() === 'saving');
  hasUnsavedChanges = signal<boolean>(false);
  isOnline = signal<boolean>(navigator.onLine);
  pendingSave = signal<boolean>(false);
  currentPageId = signal<string | null>(null);
  saveError = signal<string | null>(null);
  
  saveLog = signal<SaveLogEntry[]>([]);

  // Debounce timer
  private debounceTimer: any = null;
  private readonly DEBOUNCE_MS = 1500;

  // Track what changed:
  private blocksChanged = false;
  private titleChanged = false;
  private seoChanged = false;

  // Save queue for offline support
  private saveQueue: SavePayload[] = [];
  private lastSaveReason = '';

  // Initialize auto-save for a page
  init(pageId: string): void {
    this.currentPageId.set(pageId);
    this.setupOnlineDetection();
    this.setupBeforeUnloadWarning();
    this.setupVisibilityChangeHandler();
    this.loadLastSavedTime(pageId);
  }

  // Call this whenever ANY change happens
  triggerSave(reason: string = 'unknown'): void {
    if (!environment.production) {
      console.log('Auto-save triggered:', reason);
    }
    if (reason.includes('block') || reason === 'unknown' || reason === 'init' || reason === 'force') 
      this.blocksChanged = true;
    if (reason === 'title-changed' || reason === 'unknown' || reason === 'init' || reason === 'force') 
      this.titleChanged = true;
    if (reason === 'seo-updated' || reason === 'unknown' || reason === 'init' || reason === 'force') 
      this.seoChanged = true;

    this.hasUnsavedChanges.set(true);
    this.lastSaveReason = reason;
    
    // Clear existing debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    // If offline: queue the save
    if (!this.isOnline()) {
      this.pendingSave.set(true);
      this.saveStatus.set('offline');
      return;
    }
    
    // Start debounce timer
    this.debounceTimer = setTimeout(() => {
      this.executeSave();
    }, this.DEBOUNCE_MS);
  }

  // Actually perform the save
  private async executeSave(): Promise<void> {
    const pageId = this.currentPageId();
    if (!pageId) return;
    
    try {
      this.saveStatus.set('saving');
      this.saveError.set(null);
      
      const payload = this.buildSavePayload();
      
      // Reset change flags after building payload
      this.blocksChanged = false;
      this.titleChanged = false;
      this.seoChanged = false;
      
      const updatedPage = await firstValueFrom(
        this.pageApi.updatePage(pageId, payload)
      );
      
      this.saveStatus.set('saved');
      const savedAt = new Date(updatedPage?.updatedAt ?? new Date());
      this.lastSavedAt.set(savedAt);
      this.hasUnsavedChanges.set(false);
      this.pendingSave.set(false);
      
      this.saveLog.update(log => [{
        timestamp: new Date(),
        reason: this.lastSaveReason,
        success: true,
        blockCount: this.builderStore.blocks().length
      }, ...log].slice(0, 20));

      // Reset status to 'idle' after 3 seconds
      setTimeout(() => {
        if (this.saveStatus() === 'saved') {
          this.saveStatus.set('idle');
        }
      }, 3000);
      
    } catch (error: any) {
      this.saveStatus.set('error');
      this.saveError.set(
        error?.message || 'Save failed'
      );
      
      // Retry after 5 seconds
      setTimeout(() => {
        this.executeSave();
      }, 5000);
    }
  }

  // Build complete save payload
  private buildSavePayload(): SavePayload {
    return {
      pageId: this.currentPageId()!,
      // Only send blocks if changed
      ...(this.blocksChanged && {
        blocks: this.builderStore.blocks()
      }),
      // Only send title if changed  
      ...(this.titleChanged && {
        title: this.builderStore.pageTitle()
      }),
      // Only send seo if changed
      ...(this.seoChanged && {
        seo: this.builderStore.seoSettings()
      }),
      updatedAt: new Date().toISOString()
    };
  }

  // Online/Offline detection
  private setupOnlineDetection(): void {
    window.addEventListener('online', () => {
      this.isOnline.set(true);
      this.saveStatus.set('idle');
      
      // If there was a pending save, execute it now
      if (this.pendingSave()) {
        this.executeSave();
      }
    });
    
    window.addEventListener('offline', () => {
      this.isOnline.set(false);
      this.saveStatus.set('offline');
    });
  }

  // Warn user before leaving with unsaved changes
  private setupBeforeUnloadWarning(): void {
    window.addEventListener('beforeunload', (e) => {
      if (this.hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure?';
      }
    });
  }

  // Save when tab becomes hidden (user switches tab)
  private setupVisibilityChangeHandler(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.hasUnsavedChanges()) {
        // Force immediate save when tab loses focus
        clearTimeout(this.debounceTimer);
        this.executeSave();
      }
    });
  }

  // Load last saved time from localStorage
  private async loadLastSavedTime(pageId: string): Promise<void> {
    const page = await firstValueFrom(this.pageApi.getPage(pageId));
    if (page?.updatedAt) {
      this.lastSavedAt.set(new Date(page.updatedAt));
      this.saveStatus.set('idle');
    }
  }

  // Human readable time ago
  getTimeAgo(date: Date): string {
    const seconds = Math.floor(
      (new Date().getTime() - date.getTime()) / 1000
    );
    
    if (seconds < 10) return 'just now';
    if (seconds < 60) return seconds + 's ago';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + 'm ago';
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + 'h ago';
    
    return date.toLocaleDateString();
  }

  // Force immediate save (for manual save button)
  forceSave(): void {
    clearTimeout(this.debounceTimer);
    this.executeSave();
  }

  // Cleanup on component destroy
  destroy(): void {
    clearTimeout(this.debounceTimer);
    this.currentPageId.set(null);
  }
}
