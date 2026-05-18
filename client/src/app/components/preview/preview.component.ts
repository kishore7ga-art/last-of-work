import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, X, Monitor, Tablet, Smartphone } from 'lucide-angular';
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
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';

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
    AnimateOnScrollDirective
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
          
          <ng-container *ngFor="let block of blocks(); trackBy: trackByFn">
            <ng-container *ngIf="!block.hidden">
              <div
                animateOnScroll
                [animationType]="block.props.animation || 'none'"
                [animationDelay]="block.props.animationDelay || 0"
                [animationDuration]="block.props.animationDuration || 600"
                [ngSwitch]="block.type">
                  <app-text-block 
                    *ngSwitchCase="'text'" 
                    [props]="block.props"
                    [blockId]="block.id"
                    [isHeading]="false">
                  </app-text-block>
                  
                  <app-text-block 
                    *ngSwitchCase="'heading'" 
                    [props]="block.props"
                    [blockId]="block.id"
                    [isHeading]="true">
                  </app-text-block>
                  
                  <app-image-block 
                    *ngSwitchCase="'image'" 
                    [props]="block.props">
                  </app-image-block>
                  
                  <app-button-block 
                    *ngSwitchCase="'button'" 
                    [props]="block.props">
                  </app-button-block>

                  <app-divider-block
                    *ngSwitchCase="'divider'"
                    [props]="block.props">
                  </app-divider-block>

                  <app-spacer-block
                    *ngSwitchCase="'spacer'"
                    [props]="block.props">
                  </app-spacer-block>

                  <app-video-block
                    *ngSwitchCase="'video'"
                    [props]="block.props">
                  </app-video-block>

                  <app-columns-block
                    *ngSwitchCase="'columns'"
                    [props]="block.props">
                  </app-columns-block>

                  <app-card-block
                    *ngSwitchCase="'card'"
                    [props]="block.props">
                  </app-card-block>

                  <app-form-block
                    *ngSwitchCase="'form'"
                    [props]="block.props">
                  </app-form-block>

                  <input
                    *ngSwitchCase="'input'"
                    [type]="block.props.inputType || 'text'"
                    [placeholder]="block.props.placeholder || 'Enter text...'"
                    [ngStyle]="getInputStyles(block)" />

                  <app-icon-block
                    *ngSwitchCase="'icon'"
                    [props]="block.props">
                  </app-icon-block>

                  <app-html-block
                    *ngSwitchCase="'html'"
                    [props]="block.props">
                  </app-html-block>

                  <app-map-block
                    *ngSwitchCase="'map'"
                    [props]="block.props">
                  </app-map-block>
                  
                  <div 
                    *ngSwitchCase="'section'"
                    [ngStyle]="getSectionStyles(block)">
                  </div>
              </div>
            </ng-container>
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
    const props = block.props;
    return {
      'background-color': props.backgroundColor,
      'padding': props.padding,
      'min-height': props.minHeight,
      'width': props.width,
      'margin': props.margin,
      'border': props.border
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
