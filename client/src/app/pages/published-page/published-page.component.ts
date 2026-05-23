import { Component, inject, OnDestroy, OnInit, signal, computed, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PageApiService, Page } from '../../services/page-api.service';
import { ThemeService } from '../../services/theme.service';
import { CanvasBlock, GlobalStyles } from '../../store/builder.models';
import { TextBlockComponent } from '../../components/blocks/text-block/text-block.component';
import { ImageBlockComponent } from '../../components/blocks/image-block/image-block.component';
import { ButtonBlockComponent } from '../../components/blocks/button-block/button-block.component';
import { DividerBlockComponent } from '../../components/blocks/divider-block/divider-block.component';
import { SpacerBlockComponent } from '../../components/blocks/spacer-block/spacer-block.component';
import { VideoBlockComponent } from '../../components/blocks/video-block/video-block.component';
import { ColumnsBlockComponent } from '../../components/blocks/columns-block/columns-block.component';
import { CardBlockComponent } from '../../components/blocks/card-block/card-block.component';
import { FormBlockComponent } from '../../components/blocks/form-block/form-block.component';
import { IconBlockComponent } from '../../components/blocks/icon-block/icon-block.component';
import { HtmlBlockComponent } from '../../components/blocks/html-block/html-block.component';
import { MapBlockComponent } from '../../components/blocks/map-block/map-block.component';
import { SectionBlockComponent } from '../../components/blocks/section-block/section-block.component';
import { AnimateDirective } from '../../directives/animate.directive';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-published-page',
  standalone: true,
  imports: [
    CommonModule,
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
    AnimateDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="loading()" class="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p class="text-gray-400">Loading website...</p>
      </div>
    </div>

    <div *ngIf="error()" class="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div class="text-center max-w-md px-6">
        <h1 class="text-3xl font-bold text-red-500 mb-2">404</h1>
        <p class="text-gray-300 mb-6">{{ error() }}</p>
      </div>
    </div>

    <div *ngIf="!loading() && !error()" class="min-h-screen bg-white" [ngStyle]="getGlobalStyles()">
      <ng-container *ngFor="let block of visibleBlocks(); trackBy: trackByFn">
        <div
          [id]="'block-' + block.id"
          class="block-render"
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

          <app-section-block *ngSwitchCase="'section'" [props]="getActiveProps(block)" [blockId]="block.id" [isEditing]="false">
            <ng-container *ngIf="block.children && block.children.length > 0">
              <div
                *ngFor="let child of block.children"
                [id]="'block-' + child.id"
                [mbAnimate]="child.animation"
                [ngSwitch]="child.type"
                class="section-nested-child w-full">
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
          </app-section-block>
        </div>
      </ng-container>
    </div>
  `
})
export class PublishedPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private pageApi = inject(PageApiService);
  private themeService = inject(ThemeService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  loading = signal(true);
  error = signal<string | null>(null);
  blocks = signal<CanvasBlock[]>([]);
  isMobile = signal(window.innerWidth <= 768);

  globalStyles = signal<GlobalStyles>({
    fontFamily: 'Inter, sans-serif',
    primaryColor: '#3b82f6',
    secondaryColor: '#111827',
    accentColor: '#10b981',
    baseFontSize: '16px'
  });

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

  @HostListener('window:resize')
  onResize() {
    this.isMobile.set(window.innerWidth <= 768);
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.loadPublishedPage(slug);
      } else {
        this.error.set('No slug provided');
        this.loading.set(false);
      }
    });
  }

  loadPublishedPage(slug: string) {
    this.pageApi.getPublishedPage(slug).subscribe({
      next: (page: Page) => {
        this.blocks.set(page.blocks || []);
        if (page.globalStyles) {
          this.globalStyles.set(page.globalStyles);
        }
        if (page.settings) {
          this.themeService.restoreFromPage(page.settings.themeId, page.settings.customTheme);
        }
        this.setSEO(page);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set(err.error?.message || 'Page not found or not published.');
        this.loading.set(false);
      }
    });
  }

  ngOnDestroy() {
  }

  getActiveProps(block: CanvasBlock): any {
    if (this.isMobile() && block.mobileProps) {
      return { ...block.props, ...block.mobileProps };
    }
    return block.props;
  }

  isBlockVisible(block: CanvasBlock): boolean {
    if (block.hidden) return false;
    if (this.isMobile()) {
      return block.visibility?.mobile !== false;
    } else {
      return block.visibility?.desktop !== false;
    }
  }

  setSEO(page: Page) {
    const title = page.metaTitle || page.title || 'MyBuilder Website';
    this.titleService.setTitle(title);

    if (page.metaDescription) {
      this.metaService.updateTag({ name: 'description', content: page.metaDescription });
      this.metaService.updateTag({ property: 'og:description', content: page.metaDescription });
    }
    
    this.metaService.updateTag({ property: 'og:title', content: title });

    if (page.ogImage) {
      this.metaService.updateTag({ property: 'og:image', content: page.ogImage });
    }

    if (page.canonicalUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel='canonical']");
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', page.canonicalUrl);
    }
  }

  trackByFn(index: number, item: CanvasBlock) {
    return item.id;
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

  getSectionStyles(block: CanvasBlock) {
    const props = this.getActiveProps(block);
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
