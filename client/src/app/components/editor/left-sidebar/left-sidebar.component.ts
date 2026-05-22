import { Component, computed, inject, ChangeDetectionStrategy, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { BuilderStore } from '../../../store/builder.store';
import { BlockType } from '../../../store/builder.models';
import { ComponentLibraryService } from '../../../services/component-library.service';
import { TemplatesPanelComponent } from '../templates-panel/templates-panel.component';
import { FileTreeComponent } from '../../file-tree/file-tree.component';

interface BlockDefinition {
  type: BlockType;
  label: string;
  icon: string;
  category: 'Basic' | 'Media' | 'Layout' | 'Form';
}

@Component({
  selector: 'app-left-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DragDropModule, TemplatesPanelComponent, FileTreeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="left-sidebar-wrapper">
      <div class="sidebar-tabs">
        <button class="tab-btn" 
          [class.active]="activeTab() === 'blocks'" 
          (click)="activeTab.set('blocks')"
          title="Add Blocks">
          <lucide-icon name="plus" [size]="18"></lucide-icon>
        </button>
        <button class="tab-btn" 
          [class.active]="activeTab() === 'templates'" 
          (click)="activeTab.set('templates')"
          title="Templates">
          <lucide-icon name="layout" [size]="18"></lucide-icon>
        </button>
        <button class="tab-btn" 
          [class.active]="activeTab() === 'files'" 
          (click)="activeTab.set('files')"
          title="Files & Pages">
          <lucide-icon name="files" [size]="18"></lucide-icon>
        </button>
      </div>

      <div class="sidebar-content">
        <app-templates-panel *ngIf="activeTab() === 'templates'"></app-templates-panel>
        <app-file-tree *ngIf="activeTab() === 'files'"></app-file-tree>

        <ng-container *ngIf="activeTab() === 'blocks'">
          <div class="search-wrap">
            <lucide-icon name="search" [size]="14"></lucide-icon>
            <input [(ngModel)]="searchQuery" (ngModelChange)="searchQuery.set($event)" placeholder="Search blocks..." />
          </div>

          <div class="block-scroll" cdkDropList id="sidebar-block-list" [cdkDropListConnectedTo]="['canvas-drop-list', 'canvas-drop-list-mobile']" [cdkDropListSortingDisabled]="true">
            <ng-container *ngFor="let category of categories">
              <div class="category-label">{{ category }}</div>
              <button
                *ngFor="let block of blocksByCategory(category); trackBy: trackByFn"
                cdkDrag
                [cdkDragData]="block.type"
                (click)="addBlock(block.type)"
                class="block-item">
                <div *cdkDragPreview class="sidebar-drag-preview">
                  <lucide-icon [name]="block.icon" [size]="14"></lucide-icon>
                  <span>{{ block.label }}</span>
                </div>
                <lucide-icon [name]="block.icon" [size]="15"></lucide-icon>
                <span>{{ block.label }}</span>
                <span class="drag-hint">⠿</span>
              </button>
            </ng-container>

            <div class="category-label">My Components</div>
            <button
              *ngFor="let component of components(); trackBy: trackComponentById"
              cdkDrag
              [cdkDragData]="{ savedComponent: component }"
              class="block-item component-item">
              <lucide-icon name="package" [size]="15"></lucide-icon>
              <span>{{ component.name }}</span>
              <button class="delete-component" (click)="deleteComponent(component.id, $event)" title="Delete">
                <lucide-icon name="x" [size]="12"></lucide-icon>
              </button>
            </button>
            <div *ngIf="components().length === 0" class="empty-mini">Right-click a block to save it.</div>
          </div>
        </ng-container>

        <ng-container *ngIf="activeTab() === 'pages'">
          <div class="pages-list">
            <button *ngFor="let page of store.pages(); trackBy: trackPageById" class="page-item" [class.active]="page.id === store.activePageId()" (click)="openPage(page.id)">
              <lucide-icon name="file-text" [size]="15"></lucide-icon>
              <span>{{ page.title || 'Untitled Page' }}</span>
              <lucide-icon name="pencil" [size]="12"></lucide-icon>
            </button>
          </div>
          <div class="new-page-wrap">
            <button class="new-page-btn" (click)="newPage.emit()">New Page</button>
          </div>
        </ng-container>
      </div>
    </aside>
  `,
  styles: [`
    :host { display: block; height: 100%; flex: 0 0 300px; }
    .left-sidebar-wrapper { width: 300px; height: 100%; background: var(--bg-secondary); border-right: 1px solid var(--border-subtle); color: var(--text-primary); display: flex; flex-direction: row; overflow: hidden; }
    
    .sidebar-tabs { display: flex; flex-direction: column; gap: 8px; padding: 16px 10px; background: #11111a; border-right: 1px solid #1a1a24; height: 100%; box-sizing: border-box; }
    .tab-btn { width: 40px; height: 40px; border-radius: 12px; background: transparent; border: none; color: #6b7280; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position: relative; }
    .tab-btn:hover { color: #f1f1f3; background: #1a1a24; }
    .tab-btn.active { color: #4f6ef7; background: rgba(79, 110, 247, 0.1); }
    .tab-btn.active::before { content: ''; position: absolute; left: -10px; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background: #4f6ef7; border-radius: 0 4px 4px 0; }
    
    .sidebar-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; width: 240px; }
    .search-wrap { margin: 10px 12px; height: 32px; display: flex; align-items: center; gap: 8px; padding: 0 10px; border-radius: 6px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); color: var(--text-secondary); flex: 0 0 auto; }
    .search-wrap input { width: 100%; min-width: 0; background: transparent; outline: none; color: var(--text-primary); font-size: 12px; }
    .block-scroll, .pages-list { overflow-y: auto; flex: 1; padding-bottom: 12px; }
    .category-label { color: var(--text-muted); font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; padding: 16px 12px 6px; }
    .block-item { width: calc(100% - 12px); height: 36px; margin: 1px 6px; padding: 0 12px; display: flex; align-items: center; gap: 8px; border-radius: 6px; color: #c8c8d8; cursor: grab; transition: all 150ms ease; position: relative; animation: sidebarFade 240ms ease both; background: transparent; border: none; }
    .block-item lucide-icon { color: var(--text-secondary); transition: color 150ms ease; }
    .block-item:hover { background: var(--bg-tertiary); color: white; transform: translateX(2px); }
    .block-item:hover lucide-icon { color: var(--accent-blue); }
    .block-item.cdk-drag-dragging { background: #1e2a4a; border-left: 2px solid var(--accent-blue); }
    .drag-preview { height: 36px; min-width: 160px; display: flex; align-items: center; gap: 8px; padding: 0 12px; background: #1e2a4a; border: 1px solid var(--accent-blue); border-radius: 6px; color: white; box-shadow: 0 4px 24px rgba(0,0,0,0.4); }
    .component-item span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .delete-component { margin-left: auto; width: 20px; height: 20px; display: grid; place-items: center; border-radius: 4px; color: var(--text-muted); background: transparent; border: none; cursor: pointer; }
    .delete-component:hover { background: rgba(239, 68, 68, 0.12); color: var(--danger); }
    .empty-mini { margin: 8px 12px; border: 1px dashed var(--border-subtle); border-radius: 10px; padding: 14px; text-align: center; color: var(--text-muted); font-size: 12px; }
    .page-item { width: calc(100% - 12px); height: 38px; margin: 4px 6px; padding: 0 10px; display: flex; align-items: center; gap: 8px; border-radius: 6px; color: var(--text-secondary); transition: all 150ms ease; background: transparent; border: none; cursor: pointer; }
    .page-item span { flex: 1; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .page-item:hover, .page-item.active { color: white; background: var(--bg-tertiary); }
    .new-page-wrap { padding: 12px; border-top: 1px solid var(--border-subtle); }
    .new-page-btn { width: 100%; height: 34px; border-radius: 6px; color: white; font-weight: 700; background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); border: none; cursor: pointer; }
    @keyframes sidebarFade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    .sidebar-drag-preview { background: #4f6ef7; color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; display: flex; align-items: center; gap: 6px; box-shadow: 0 8px 24px rgba(79,110,247,0.4); }
    .block-item.cdk-drag-dragging { opacity: 0.4; }
    .drag-hint { margin-left: auto; color: #4a4a6a; font-size: 14px; opacity: 0; transition: opacity 150ms; cursor: grab; }
    .block-item:hover .drag-hint { opacity: 1; }
  `]
})
export class LeftSidebarComponent {
  private library = inject(ComponentLibraryService);
  private router = inject(Router);
  store = inject(BuilderStore);

  activeTab = signal<'blocks' | 'templates' | 'files' | 'pages'>('blocks');
  searchQuery = signal('');
  components = this.library.components;
  @Output() newPage = new EventEmitter<void>();

  categories: Array<BlockDefinition['category']> = ['Basic', 'Media', 'Layout', 'Form'];
  private allBlocks: BlockDefinition[] = [
    { type: 'text', label: 'Text', icon: 'align-left', category: 'Basic' },
    { type: 'heading', label: 'Heading', icon: 'heading', category: 'Basic' },
    { type: 'image', label: 'Image', icon: 'image', category: 'Basic' },
    { type: 'button', label: 'Button', icon: 'mouse-pointer-click', category: 'Basic' },
    { type: 'divider', label: 'Divider', icon: 'minus', category: 'Basic' },
    { type: 'spacer', label: 'Spacer', icon: 'move', category: 'Basic' },
    { type: 'video', label: 'Video', icon: 'play', category: 'Media' },
    { type: 'icon', label: 'Icon', icon: 'smile', category: 'Media' },
    { type: 'section', label: 'Section', icon: 'layout', category: 'Layout' },
    { type: 'columns', label: 'Columns', icon: 'columns', category: 'Layout' },
    { type: 'card', label: 'Card', icon: 'credit-card', category: 'Layout' },
    { type: 'form', label: 'Form', icon: 'form-input', category: 'Form' },
    { type: 'input', label: 'Input Field', icon: 'text-cursor-input', category: 'Form' }
  ];

  filteredBlocks = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.allBlocks;
    return this.allBlocks.filter(block => block.label.toLowerCase().includes(query));
  });

  blocksByCategory(category: BlockDefinition['category']) {
    return this.filteredBlocks().filter(block => block.category === category);
  }

  addBlock(type: BlockType) {
    this.store.addBlock(type);
  }

  openPage(id: string) {
    this.router.navigate(['/editor', id]);
  }

  deleteComponent(id: string, event: MouseEvent) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this component?')) {
      this.library.delete(id).subscribe();
    }
  }

  trackByFn(index: number, item: BlockDefinition) { return item.type; }
  trackComponentById(index: number, item: any) { return item.id; }
  trackPageById(index: number, item: any) { return item.id; }
}
