import { Component, computed, inject, ChangeDetectionStrategy, OnDestroy, OnInit, signal, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDragHandle,
  CdkDragPreview,
  CdkDragPlaceholder,
  moveItemInArray,
  DragDropModule,
  CdkDragStart,
  CdkDragEnd
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
import { CanvasBlock } from '../../../store/builder.models';
import { ToastService } from '../../../services/toast.service';
import { TEMPLATE_GROUPS } from '../../../data/templates.data';

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
    SectionBlockComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {
  store = inject(BuilderStore);
  private toastService = inject(ToastService);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  previewAnimations = signal(false);
  isDragging = signal(false);

  ngOnInit(): void {
    // Run drag-related listeners outside of Angular's zone to prevent change detection on mousemove
    this.ngZone.runOutsideAngular(() => {
      // Optional: manual document-level event listeners can be configured here if needed.
    });
  }

  onDragStarted(event: CdkDragStart): void {
    this.isDragging.set(true);
  }

  onDragEnded(event: CdkDragEnd): void {
    this.ngZone.run(() => {
      this.isDragging.set(false);
      this.cdr.markForCheck();
    });
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

  hasMobileOverrides(block: CanvasBlock): boolean {
    return block.mobileProps !== undefined && block.mobileProps !== null && Object.keys(block.mobileProps).length > 0;
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
    if (event.previousIndex === event.currentIndex) 
      return;

    this.store.reorderBlocks(
      event.previousIndex,
      event.currentIndex
    );
  }

  // For sidebar drag to canvas:
  onSidebarDrop(event: CdkDragDrop<any>): void {
    if (event.previousContainer === event.container) {
      // Reorder within canvas
      this.store.reorderBlocks(
        event.previousIndex,
        event.currentIndex
      );
    } else {
      // Drop from sidebar to canvas
      const data = event.item.data;
      if (typeof data === 'string') {
        const blockType = data as any;
        this.store.addBlockAt(blockType, event.currentIndex);
      } else if (data?.isNew) {
        this.store.addBlockAt(data.type, event.currentIndex);
      } else if (data?.savedComponent) {
        this.store.addSavedComponentAtIndex(data.savedComponent, event.currentIndex);
      } else if (data?.isTemplate && data.template) {
        const addedBlockIds = this.store.addTemplateBlocks(data.template.blocks, event.currentIndex);
        this.toastService.success(`✓ ${data.template.name} added to canvas`);
      } else if (data) {
        this.store.addBlockAt(data, event.currentIndex);
      }
    }
  }

  trackBlock(index: number, block: CanvasBlock): string {
    return block.id;
  }

  addQuickTemplate(templateId: string) {
    let matched: any = null;
    TEMPLATE_GROUPS.forEach(g => {
      const found = g.templates.find(t => t.id === templateId);
      if (found) {
        matched = found;
      }
    });
    if (matched) {
      const addedBlockIds = this.store.addTemplateBlocks(matched.blocks);
      this.toastService.success(`✓ ${matched.name} added to canvas`);
      setTimeout(() => {
        const element = document.querySelector(`[data-block-id="${addedBlockIds[0]}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }

  getSectionStyles(block: CanvasBlock) {
    const props = this.store.getActiveProps(block);
    const useColors = props['useThemeColors'] !== false;
    const useRadius = props['useThemeRadius'] !== false;

    let bgColor = props.backgroundColor;
    if (useColors && (!bgColor || bgColor === '#ffffff' || bgColor === '#f9fafb' || bgColor === '#f8fafc' || bgColor === '#111827' || bgColor === '#0f172a')) {
      bgColor = 'var(--theme-surface)';
    }

    let radius = props.borderRadius;
    if (useRadius && (!radius || radius === '0px' || radius === '8px')) {
      radius = 'var(--theme-radius-card)';
    }

    return {
      'background-color': bgColor,
      padding: props.padding,
      'min-height': props.minHeight,
      width: props.width,
      margin: props.margin,
      border: props.border,
      'border-radius': radius,
      background: props['gradientFrom'] && props['gradientTo'] 
        ? `linear-gradient(135deg, ${props['gradientFrom']}, ${props['gradientTo']})` 
        : (props.src ? `url(${props.src}) center/cover no-repeat` : undefined),
    };
  }

  getInputStyles(block: CanvasBlock) {
    const props = this.store.getActiveProps(block);
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

  getMobileProps(block: CanvasBlock): any {
    const mobileProps = block.mobileProps;
    const activeProps = this.store.getActiveProps(block);
    if (!mobileProps) return activeProps;
    
    return { ...activeProps, ...mobileProps };
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
