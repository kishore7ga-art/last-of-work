import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PageApiService, Page } from '../../services/page-api.service';
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
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';
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
    AnimateOnScrollDirective
  ],
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
          </div>
        </ng-container>
      </ng-container>
    </div>
  `
})
export class PublishedPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private pageApi = inject(PageApiService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  loading = signal(true);
  error = signal<string | null>(null);
  blocks = signal<CanvasBlock[]>([]);
  globalStyles = signal<GlobalStyles>({
    fontFamily: 'Inter, sans-serif',
    primaryColor: '#3b82f6',
    secondaryColor: '#111827',
    accentColor: '#10b981',
    baseFontSize: '16px'
  });

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
    this.pageApi.getPublicPage(slug).subscribe({
      next: (page) => {
        this.blocks.set(page.blocks || []);
        if (page.globalStyles) {
          this.globalStyles.set(page.globalStyles);
        }
        this.setSEO(page);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Page not found or not published.');
        this.loading.set(false);
      }
    });
  }

  setSEO(page: Page) {
    // Set Document Title
    const title = page.metaTitle || page.title || 'MyBuilder Website';
    this.titleService.setTitle(title);

    // Set SEO Meta tags
    if (page.metaDescription) {
      this.metaService.updateTag({ name: 'description', content: page.metaDescription });
      this.metaService.updateTag({ property: 'og:description', content: page.metaDescription });
    }
    
    this.metaService.updateTag({ property: 'og:title', content: title });

    if (page.ogImage) {
      this.metaService.updateTag({ property: 'og:image', content: page.ogImage });
    }

    if (page.canonicalUrl) {
      // Find or create link canonical tag
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
