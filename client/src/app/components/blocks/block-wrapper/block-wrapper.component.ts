import { Component, Input, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LucideAngularModule } from 'lucide-angular';
import { CanvasBlock } from '../../../store/builder.models';
import { BuilderStore } from '../../../store/builder.store';
import { ComponentLibraryService } from '../../../services/component-library.service';
import { ToastService } from '../../../services/toast.service';
import { AnimateDirective } from '../../../directives/animate.directive';
import { BlockAnimation } from '../../../models/animation.models';



@Component({
  selector: 'app-block-wrapper',
  standalone: true,
  imports: [CommonModule, DragDropModule, LucideAngularModule, AnimateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="block-frame"
      [mbAnimate]="mbAnimate"
      [mbAnimatePreview]="isPreviewMode"
      [attr.data-block-id]="block.id"
      [class.selected]="isSelected()"
      [class.has-video-selected]="isSelected() && block.type === 'section' && block.props.videoBackground?.enabled"
      [class.hovered]="isHovered && !isSelected()"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
      (contextmenu)="onContextMenu($event)"
      (click)="onSelect($event)">

      <div *ngIf="isSelected()" class="mini-toolbar">
        <span class="toolbar-arrow"></span>
        <button class="mini-btn drag-handle" cdkDragHandle title="Drag">
          <lucide-icon name="grip-vertical" [size]="14"></lucide-icon>
        </button>
        <span class="block-type">{{ block.type }}</span>
        <button class="mini-btn" (click)="onDuplicate($event)" title="Duplicate">
          <lucide-icon name="copy" [size]="13"></lucide-icon>
        </button>
        <button class="mini-btn danger" (click)="onDelete($event)" title="Delete">
          <lucide-icon name="trash-2" [size]="13"></lucide-icon>
        </button>
      </div>

      <div class="block-content" [class.hidden-block]="block.hidden">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .block-frame {
      position: relative;
      width: 100%;
      outline: 0 solid transparent;
      transition: outline-color 100ms ease, box-shadow 100ms ease, transform 150ms ease, opacity 100ms ease;
    }
    .block-frame.hovered { outline: 1px dashed var(--border-active); }
    .block-frame.selected {
      outline: 2px solid var(--accent-blue);
      box-shadow: 0 0 0 4px rgba(79, 110, 247, 0.15);
      z-index: 3;
    }
    .block-frame.has-video-selected {
      outline: 2px solid #a855f7 !important;
      box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.15) !important;
    }
    .block-frame.has-video-selected .mini-toolbar,
    .block-frame.has-video-selected .toolbar-arrow {
      background: #a855f7 !important;
    }
    .mini-toolbar {
      position: absolute;
      left: 10px;
      top: -34px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 0 8px;
      border-radius: 20px;
      background: var(--accent-blue);
      color: white;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
      z-index: 10;
    }
    .toolbar-arrow {
      position: absolute;
      left: 18px;
      bottom: -5px;
      width: 10px;
      height: 10px;
      transform: rotate(45deg);
      background: var(--accent-blue);
    }
    .mini-btn { width: 20px; height: 20px; display: grid; place-items: center; border-radius: 999px; position: relative; z-index: 1; transition: background 150ms ease; }
    .mini-btn:hover { background: rgba(255,255,255,0.16); }
    .mini-btn.danger:hover { background: var(--danger); }
    .drag-handle { cursor: grab; }
    .block-type { position: relative; z-index: 1; font-size: 11px; font-weight: 700; text-transform: capitalize; padding: 0 4px; }
    .hidden-block { opacity: 0.5; }
  `]
})
export class BlockWrapperComponent {
  @Input() block!: CanvasBlock;
  @Input() isPreviewMode = false;
  @Input() isMobile = false;
  @Input() mbAnimate?: BlockAnimation;

  private store = inject(BuilderStore);
  private library = inject(ComponentLibraryService);
  private toast = inject(ToastService);

  isHovered = false;
  isSelected = computed(() => this.store.selectedBlockId() === this.block.id);

  onMouseEnter() {
    this.isHovered = true;
    this.store.hoveredBlockId.set(this.block.id);
  }

  onMouseLeave() {
    this.isHovered = false;
    if (this.store.hoveredBlockId() === this.block.id) this.store.hoveredBlockId.set(null);
  }

  onSelect(event: MouseEvent) {
    event.stopPropagation();
    this.store.selectBlock(this.block.id);
  }

  onDelete(event: MouseEvent) {
    event.stopPropagation();
    this.store.deleteBlock(this.block.id);
  }

  onDuplicate(event: MouseEvent) {
    event.stopPropagation();
    this.store.duplicateBlock(this.block.id);
  }

  onContextMenu(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.store.selectBlock(this.block.id);
    const name = window.prompt('Component name', `${this.block.type} component`);
    if (name !== null && name.trim() !== '') {
      this.library.save(name, this.block).subscribe({
        next: () => this.toast.success('Component saved!'),
        error: () => this.toast.error('Failed to save component')
      });
    }
  }
}
