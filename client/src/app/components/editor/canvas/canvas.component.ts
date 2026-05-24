import { Component, computed, inject, ChangeDetectionStrategy, OnDestroy, OnInit, signal, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDragHandle,
  CdkDragPreview,
  CdkDragPlaceholder,
  DragDropModule
} from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
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
import { SectionBlockComponent } from '../../blocks/section-block/section-block.component';
import { FallbackBlockComponent } from '../../blocks/fallback-block/fallback-block.component';
import { CanvasBlock } from '../../../store/builder.models';
import { ToastService } from '../../../services/toast.service';
import { TEMPLATE_GROUPS } from '../../../data/templates.data';
import { Type } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    ScrollingModule,
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
    SectionBlockComponent,
    FallbackBlockComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit, OnDestroy {
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  store = inject(BuilderStore);
  environment = environment;
  private toastService = inject(ToastService);

  private componentRegistry = new Map<string, Type<any>>([
    ['text',        TextBlockComponent],
    ['heading',     TextBlockComponent], // Map heading to TextBlockComponent
    ['image',       ImageBlockComponent],
    ['button',      ButtonBlockComponent],
    ['section',     SectionBlockComponent],
    ['divider',     DividerBlockComponent],
    ['spacer',      SpacerBlockComponent],
    ['video',       VideoBlockComponent],
    ['columns',     ColumnsBlockComponent],
    ['card',        CardBlockComponent],
    ['form',        FormBlockComponent],
    ['html',        HtmlBlockComponent],
    ['icon',        IconBlockComponent],
    ['map',         MapBlockComponent],
  ]);

  getComponent(type: string): Type<any> {
    const comp = this.componentRegistry.get(type);
    if (!comp) {
      console.warn(
        `⚠️ No component for type: "${type}"`,
        '\nAvailable types:',
        [...this.componentRegistry.keys()]
      );
      return FallbackBlockComponent;
    }
    return comp;
  }

  getComponentInputs(block: CanvasBlock): any {
    return {
      props: this.store.getActiveProps(block),
      blockId: block.id,
      isHeading: block.type === 'heading',
      isEditing: true
    };
  }

  getMobileProps(block: CanvasBlock): any {
    const activeProps = this.store.getActiveProps(block);
    const mobileProps = block.mobileProps || {};
    return {
      props: { ...activeProps, ...mobileProps },
      blockId: block.id,
      isHeading: block.type === 'heading',
      isEditing: true
    };
  }

  previewAnimations = signal(false);
  isDragging = signal(false);
  private dragListenerCleanups: Array<() => void> = [];

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      const started = () => {
        this.ngZone.run(() => {
          this.isDragging.set(true);
          this.cdr.markForCheck();
        });
      };
      const ended = () => {
        this.ngZone.run(() => {
          this.isDragging.set(false);
          this.cdr.markForCheck();
        });
      };

      document.addEventListener('cdkDragStarted', started, { passive: true });
      document.addEventListener('cdkDragEnded', ended, { passive: true });
      this.dragListenerCleanups.push(
        () => document.removeEventListener('cdkDragStarted', started),
        () => document.removeEventListener('cdkDragEnded', ended)
      );
    });
  }

  ngOnDestroy(): void {
    this.dragListenerCleanups.forEach(cleanup => cleanup());
    this.dragListenerCleanups = [];
  }

  toggleAnimPreview() {
    this.previewAnimations.update(v => !v);
  }

  blocks = computed(() => {
    const rawBlocks = this.store.blocks();
    if (this.store.previewMode() === 'mobile') {
      return [...rawBlocks].sort((a, b) => {
        const orderA = a.mobileOrder !== undefined && a.mobileOrder !== null ? a.mobileOrder : 999999;
        const orderB = b.mobileOrder !== undefined && b.mobileOrder !== null ? b.mobileOrder : 999999;
        return orderA - orderB;
      });
    }
    return rawBlocks;
  });

  canvasWidth = computed(() => {
    const mode = this.store.previewMode();
    const editMode = this.store.editMode();
    
    if (editMode === 'mobile') return 390;
    
    switch(mode) {
      case 'mobile':  return 390;
      case 'tablet':  return 768;
      default:        return 1200;
    }
  });

  isMobileView = computed(() =>
    this.store.previewMode() === 'mobile' ||
    this.store.editMode() === 'mobile'
  );

  deviceLabel = computed(() => {
    const mode = this.store.previewMode();
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  });

  isBlockHidden(block: CanvasBlock): boolean {
    const mode = this.store.previewMode();
    if (mode === 'mobile') {
      return block.visibility?.mobile === false;
    }
    if (mode === 'tablet') {
      return block.visibility?.tablet === false;
    }
    if (mode === 'desktop') {
      return block.visibility?.desktop === false;
    }
    return false;
  }

  onCanvasClick(event: MouseEvent) {
    if (
      (event.target as HTMLElement).classList.contains('canvas-shell') || 
      (event.target as HTMLElement).classList.contains('drop-zone') || 
      (event.target as HTMLElement).classList.contains('phone-screen-container')
    ) {
      this.store.clearSelection();
    }
  }

  onBlockDrop(event: CdkDragDrop<CanvasBlock[]>): void {
    this.ngZone.run(() => {
      if (event.previousIndex === event.currentIndex) return;

      this.store.reorderBlocks(
        event.previousIndex,
        event.currentIndex
      );
      this.cdr.markForCheck();
    });
  }

  onSidebarDrop(event: CdkDragDrop<any>): void {
    this.ngZone.run(() => {
      if (event.previousContainer !== event.container) {
        this.store.addBlockAt(
          event.item.data,
          event.currentIndex
        );
      } else {
        this.store.reorderBlocks(
          event.previousIndex,
          event.currentIndex
        );
      }
      this.cdr.markForCheck();
    });
  }

  trackBlock = (i: number, b: CanvasBlock) => b.id;

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
