import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { LucideAngularModule } from 'lucide-angular';
import { BuilderStore } from '../../../store/builder.store';
import { BlockWrapperComponent } from '../../blocks/block-wrapper/block-wrapper.component';
import { TextBlockComponent } from '../../blocks/text-block/text-block.component';
import { ImageBlockComponent } from '../../blocks/image-block/image-block.component';
import { ButtonBlockComponent } from '../../blocks/button-block/button-block.component';
import { DividerBlockComponent } from '../../blocks/divider-block/divider-block.component';
import { SpacerBlockComponent } from '../../blocks/spacer-block/spacer-block.component';
import { VideoBlockComponent } from '../../blocks/video-block/video-block.component';
import { ColumnsBlockComponent } from '../../blocks/columns-block/columns-block.component';
import { CardBlockComponent } from '../../blocks/card-block/card-block.component';
import { FormBlockComponent } from '../../blocks/form-block/form-block.component';
import { IconBlockComponent } from '../../blocks/icon-block/icon-block.component';
import { HtmlBlockComponent } from '../../blocks/html-block/html-block.component';
import { MapBlockComponent } from '../../blocks/map-block/map-block.component';
import { CanvasBlock } from '../../../store/builder.models';
import { AnimateOnScrollDirective } from '../../../directives/animate-on-scroll.directive';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    LucideAngularModule,
    BlockWrapperComponent,
    TextBlockComponent,
    ImageBlockComponent,
    ButtonBlockComponent,
    DividerBlockComponent,
    SpacerBlockComponent,
    VideoBlockComponent,
    ColumnsBlockComponent,
    CardBlockComponent,
    FormBlockComponent,
    IconBlockComponent,
    HtmlBlockComponent,
    MapBlockComponent,
    AnimateOnScrollDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="canvas-shell" (click)="onCanvasClick($event)">
      <div class="canvas-label">{{ deviceLabel() }} &bull; {{ canvasWidth() }}</div>

      <main class="page-surface" [ngStyle]="getGlobalStyles()" [style.width]="canvasWidth()">
        <div cdkDropList id="canvas-list" [cdkDropListConnectedTo]="['sidebar-list']" (cdkDropListDropped)="drop($event)" class="drop-zone">
          <app-block-wrapper *ngFor="let block of blocks(); trackBy: trackByFn" [block]="block" cdkDrag>
            <div
              class="block-render"
              animateOnScroll
              [animationType]="block.props.animation || 'none'"
              [animationDelay]="block.props.animationDelay || 0"
              [animationDuration]="block.props.animationDuration || 600"
              [ngSwitch]="block.type">

              <app-text-block *ngSwitchCase="'text'" [props]="block.props" [blockId]="block.id" [isHeading]="false"></app-text-block>
              <app-text-block *ngSwitchCase="'heading'" [props]="block.props" [blockId]="block.id" [isHeading]="true"></app-text-block>
              <app-image-block *ngSwitchCase="'image'" [props]="block.props"></app-image-block>
              <app-button-block *ngSwitchCase="'button'" [props]="block.props"></app-button-block>
              <app-divider-block *ngSwitchCase="'divider'" [props]="block.props"></app-divider-block>
              <app-spacer-block *ngSwitchCase="'spacer'" [props]="block.props"></app-spacer-block>
              <app-video-block *ngSwitchCase="'video'" [props]="block.props"></app-video-block>
              <app-columns-block *ngSwitchCase="'columns'" [props]="block.props"></app-columns-block>
              <app-card-block *ngSwitchCase="'card'" [props]="block.props"></app-card-block>
              <app-form-block *ngSwitchCase="'form'" [props]="block.props"></app-form-block>
              <app-icon-block *ngSwitchCase="'icon'" [props]="block.props"></app-icon-block>
              <app-html-block *ngSwitchCase="'html'" [props]="block.props"></app-html-block>
              <app-map-block *ngSwitchCase="'map'" [props]="block.props"></app-map-block>

              <input *ngSwitchCase="'input'" [type]="block.props.inputType || 'text'" [placeholder]="block.props.placeholder || 'Enter text...'" [ngStyle]="getInputStyles(block)" />
              <div *ngSwitchCase="'section'" [ngStyle]="getSectionStyles(block)"></div>
            </div>
          </app-block-wrapper>

          <div *ngIf="blocks().length === 0" class="empty-state">
            <div class="empty-icon"><lucide-icon name="plus" [size]="30"></lucide-icon></div>
            <h3>Click a block from the left panel</h3>
            <p>or drag and drop blocks here</p>
          </div>
        </div>
      </main>
    </section>
  `,
  styles: [`
    :host { display: block; height: 100%; min-width: 0; }
    .canvas-shell {
      height: 100%;
      overflow: auto;
      background-color: var(--bg-canvas);
      background-image: radial-gradient(circle, #2a2a3d 1px, transparent 1px);
      background-size: 20px 20px;
      padding: 0 32px 48px;
      position: relative;
    }
    .canvas-label {
      position: sticky;
      top: 0;
      z-index: 4;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      font-size: 12px;
      backdrop-filter: blur(8px);
    }
    .page-surface {
      min-height: 800px;
      margin: 32px auto;
      background: white;
      color: #111827;
      border-radius: 4px;
      box-shadow: 0 8px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px #2a2a3d;
      transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
      overflow: visible;
    }
    .drop-zone { min-height: 800px; position: relative; padding-bottom: 36px; }
    .block-render { animation: blockDrop 150ms ease; }
    .empty-state {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      pointer-events: none;
    }
    .empty-state > div, .empty-state h3, .empty-state p {
      width: min(360px, calc(100% - 48px));
    }
    .empty-icon {
      height: 92px;
      display: grid;
      place-items: center;
      border: 2px dashed #2a2a3d;
      border-radius: 12px 12px 0 0;
      border-bottom: 0;
      color: #4f6ef7;
    }
    .empty-state h3 {
      text-align: center;
      border-left: 2px dashed #2a2a3d;
      border-right: 2px dashed #2a2a3d;
      padding-top: 6px;
      font-weight: 700;
      color: #374151;
    }
    .empty-state p {
      text-align: center;
      border: 2px dashed #2a2a3d;
      border-top: 0;
      border-radius: 0 0 12px 12px;
      padding: 3px 0 20px;
      font-size: 12px;
    }
    .cdk-drag-preview { box-sizing: border-box; border-radius: 8px; box-shadow: 0 14px 42px rgba(0, 0, 0, 0.35); opacity: 0.95; }
    .cdk-drag-placeholder {
      opacity: 1;
      min-height: 4px;
      margin: 8px 0;
      border-radius: 999px;
      background: var(--accent-blue);
      box-shadow: 0 0 0 4px rgba(79, 110, 247, 0.16);
    }
    .cdk-drag-animating, .cdk-drop-list-dragging app-block-wrapper:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    input { display: block; }
    @keyframes blockDrop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class CanvasComponent {
  store = inject(BuilderStore);
  blocks = this.store.blocks;

  canvasWidth = computed(() => {
    switch (this.store.previewMode()) {
      case 'desktop': return '1200px';
      case 'tablet': return '768px';
      case 'mobile': return '390px';
      default: return '1200px';
    }
  });

  deviceLabel = computed(() => {
    const mode = this.store.previewMode();
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  });

  onCanvasClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('canvas-shell') || (event.target as HTMLElement).classList.contains('drop-zone')) {
      this.store.clearSelection();
    }
  }

  drop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) {
      if (event.previousIndex !== event.currentIndex) {
        this.store.reorderBlocks(event.previousIndex, event.currentIndex);
      }
      return;
    }

    const data = event.item.data;
    if (data?.isNew) {
      this.store.addBlockAtIndex(data.type, event.currentIndex);
    } else if (data?.savedComponent) {
      this.store.addSavedComponentAtIndex(data.savedComponent, event.currentIndex);
    }
  }

  trackByFn(index: number, item: CanvasBlock) { return item.id; }

  getSectionStyles(block: CanvasBlock) {
    const props = block.props;
    return {
      'background-color': props.backgroundColor,
      padding: props.padding,
      'min-height': props.minHeight,
      width: props.width,
      margin: props.margin,
      border: props.border
    };
  }

  getInputStyles(block: CanvasBlock) {
    const props = block.props;
    return {
      width: props.width,
      padding: props.padding,
      border: props.border,
      'border-radius': props.borderRadius,
      color: props.color,
      'background-color': props.backgroundColor,
      margin: props.margin
    };
  }

  getGlobalStyles() {
    const styles = this.store.globalStyles();
    return {
      'font-family': styles.fontFamily,
      'font-size': styles.baseFontSize,
      '--builder-primary': styles.primaryColor,
      '--builder-secondary': styles.secondaryColor,
      '--builder-accent': styles.accentColor
    };
  }
}
