import { Component, inject, ChangeDetectionStrategy, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { LucideAngularModule } from 'lucide-angular';
import { BuilderStore } from '../../../store/builder.store';
import { CanvasBlock } from '../../../store/builder.models';

@Component({
  selector: 'app-mobile-order-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="order-panel-shell">
      <div class="panel-header">
        <div class="header-title">
          <lucide-icon name="smartphone" [size]="16" class="text-orange"></lucide-icon>
          <h3>Mobile Reorder</h3>
        </div>
        <button (click)="close.emit()" class="close-btn" title="Close Panel">
          <lucide-icon name="x" [size]="14"></lucide-icon>
        </button>
      </div>

      <div class="panel-info">
        <p class="info-text">
          Drag to reorder blocks specifically for mobile screen size. This custom sorting does not affect the desktop layout order.
        </p>
      </div>

      <div class="block-list-wrap" cdkDropList (cdkDropListDropped)="drop($event)">
        <div 
          *ngFor="let item of localBlocks(); let idx = index; trackBy: trackByFn" 
          cdkDrag 
          class="reorder-item"
          [class.hidden-item]="item.visibility?.mobile === false">
          
          <div class="drag-handle" cdkDragHandle>
            <lucide-icon name="grip-vertical" [size]="14"></lucide-icon>
          </div>

          <div class="item-icon">
            <lucide-icon [name]="iconFor(item.type)" [size]="14"></lucide-icon>
          </div>

          <div class="item-content">
            <span class="item-title">{{ item.type | titlecase }} block</span>
            <span class="item-preview">{{ getPreviewText(item) }}</span>
          </div>

          <div class="item-actions">
            <button 
              (click)="toggleVisibility(item)" 
              class="action-btn"
              [title]="item.visibility?.mobile !== false ? 'Hide on mobile' : 'Show on mobile'">
              <lucide-icon 
                [name]="item.visibility?.mobile !== false ? 'eye' : 'eye-off'" 
                [size]="13"
                [class.text-muted]="item.visibility?.mobile === false">
              </lucide-icon>
            </button>
            <span *ngIf="item.mobileOrder === undefined || item.mobileOrder === null" class="badge">Auto</span>
            <span *ngIf="item.mobileOrder !== undefined && item.mobileOrder !== null" class="badge custom">#{{ idx + 1 }}</span>
          </div>
        </div>
      </div>

      <div class="panel-actions">
        <button (click)="resetOrder()" class="btn outline">
          Reset Order
        </button>
        <button (click)="saveOrder()" class="btn primary">
          Apply Order
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .order-panel-shell {
      width: 280px;
      height: 100%;
      background: var(--bg-secondary);
      border-right: 1px solid var(--border-subtle);
      color: var(--text-primary);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideIn 200ms ease;
    }
    .panel-header {
      height: 48px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-subtle);
      flex: 0 0 auto;
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .header-title h3 {
      font-size: 13px;
      font-weight: 700;
      color: white;
    }
    .text-orange {
      color: #f97316;
    }
    .close-btn {
      color: var(--text-muted);
      padding: 4px;
      border-radius: 4px;
      display: grid;
      place-items: center;
      transition: all 150ms ease;
    }
    .close-btn:hover {
      color: white;
      background: var(--bg-tertiary);
    }
    .panel-info {
      padding: 12px;
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border-subtle);
      flex: 0 0 auto;
    }
    .info-text {
      font-size: 11px;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    .block-list-wrap {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .reorder-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      transition: all 150ms ease;
    }
    .reorder-item.cdk-drag-preview {
      background: #242538;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      opacity: 0.9;
    }
    .reorder-item.cdk-drag-placeholder {
      opacity: 0.3;
      border: 1px dashed var(--accent-blue);
    }
    .hidden-item {
      opacity: 0.4;
      background: var(--bg-primary);
    }
    .drag-handle {
      cursor: grab;
      color: var(--text-muted);
      display: grid;
      place-items: center;
    }
    .item-icon {
      color: var(--text-secondary);
      display: grid;
      place-items: center;
    }
    .item-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .item-title {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-primary);
    }
    .item-preview {
      font-size: 9px;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .item-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .action-btn {
      color: var(--text-secondary);
      padding: 4px;
      border-radius: 4px;
      display: grid;
      place-items: center;
      background: transparent;
      border: none;
      cursor: pointer;
    }
    .action-btn:hover {
      color: white;
      background: var(--bg-elevated);
    }
    .text-muted {
      color: var(--text-muted) !important;
    }
    .badge {
      font-size: 9px;
      font-weight: 700;
      color: var(--text-muted);
      background: var(--bg-elevated);
      padding: 2px 6px;
      border-radius: 4px;
    }
    .badge.custom {
      color: white;
      background: #f97316;
    }
    .panel-actions {
      padding: 12px;
      border-top: 1px solid var(--border-subtle);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      background: var(--bg-primary);
      flex: 0 0 auto;
    }
    .btn {
      height: 32px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 150ms ease;
      cursor: pointer;
      background: transparent;
      border: none;
    }
    .btn.outline {
      color: var(--text-primary);
      border: 1px solid var(--border-subtle);
    }
    .btn.outline:hover {
      background: var(--bg-tertiary);
    }
    .btn.primary {
      color: white;
      background: linear-gradient(135deg, #f97316, #ea580c);
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
    }
    .btn.primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(249, 115, 22, 0.3);
    }
    @keyframes slideIn {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }
  `]
})
export class MobileOrderPanelComponent {
  store = inject(BuilderStore);
  @Output() close = new EventEmitter<void>();

  localBlocks = signal<CanvasBlock[]>([]);

  constructor() {
    const list = [...this.store.blocks()].sort((a, b) => {
      const orderA = a.mobileOrder !== undefined && a.mobileOrder !== null ? a.mobileOrder : 999999;
      const orderB = b.mobileOrder !== undefined && b.mobileOrder !== null ? b.mobileOrder : 999999;
      return orderA - orderB;
    });
    this.localBlocks.set(JSON.parse(JSON.stringify(list)));
  }

  drop(event: CdkDragDrop<CanvasBlock[]>) {
    const list = [...this.localBlocks()];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.localBlocks.set(list);
  }

  getPreviewText(block: CanvasBlock): string {
    const content = block.props['content'] || block.props['labelText'] || block.props['cardTitle'] || block.props['label'] || '';
    return content.substring(0, 30);
  }

  toggleVisibility(block: CanvasBlock) {
    const current = block.visibility?.mobile !== false;
    block.visibility = {
      ...(block.visibility || { desktop: true, mobile: true, tablet: true }),
      mobile: !current
    };
    this.localBlocks.update(list => [...list]);
  }

  resetOrder() {
    this.localBlocks.update(list => {
      list.forEach(b => b.mobileOrder = null);
      const originalStoreIds = this.store.blocks().map(b => b.id);
      return [...list].sort((a, b) => originalStoreIds.indexOf(a.id) - originalStoreIds.indexOf(b.id));
    });
  }

  saveOrder() {
    this.localBlocks().forEach((block, idx) => {
      this.store.updateBlockMobileOrder(block.id, idx);
      // Always explicitly set mobile visibility (true = visible, false = hidden)
      const mobileVisible = block.visibility?.mobile !== false;
      this.store.toggleBlockVisibility(block.id, 'mobile', mobileVisible);
    });
    this.close.emit();
  }

  trackByFn(idx: number, item: CanvasBlock) {
    return item.id;
  }

  iconFor(type: string) {
    const map: Record<string, string> = {
      text: 'align-left',
      heading: 'heading',
      image: 'image',
      button: 'mouse-pointer-click',
      section: 'layout',
      divider: 'minus',
      spacer: 'move',
      video: 'play',
      columns: 'columns',
      card: 'credit-card',
      form: 'form-input',
      input: 'text-cursor-input',
      icon: 'smile',
      html: 'code',
      map: 'map-pin'
    };
    return map[type] || 'box';
  }
}
