import { Component, computed, inject, ChangeDetectionStrategy, signal, Output, EventEmitter, ChangeDetectorRef, NgZone } from '@angular/core';
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
    <aside style="display: flex; flex-direction: column; width: 100%; height: 100%;">
      <!-- TAB BAR (redesigned) -->
      <div class="tab-bar">
        <button class="tab-btn" 
          [class.active]="activeTab() === 'blocks'" 
          (click)="activeTab.set('blocks')"
          title="Add Blocks">
          <div class="tab-icon-wrap">
            <lucide-icon name="plus" [size]="16"></lucide-icon>
          </div>
          <span class="tab-label">Blocks</span>
        </button>
        <button class="tab-btn" 
          [class.active]="activeTab() === 'templates'" 
          (click)="activeTab.set('templates')"
          title="Templates">
          <div class="tab-icon-wrap">
            <lucide-icon name="layout" [size]="16"></lucide-icon>
          </div>
          <span class="tab-label">Templates</span>
        </button>
        <button class="tab-btn" 
          [class.active]="activeTab() === 'files'" 
          (click)="activeTab.set('files')"
          title="Files & Pages">
          <div class="tab-icon-wrap">
            <lucide-icon name="files" [size]="16"></lucide-icon>
          </div>
          <span class="tab-label">Pages</span>
        </button>
        <button class="tab-btn" 
          [class.active]="activeTab() === 'pages'" 
          (click)="activeTab.set('pages')"
          title="Site Tree">
          <div class="tab-icon-wrap">
            <lucide-icon name="file-text" [size]="16"></lucide-icon>
          </div>
          <span class="tab-label">Tree</span>
        </button>
      </div>

      <!-- CONTENT PANELS -->
      <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden; width: 100%;">
        <app-templates-panel *ngIf="activeTab() === 'templates'" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;"></app-templates-panel>
        <app-file-tree *ngIf="activeTab() === 'files'" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;"></app-file-tree>

        <ng-container *ngIf="activeTab() === 'blocks'">
          <div class="panel-search">
            <div class="search-wrap">
              <lucide-icon name="search" [size]="12" class="search-icon"></lucide-icon>
              <input [value]="searchQuery()" (input)="onSearchInput($event)" placeholder="Search blocks..." />
            </div>
          </div>

          <div class="blocks-scroll blocks-list" cdkDropList id="sidebar-list" [cdkDropListData]="filteredBlocks()" [cdkDropListConnectedTo]="['canvas-drop-list']" [cdkDropListSortingDisabled]="true">
            <ng-container *ngFor="let category of categories">
              <div class="block-category-label">{{ category }}</div>
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
                <lucide-icon [name]="block.icon" [size]="15" class="block-icon"></lucide-icon>
                <span class="block-label">{{ block.label }}</span>
                <span class="drag-indicator">⠿</span>
              </button>
            </ng-container>

            <div class="block-category-label">My Components</div>
            <button
              *ngFor="let component of components(); trackBy: trackComponentById"
              cdkDrag
              [cdkDragData]="{ savedComponent: component }"
              class="block-item component-item">
              <lucide-icon name="package" [size]="15" class="block-icon"></lucide-icon>
              <span class="block-label">{{ component.name }}</span>
              <button class="delete-component" (click)="deleteComponent(component.id, $event)" title="Delete" style="background:none;border:none;color:#ef4444;cursor:pointer;">
                <lucide-icon name="x" [size]="12"></lucide-icon>
              </button>
            </button>
            <div *ngIf="components().length === 0" class="empty-mini" style="font-size: 10px; color: #363650; text-align: center; padding: 12px;">Right-click a block to save it.</div>
          </div>
        </ng-container>

        <ng-container *ngIf="activeTab() === 'pages'">
          <div class="blocks-scroll">
            <div class="block-category-label">Workspace Pages</div>
            <div style="display: flex; flex-direction: column; gap: 4px; padding: 4px;">
              <button *ngFor="let page of store.pages(); trackBy: trackPageById" 
                class="block-item" 
                [style.background]="page.id === store.activePageId() ? '#111118' : 'transparent'"
                [style.color]="page.id === store.activePageId() ? '#f1f1f3' : '#8b8ba0'"
                (click)="openPage(page.id)">
                <lucide-icon name="file-text" [size]="15" class="block-icon" [style.color]="page.id === store.activePageId() ? '#4f6ef7' : '#4a4a6a'"></lucide-icon>
                <span class="block-label">{{ page.title || 'Untitled Page' }}</span>
                <lucide-icon name="pencil" [size]="11" class="drag-indicator" style="opacity: 0.5;"></lucide-icon>
              </button>
            </div>
            <div style="padding: 12px;">
              <button class="new-page-btn" (click)="newPage.emit()" style="width: 100%; height: 32px; border-radius: 6px; color: white; font-weight: 700; background: linear-gradient(135deg, #4f6ef7, #7c3aed); border: none; cursor: pointer; font-size: 11px;">+ New Page</button>
            </div>
          </div>
        </ng-container>
      </div>
    </aside>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      width: 260px;
      height: 100%;
      background: #030c1c;
      border-right: 1px solid #0e2040;
      flex-shrink: 0;
      overflow: hidden;
    }

    // ── PREMIUM TAB BAR ────────────────────────────────────
    .tab-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      background: #02080f;
      border-bottom: 1px solid #0e2040;
      padding: 8px 6px 0;
      gap: 2px;
      flex-shrink: 0;
    }

    .tab-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 8px 4px 9px;
      background: transparent;
      border: none;
      border-radius: 10px 10px 0 0;
      color: #2a5090;
      cursor: pointer;
      transition: color 200ms, background 200ms;
      position: relative;
      
      .tab-icon-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: transparent;
        transition: background 200ms, box-shadow 200ms;
        
        lucide-icon { 
          transition: color 200ms, filter 200ms;
          color: inherit;
        }
      }
      
      .tab-label {
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        transition: color 200ms;
        color: inherit;
      }
      
      &:hover:not(.active) {
        color: #4f7abf;
        .tab-icon-wrap {
          background: rgba(29,106,248,0.06);
        }
      }
      
      &.active {
        color: #c8deff;

        // Crisp underline glow
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 12%;
          width: 76%;
          height: 2px;
          background: linear-gradient(90deg, #1d6af8, #4f90ff);
          border-radius: 2px 2px 0 0;
          box-shadow: 0 0 10px rgba(29,106,248,0.9), 0 0 20px rgba(29,106,248,0.4);
        }
        
        .tab-icon-wrap {
          background: rgba(29,106,248,0.15);
          box-shadow: 0 0 0 1px rgba(29,106,248,0.3) inset;
          
          lucide-icon {
            color: #4f90ff;
            filter: drop-shadow(0 0 5px rgba(79,144,255,0.7));
          }
        }
        
        .tab-label {
          color: #4f90ff;
        }
      }
    }

    // ── SEARCH ─────────────────────────────────────
    .panel-search {
      padding: 8px;
      border-bottom: 1px solid #111118;
      flex-shrink: 0;
      
      .search-wrap {
        position: relative;
        
        .search-icon {
          position: absolute;
          left: 8px;
          top: 50%;
          transform: translateY(-50%);
          color: #2a2a3d;
          pointer-events: none;
        }
        
        input {
          width: 100%;
          height: 30px;
          background: #111118;
          border: 1px solid #1a1a24;
          border-radius: 6px;
          color: #c8c8d8;
          font-size: 12px;
          padding: 0 28px;
          outline: none;
          transition: border-color 150ms, box-shadow 150ms;
          box-sizing: border-box;
          
          &::placeholder { color: #2a2a3d; }
          
          &:focus {
            border-color: #4f6ef7;
            box-shadow: 0 0 0 2px rgba(79,110,247,0.12);
          }
        }
      }
    }

    // ── BLOCK LIST ─────────────────────────────────
    .blocks-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 6px 6px 20px;
      
      &::-webkit-scrollbar { width: 3px; }
      &::-webkit-scrollbar-thumb {
        background: #1a1a24;
        border-radius: 3px;
      }
    }

    .block-category-label {
      font-size: 9px;
      font-weight: 700;
      color: #3d3d5c;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      padding: 10px 8px 5px;
    }

    .block-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      height: 34px;
      padding: 0 8px;
      background: transparent;
      border: none;
      border-radius: 6px;
      color: #8b8ba0;
      cursor: pointer;
      transition: all 120ms;
      text-align: left;
      margin: 1px 0;
      box-sizing: border-box;
      
      .block-icon { 
        color: #4a4a6a;
        flex-shrink: 0;
        transition: color 120ms;
      }
      
      .block-label {
        font-size: 12px;
        font-weight: 400;
        flex: 1;
        color: #8b8ba0;
        transition: color 120ms;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .drag-indicator {
        color: #2a2a3d;
        font-size: 14px;
        opacity: 0;
        transition: opacity 120ms;
      }
      
      &:hover {
        background: #111118;
        
        .block-icon { color: #6b8ff8; }
        .block-label { color: #f1f1f3; }
        .drag-indicator { opacity: 1; }
      }
      
      &:active {
        background: #1a1a24;
        transform: scale(0.98);
      }
    }
    
    .sidebar-drag-preview {
      background: linear-gradient(135deg, #4f6ef7, #7c3aed);
      color: white;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 8px 24px rgba(79,110,247,0.5);
    }
  `]
})
export class LeftSidebarComponent {
  private library = inject(ComponentLibraryService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
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
    return this.allBlocks.filter(block =>
      block.label.toLowerCase().includes(query) ||
      block.type.toLowerCase().includes(query)
    );
  });

  private blocksByCategoryMap = computed(() => {
    const map = new Map<BlockDefinition['category'], BlockDefinition[]>();
    this.categories.forEach(category => map.set(category, []));
    this.filteredBlocks().forEach(block => {
      map.get(block.category)?.push(block);
    });
    return map;
  });

  blocksByCategory(category: BlockDefinition['category']) {
    return this.blocksByCategoryMap().get(category) || [];
  }

  addBlock(type: BlockType) {
    this.ngZone.run(() => {
      this.store.addBlock(type);
      this.cdr.markForCheck();
    });
  }

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
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
