import { Component, Input, computed, inject, ChangeDetectionStrategy, signal } from '@angular/core';
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
  host: {
    '[class.selected]': 'isSelected()',
    '[class.hovered]': 'isHovered()',
    '(click)': 'onSelect($event)',
    '(mouseenter)': 'onHover()',
    '(mouseleave)': 'onHoverEnd()',
    '(contextmenu)': 'onContextMenu($event)'
  },
  templateUrl: './block-wrapper.component.html',
  styleUrls: ['./block-wrapper.component.scss']
})
export class BlockWrapperComponent {
  @Input() block!: CanvasBlock;
  @Input() isPreviewMode = false;
  @Input() isMobile = false;
  @Input() mbAnimate?: BlockAnimation;

  private store = inject(BuilderStore);
  private library = inject(ComponentLibraryService);
  private toast = inject(ToastService);

  private _hovered = signal(false);
  isHovered = this._hovered.asReadonly();
  isSelected = computed(() => this.store.selectedBlockId() === this.block?.id);

  onHover() {
    this._hovered.set(true);
  }

  onHoverEnd() {
    this._hovered.set(false);
  }

  onSelect(event: MouseEvent) {
    event.stopPropagation();
    this.store.selectBlock(this.block.id);
  }

  onDelete(event: MouseEvent) {
    event.stopPropagation();
    this.store.deleteBlock(this.block.id);
  }

  delete(event: MouseEvent) {
    this.onDelete(event);
  }

  onDuplicate(event: MouseEvent) {
    event.stopPropagation();
    this.store.duplicateBlock(this.block.id);
  }

  duplicate(event: MouseEvent) {
    this.onDuplicate(event);
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
