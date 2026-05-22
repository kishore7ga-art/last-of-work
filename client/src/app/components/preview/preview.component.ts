import { Component, inject, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { StorageService } from '../../services/storage.service';
import { PageApiService } from '../../services/page-api.service';
import { CanvasBlock, GlobalStyles } from '../../store/builder.models';
import { TextBlockComponent } from '../blocks/text-block/text-block.component';
import { ImageBlockComponent } from '../blocks/image-block/image-block.component';
import { ButtonBlockComponent } from '../blocks/button-block/button-block.component';
import { DividerBlockComponent } from '../blocks/divider-block/divider-block.component';
import { SpacerBlockComponent } from '../blocks/spacer-block/spacer-block.component';
import { VideoBlockComponent } from '../blocks/video-block/video-block.component';
import { ColumnsBlockComponent } from '../blocks/columns-block/columns-block.component';
import { CardBlockComponent } from '../blocks/card-block/card-block.component';
import { FormBlockComponent } from '../blocks/form-block/form-block.component';
import { IconBlockComponent } from '../blocks/icon-block/icon-block.component';
import { HtmlBlockComponent } from '../blocks/html-block/html-block.component';
import { MapBlockComponent } from '../blocks/map-block/map-block.component';
import { AnimateDirective } from '../../directives/animate.directive';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [
    CommonModule, 
    LucideAngularModule, 
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
    AnimateDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 bg-gray-950 z-50 flex flex-col">
      <!-- Toolbar -->
      <div class="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 text-white flex-shrink-0">
        <div class="flex items-center space-x-2">
          <span class="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs font-bold uppercase tracking-wider">Preview Mode</span>
        </div>
        
        <div class="flex items-center bg-gray-800 rounded-lg p-1 space-x-1">
          <button 
            (click)="setDevice('desktop')"
            class="p-1.5 rounded-md transition-colors"
            [class.bg-gray-700]="device() === 'desktop'"
            [class.text-blue-400]="device() === 'desktop'">
            <lucide-icon name="monitor" [size]="18"></lucide-icon>
          </button>
          <button 
            (click)="setDevice('tablet')"
            class="p-1.5 rounded-md transition-colors"
            [class.bg-gray-700]="device() === 'tablet'"
            [class.text-blue-400]="device() === 'tablet'">
            <lucide-icon name="tablet" [size]="18"></lucide-icon>
          </button>
          <button 
            (click)="setDevice('mobile')"
            class="p-1.5 rounded-md transition-colors"
            [class.bg-gray-700]="device() === 'mobile'"
            [class.text-blue-400]="device() === 'mobile'">
            <lucide-icon name="smartphone" [size]="18"></lucide-icon>
          </button>
        </div>

        <button 
          (click)="closePreview()"
          class="flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors text-sm">
          <lucide-icon name="x" [size]="18"></lucide-icon>
          <span>Close Preview</span>
        </button>
      </div>

      <!-- Preview Area -->
      <div class="flex-1 bg-gray-800 overflow-y-auto flex justify-center p-8">
        <div 
          class="bg-white shadow-2xl transition-all duration-300 relative rounded-md overflow-hidden min-h-full"
          [ngStyle]="getGlobalStyles()"
          [style.width]="getDeviceWidth()">
          
          <ng-container *ngFor="let block of visibleBlocks(); trackBy: trackByFn">
            <div
              [mbAnimate]="block.animation"
              [ngSwitch]="block.type">
                
                <app-text-block 
                  *ngSwitchCase="'text'" 
                  [props]="getActiveProps(block)"
                  [blockId]="block.id"
                  [isHeading]="false">
                </app-text-block>
                
                <app-text-block 
                  *ngSwitchCase="'heading'" 
                  [props]="getActiveProps(block)"
                  [blockId]="block.id"
                  [isHeading]="true">
                </app-text-block>
                
                <app-image-block 
                  *ngSwitchCase="'image'" 
                  [props]="getActiveProps(block)">
                </app-image-block>
                
                <app-button-block 
                  *ngSwitchCase="'button'" 
                  [props]="getActiveProps(block)">
                </app-button-block>

                <app-divider-block
                  *ngSwitchCase="'divider'"
                  [props]="getActiveProps(block)">
                </app-divider-block>

                <app-spacer-block
                  *ngSwitchCase="'spacer'"
                  [props]="getActiveProps(block)">
                </app-spacer-block>

                <app-video-block
                  *ngSwitchCase="'video'"
                  [props]="getActiveProps(block)">
                </app-video-block>

                <app-columns-block
                  *ngSwitchCase="'columns'"
                  [props]="getActiveProps(block)">
                </app-columns-block>

                <app-card-block
                  *ngSwitchCase="'card'"
                  [props]="getActiveProps(block)">
                </app-card-block>

                <app-form-block
                  *ngSwitchCase="'form'"
                  [props]="getActiveProps(block)">
                </app-form-block>

                <input
                  *ngSwitchCase="'input'"
                  [type]="getActiveProps(block)['inputType'] || 'text'"
                  [placeholder]="getActiveProps(block)['placeholder'] || 'Enter text...'"
                  [ngStyle]="getInputStyles(block)" />

                <app-icon-block
                  *ngSwitchCase="'icon'"
                  [props]="getActiveProps(block)">
                </app-icon-block>

                <app-html-block
                  *ngSwitchCase="'html'"
                  [props]="getActiveProps(block)">
                </app-html-block>

                <app-map-block
                  *ngSwitchCase="'map'"
                  [props]="getActiveProps(block)">
                </app-map-block>
                
                <div 
                  *ngSwitchCase="'section'"
                  [ngStyle]="getSectionStyles(block)"
                  [style.display]="getActiveProps(block)['display'] || 'block'"
                  [style.flex-direction]="getActiveProps(block)['flexDirection']"
                  [style.align-items]="getActiveProps(block)['alignItems']"
                  [style.justify-content]="getActiveProps(block)['justifyContent']"
                  [style.grid-template-columns]="getActiveProps(block)['gridColumns']"
                  [style.gap]="getActiveProps(block)['gap']"
                  [style.box-shadow]="getActiveProps(block)['shadow']"
                  [style.border-radius]="getActiveProps(block)['borderRadius']">
                  <ng-container *ngIf="block.children && block.children.length > 0">
                    <div *ngFor="let child of block.children" [ngSwitch]="child.type" style="width: 100%;">
                      <app-text-block *ngSwitchCase="'text'" [props]="getActiveProps(child)" [blockId]="child.id" [isHeading]="false"></app-text-block>
                      <app-text-block *ngSwitchCase="'heading'" [props]="getActiveProps(child)" [blockId]="child.id" [isHeading]="true"></app-text-block>
                      <app-image-block *ngSwitchCase="'image'" [props]="getActiveProps(child)"></app-image-block>
                      <app-button-block *ngSwitchCase="'button'" [props]="getActiveProps(child)"></app-button-block>
                      <app-divider-block *ngSwitchCase="'divider'" [props]="getActiveProps(child)"></app-divider-block>
                      <app-spacer-block *ngSwitchCase="'spacer'" [props]="getActiveProps(child)"></app-spacer-block>
                      <app-video-block *ngSwitchCase="'video'" [props]="getActiveProps(child)"></app-video-block>
                      <app-icon-block *ngSwitchCase="'icon'" [props]="getActiveProps(child)"></app-icon-block>
                      <app-html-block *ngSwitchCase="'html'" [props]="getActiveProps(child)"></app-html-block>
                      <app-map-block *ngSwitchCase="'map'" [props]="getActiveProps(child)"></app-map-block>
                      <input *ngSwitchCase="'input'" [type]="getActiveProps(child)['inputType'] || 'text'" [placeholder]="getActiveProps(child)['placeholder'] || 'Enter text...'" [ngStyle]="getInputStyles(child)" />
                    </div>
                  </ng-container>
                </div>
            </div>
          </ng-container>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PreviewComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private storageService = inject(StorageService);
  private pageApi = inject(PageApiService);

  blocks = signal<CanvasBlock[]>([]);
  globalStyles = signal<GlobalStyles>({
    fontFamily: 'Inter, sans-serif',
    primaryColor: '#3b82f6',
    secondaryColor: '#111827',
    accentColor: '#10b981',
    baseFontSize: '16px'
  });
  device = signal<'desktop' | 'tablet' | 'mobile'>('desktop');
  pageId: string | null = null;

  isMobile = computed(() => this.device() === 'mobile');

  visibleBlocks = computed(() => {
    const raw = this.blocks().filter(block => this.isBlockVisible(block));
    if (this.isMobile()) {
      return [...raw].sort((a, b) => {
        const orderA = a.mobileOrder !== undefined && a.mobileOrder !== null ? a.mobileOrder : 999999;
        const orderB = b.mobileOrder !== undefined && b.mobileOrder !== null ? b.mobileOrder : 999999;
        return orderA - orderB;
      });
    }
    return raw;
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.pageId = params.get('id');
      if (this.pageId && this.pageId !== 'temp') {
        this.pageApi.getPage(this.pageId).subscribe({
          next: (page) => {
            this.blocks.set(page.blocks || []);
            if (page.globalStyles) {
              this.globalStyles.set(page.globalStyles);
            }
          }
        });
      } else {
        const savedBlocks = this.storageService.loadPage();
        if (savedBlocks) {
          this.blocks.set(savedBlocks);
        }
      }
    });
  }

  isBlockVisible(block: CanvasBlock): boolean {
    if (block.hidden) return false;
    if (this.device() === 'mobile') {
      return block.visibility?.mobile !== false;
    }
    if (this.device() === 'tablet') {
      return block.visibility?.tablet !== false;
    }
    return block.visibility?.desktop !== false;
  }

  getActiveProps(block: CanvasBlock): any {
    if (this.device() === 'mobile' && block.mobileProps) {
      return { ...block.props, ...block.mobileProps };
    }
    return block.props;
  }

  setDevice(mode: 'desktop' | 'tablet' | 'mobile') {
    this.device.set(mode);
  }

  getDeviceWidth() {
    switch (this.device()) {
      case 'desktop': return '1200px';
      case 'tablet': return '768px';
      case 'mobile': return '390px';
      default: return '1200px';
    }
  }

  closePreview() {
    if (this.pageId && this.pageId !== 'temp') {
      this.router.navigate(['/editor', this.pageId]);
    } else {
      this.router.navigate(['/editor']);
    }
  }

  trackByFn(index: number, item: CanvasBlock) {
    return item.id;
  }

  getSectionStyles(block: CanvasBlock) {
    const props = this.getActiveProps(block);
    return {
      'background-color': props.backgroundColor,
      'padding': props.padding,
      'min-height': props.minHeight,
      'width': props.width,
      'margin': props.margin,
      'border': props.border,
      'border-radius': props.borderRadius,
      background: props.gradientFrom && props.gradientTo 
        ? `linear-gradient(135deg, ${props.gradientFrom}, ${props.gradientTo})` 
        : (props.src ? `url(${props.src}) center/cover no-repeat` : undefined),
    };
  }

  getInputStyles(block: CanvasBlock) {
    const props = this.getActiveProps(block);
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
    const styles = this.globalStyles();
    return {
      'font-family': styles.fontFamily,
      'font-size': styles.baseFontSize,
      '--builder-primary': styles.primaryColor,
      '--builder-secondary': styles.secondaryColor,
      '--builder-accent': styles.accentColor
    };
  }
}
