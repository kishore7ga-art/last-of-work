import { Component, inject, OnInit, OnDestroy, HostListener, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ToolbarComponent } from '../../components/editor/toolbar/toolbar.component';
import { LeftSidebarComponent } from '../../components/editor/left-sidebar/left-sidebar.component';
import { CanvasComponent } from '../../components/editor/canvas/canvas.component';
import { RightSidebarComponent } from '../../components/editor/right-sidebar/right-sidebar.component';
import { BuilderStore } from '../../store/builder.store';
import { PageApiService } from '../../services/page-api.service';
import { StorageService } from '../../services/storage.service';
import { ToastService } from '../../services/toast.service';
import { Subscription, interval } from 'rxjs';
import { PreviewModalComponent } from '../../components/editor/preview-modal/preview-modal.component';
import { SettingsModalComponent } from '../../components/editor/settings-modal/settings-modal.component';

@Component({
  selector: 'app-editor-page',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    ToolbarComponent,
    LeftSidebarComponent,
    CanvasComponent,
    RightSidebarComponent,
    PreviewModalComponent,
    SettingsModalComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="editor-root">
      <app-toolbar 
        [pageId]="pageId"
        [savingStatus]="savingStatus()"
        (saveRequest)="savePage(true)"
        (historyToggle)="toggleHistory()"
        (previewToggle)="previewOpen.set(true)"
        (settingsToggle)="settingsOpen.set(true)">
      </app-toolbar>

      <app-preview-modal *ngIf="previewOpen()" (close)="previewOpen.set(false)"></app-preview-modal>
      <app-settings-modal *ngIf="settingsOpen()" (close)="settingsOpen.set(false)"></app-settings-modal>

      <div class="page-tabs">
        <button
          *ngFor="let page of pages(); trackBy: trackPageById"
          (click)="openPage(page._id || page.id)"
          [class.active]="(page._id || page.id) === pageId">
          <lucide-icon name="file-text" [size]="13"></lucide-icon>
          {{ page.title }}
        </button>
        <button (click)="addPage()" class="add-tab" title="Add page">
          +
        </button>
      </div>

      <div class="editor-main">
        <app-left-sidebar class="flex-shrink-0" (newPage)="addPage()"></app-left-sidebar>
        <app-canvas class="flex-1 overflow-hidden"></app-canvas>
        <app-right-sidebar class="flex-shrink-0"></app-right-sidebar>
      </div>

      <aside *ngIf="historyOpen()" class="fixed right-0 top-0 h-screen w-80 bg-gray-950 border-l border-gray-800 z-40 text-white shadow-2xl flex flex-col">
        <div class="h-14 border-b border-gray-800 flex items-center justify-between px-4">
          <h2 class="font-semibold text-sm">Version History</h2>
          <button (click)="historyOpen.set(false)" class="p-1 rounded hover:bg-gray-800">x</button>
        </div>
        <div class="p-4 border-b border-gray-800">
          <button (click)="loadVersions()" class="w-full px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-sm font-medium">Refresh History</button>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-2">
          <button
            *ngFor="let version of versions(); trackBy: trackVersionById"
            (click)="restoreVersion(version._id)"
            class="w-full text-left p-3 rounded-lg bg-gray-900 border border-gray-800 hover:border-blue-500 transition-colors">
            <div class="text-sm font-medium">{{ formatVersionDate(version.createdAt) }}</div>
            <div class="text-xs text-gray-400 mt-1">{{ version.blockCount }} blocks</div>
          </button>
          <div *ngIf="versions().length === 0" class="text-sm text-gray-500 text-center py-8">No saved versions yet.</div>
        </div>
      </aside>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }
    .editor-root {
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: var(--bg-primary);
    }
    .editor-main {
      flex: 1;
      min-height: 0;
      display: flex;
      overflow: hidden;
    }
    .page-tabs {
      height: 36px;
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 10px;
      overflow-x: auto;
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border-subtle);
      color: var(--text-secondary);
    }
    .page-tabs button {
      height: 26px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0 10px;
      border-radius: 6px;
      border: 1px solid var(--border-subtle);
      background: var(--bg-secondary);
      white-space: nowrap;
      font-size: 12px;
      transition: all 150ms ease;
    }
    .page-tabs button:hover,
    .page-tabs button.active {
      color: white;
      border-color: var(--border-active);
      background: var(--bg-tertiary);
    }
    .page-tabs .add-tab {
      width: 26px;
      justify-content: center;
      padding: 0;
      color: white;
      background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
      border: 0;
    }
  `]
})
export class EditorPageComponent implements OnInit, OnDestroy {
  store = inject(BuilderStore);
  private pageApi = inject(PageApiService);
  private storageService = inject(StorageService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  pageId: string | null = null;
  savingStatus = signal<'Saved' | 'Saved ✓' | 'Saving...' | 'Error' | 'Unsaved'>('Saved');
  pages = signal<any[]>([]);
  historyOpen = signal(false);
  previewOpen = signal(false);
  settingsOpen = signal(false);
  versions = signal<any[]>([]);
  private autoSaveSub?: Subscription;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Check if user is typing in an input or textarea
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const selectedId = this.store.selectedBlockId();

    if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId) {
      this.store.deleteBlock(selectedId);
      event.preventDefault();
      this.markUnsaved();
    } else if (event.key === 'Escape') {
      this.store.clearSelection();
    } else if (event.key === 'd' && (event.ctrlKey || event.metaKey) && selectedId) {
      this.store.duplicateBlock(selectedId);
      event.preventDefault();
      this.markUnsaved();
    } else if (event.key === 'z' && (event.ctrlKey || event.metaKey) && event.shiftKey) {
      this.store.redo();
      event.preventDefault();
      this.markUnsaved();
    } else if (event.key === 'z' && (event.ctrlKey || event.metaKey) && !event.shiftKey) {
      this.store.undo();
      event.preventDefault();
      this.markUnsaved();
    }
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.pageId = params.get('id');
      this.loadPageTabs();
      if (this.pageId === 'new') {
        this.store.loadPageSettings({ title: 'Untitled Page', slug: 'new' });
        this.store.activePageId.set('new');
        this.store.loadBlocks([]);
      } else if (this.pageId && this.pageId !== 'temp') {
        this.loadPage(this.pageId);
      } else {
        this.store.loadPageSettings({ title: 'Untitled Page', slug: 'temp' });
        this.store.activePageId.set('temp');
        this.store.loadBlocks(this.storageService.loadPage() || []);
      }
    });

    // Auto-save every 30 seconds
    this.autoSaveSub = interval(30000).subscribe(() => {
      if (this.savingStatus() === 'Unsaved') {
        this.savePage(false);
      }
    });
  }

  @HostListener('mouseup')
  onMouseUp() {
    // If a drop happened, we mark unsaved
    setTimeout(() => this.markUnsaved(), 100);
  }
  
  @HostListener('keyup')
  onKeyUp() {
    // If typing happened in properties, mark unsaved
    this.markUnsaved();
  }

  ngOnDestroy() {
    if (this.autoSaveSub) {
      this.autoSaveSub.unsubscribe();
    }
    if (this.savingStatus() === 'Unsaved') {
      this.savePage(false);
    }
  }

  markUnsaved() {
    if (this.savingStatus() !== 'Saving...') {
      this.savingStatus.set('Unsaved');
    }
  }

  loadPage(id: string) {
    this.pageApi.getPage(id).subscribe({
      next: (page) => {
        this.store.loadPageSettings({
          title: page.title,
          slug: page.slug,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          ogImage: page.ogImage,
          canonicalUrl: page.canonicalUrl,
          customDomain: page.customDomain,
          published: page.published,
          globalStyles: page.globalStyles
        });
        this.store.activePageId.set(page._id);
        if (page.blocks && page.blocks.length > 0) {
          this.store.loadBlocks(page.blocks);
        } else {
          this.store.loadBlocks([]);
        }
      }
    });
  }

  savePage(showToast = false) {
    if (!this.pageId || this.pageId === 'temp' || this.pageId === 'new') return;
    
    this.savingStatus.set('Saving...');
    const blocks = this.store.blocks();
    
    this.pageApi.updatePage(this.pageId, { 
      blocks,
      title: this.store.pageTitle(),
      metaTitle: this.store.metaTitle(),
      metaDescription: this.store.metaDescription(),
      ogImage: this.store.ogImage(),
      canonicalUrl: this.store.canonicalUrl(),
      customDomain: this.store.customDomain(),
      globalStyles: this.store.globalStyles()
    }).subscribe({
      next: () => {
        this.savingStatus.set('Saved ✓');
        if (showToast) {
          this.toast.success('Page saved successfully');
        }
        setTimeout(() => {
          if (this.savingStatus() === 'Saved ✓') {
            this.savingStatus.set('Saved');
          }
        }, 2000);
      },
      error: () => {
        this.savingStatus.set('Error');
        this.toast.error('Save failed');
      }
    });
  }

  loadPageTabs() {
    this.pageApi.getPages().subscribe({
      next: pages => {
        this.pages.set(pages);
        this.store.loadPages(pages.map(page => ({
          id: page._id,
          title: page.title,
          slug: page.slug,
          blocks: page._id === this.pageId ? this.store.blocks() : []
        })), this.pageId);
      }
    });
  }

  openPage(id: string) {
    if (id === this.pageId) return;
    if (this.savingStatus() === 'Unsaved') {
      this.savePage();
    }
    this.router.navigate(['/editor', id]);
  }

  addPage() {
    const title = window.prompt('Page name', 'New Page');
    if (!title) return;
    const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `page-${Date.now()}`;
    this.pageApi.createPage({ title }).subscribe({
      next: page => {
        this.loadPageTabs();
        this.router.navigate(['/editor', page._id]);
      }
    });
  }

  toggleHistory() {
    this.historyOpen.update(open => !open);
    if (!this.historyOpen()) return;
    this.loadVersions();
  }

  loadVersions() {
    if (!this.pageId || this.pageId === 'temp') return;
    this.pageApi.getVersions(this.pageId).subscribe({ next: versions => this.versions.set(versions) });
  }

  restoreVersion(versionId: string) {
    if (!this.pageId || this.pageId === 'temp') return;
    this.pageApi.restoreVersion(this.pageId, versionId).subscribe({
      next: page => {
        this.store.loadBlocks(page.blocks || []);
        this.loadVersions();
        this.savingStatus.set('Saved');
      }
    });
  }

  formatVersionDate(value: string) {
    return new Date(value).toLocaleString();
  }

  trackPageById(index: number, page: any) {
    return page._id || page.id;
  }

  trackVersionById(index: number, version: any) {
    return version._id;
  }
}
