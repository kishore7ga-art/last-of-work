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
import { CommentsPanelComponent } from '../../components/editor/comments-panel/comments-panel.component';
import { CommentApiService } from '../../services/comment-api.service';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service';
import { MobileOrderPanelComponent } from '../../components/editor/mobile-order-panel/mobile-order-panel.component';
import { ThemeSwitcherComponent } from '../../components/theme-switcher/theme-switcher.component';
import { ThemeService } from '../../services/theme.service';
import { AutoSaveService } from '../../services/auto-save.service';
import { FileTreeService } from '../../services/file-tree.service';

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
    SettingsModalComponent,
    CommentsPanelComponent,
    MobileOrderPanelComponent,
    ThemeSwitcherComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="editor-root">
      <app-toolbar 
        [canvas]="canvasRef"
        [pageId]="pageId"
        [savingStatus]="'Saved'"
        [unresolvedCommentCount]="unresolvedCommentCount()"
        (historyToggle)="toggleHistory()"
        (themesToggle)="themesOpen.set(!themesOpen())"
        (commentsToggle)="commentsOpen.set(!commentsOpen())"
        (previewToggle)="previewOpen.set(true)"
        (settingsToggle)="settingsOpen.set(true)"
        (mobileOrderToggle)="mobileOrderOpen.set(!mobileOrderOpen())">
      </app-toolbar>

      <app-theme-switcher *ngIf="themesOpen()" (close)="themesOpen.set(false)"></app-theme-switcher>
      <app-comments-panel *ngIf="commentsOpen() && pageId" [pageId]="pageId" (close)="commentsOpen.set(false)"></app-comments-panel>

      <div *ngIf="pageId && pageId !== 'new' && pageId !== 'temp' && socketService.activeUsers().length > 0" class="flex items-center gap-1 bg-gray-900 border-b border-gray-800 px-4 py-2">
        <span class="text-xs text-gray-400 mr-2">Collaborating:</span>
        <ng-container *ngFor="let user of socketService.activeUsers()">
          <div 
            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 cursor-pointer"
            [style.background]="user.color || '#3b82f6'"
            [title]="user.name || 'Anonymous'">
            {{ user.name ? user.name[0].toUpperCase() : 'A' }}
          </div>
        </ng-container>
      </div>

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
        <app-mobile-order-panel *ngIf="mobileOrderOpen()" (close)="mobileOrderOpen.set(false)" class="flex-shrink-0"></app-mobile-order-panel>
        <app-left-sidebar class="flex-shrink-0" (newPage)="addPage()"></app-left-sidebar>
        <app-canvas #canvasRef class="flex-1 overflow-hidden"></app-canvas>
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
  socketService = inject(SocketService);
  authService = inject(AuthService);
  private commentApi = inject(CommentApiService);
  private themeService = inject(ThemeService);
  autoSave = inject(AutoSaveService);
  private fileTreeService = inject(FileTreeService);

  pageId: string | null = null;
  pages = signal<any[]>([]);
  historyOpen = signal(false);
  themesOpen = signal(false);
  previewOpen = signal(false);
  settingsOpen = signal(false);
  commentsOpen = signal(false);
  mobileOrderOpen = signal(false);
  unresolvedCommentCount = signal(0);
  versions = signal<any[]>([]);
  private autoSaveSub?: Subscription;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const selectedId = this.store.selectedBlockId();

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      this.autoSave.forceSave();
      this.toast.info('Saving page...');
      return;
    }

    if (event.key === 'm' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      const nextMode = this.store.editMode() === 'desktop' ? 'mobile' : 'desktop';
      this.store.setEditMode(nextMode);
      this.toast.success(`Mode toggled to: ${nextMode.toUpperCase()} EDIT`);
      return;
    }

    if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId) {
      this.store.deleteBlock(selectedId);
      event.preventDefault();
    } else if (event.key === 'Escape') {
      this.store.clearSelection();
    } else if (event.key === 'd' && (event.ctrlKey || event.metaKey) && selectedId) {
      this.store.duplicateBlock(selectedId);
      event.preventDefault();
    } else if (event.key === 'z' && (event.ctrlKey || event.metaKey) && event.shiftKey) {
      this.store.redo();
      event.preventDefault();
    } else if (event.key === 'z' && (event.ctrlKey || event.metaKey) && !event.shiftKey) {
      this.store.undo();
      event.preventDefault();
    }
  }

  ngOnInit() {
    this.fileTreeService.loadFromStorage();
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

      if (this.pageId && this.pageId !== 'new' && this.pageId !== 'temp') {
        this.socketService.connect();
        this.socketService.joinPage(this.pageId);
        
        const currentUser = this.authService.user();
        const currentUserId = currentUser ? currentUser._id : null;

        this.socketService.onBlockChanged((data) => {
          if (data.updatedBy !== currentUserId) {
            this.store.handleRemoteBlockChange(data.block);
          }
        });
        
        this.socketService.onBlockAdded((data) => {
          if (data.addedBy !== currentUserId) {
            this.store.handleRemoteBlockAdded(data.block);
          }
        });
        
        this.socketService.onBlockDeleted((data) => {
          if (data.deletedBy !== currentUserId) {
            this.store.handleRemoteBlockDeleted(data.blockId);
          }
        });

        this.socketService.onNewComment((data) => {
          // Placeholder for comment update
        });
      }
    });
  }



  ngOnDestroy() {
    this.autoSave.destroy();
    if (this.pageId && this.pageId !== 'new' && this.pageId !== 'temp') {
      this.socketService.leavePage(this.pageId);
      this.socketService.disconnect();
    }
  }

  loadPage(id: string) {
    this.pageApi.getPage(id).subscribe({
      next: (page) => {
        this.store.setPageTitleSilent(page.title);
        this.store.updatePageMetadata('pageSlug', page.slug || '');
        this.store.updatePageMetadata('canonicalUrl', page.canonicalUrl || '');
        this.store.updatePageMetadata('customDomain', page.customDomain || '');
        this.store.updatePublished(page.published);
        this.store.setSEOSilent(page.seo);
        this.store.setSettingsSilent(page.settings);
        
        if (page.globalStyles) {
          // This will trigger an auto-save, but since it's initial load, we will manually clear unsaved changes below
          this.store.updateGlobalStyles(page.globalStyles);
        }
        
        this.store.activePageId.set(page._id);
        this.fileTreeService.selectNodeByPageId(page._id);
        
        if (page.settings) {
          this.themeService.restoreFromPage(page.settings.themeId, page.settings.customTheme);
        }
        
        if (page.blocks && page.blocks.length > 0) {
          this.store.loadBlocks(page.blocks);
        } else {
          this.store.loadBlocks([]);
        }

        this.autoSave.init(page._id);
        
        setTimeout(() => {
          this.autoSave.hasUnsavedChanges.set(false);
        }, 100);

        // Fetch unresolved comment count
        this.commentApi.getComments(page._id).subscribe({
          next: (comments) => {
            const count = comments.filter(c => !c.resolved).length;
            this.unresolvedCommentCount.set(count);
          }
        });
      }
    });
  }



  loadPageTabs() {
    this.pageApi.getPages().subscribe({
      next: pages => {
        this.pages.set(pages);
        this.fileTreeService.syncWithPages(pages);
        if (this.pageId && this.pageId !== 'new' && this.pageId !== 'temp') {
          this.fileTreeService.selectNodeByPageId(this.pageId);
        }
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
    if (this.autoSave.hasUnsavedChanges()) {
      this.autoSave.forceSave();
    }
    this.router.navigate(['/editor', id]);
  }

  addPage() {
    const title = window.prompt('Page name', 'New Page');
    if (!title) return;
    const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `page-${Date.now()}`;
    this.pageApi.createPage({ title }).subscribe({
      next: page => {
        this.fileTreeService.addFile(page.title, page._id);
        this.fileTreeService.updatePageStatus(page._id, {
          pageSlug: page.slug,
          published: page.published,
          lastModified: page.updatedAt ? new Date(page.updatedAt) : new Date()
        });
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
        this.autoSave.hasUnsavedChanges.set(false);
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
