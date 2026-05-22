import { Component, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { BuilderStore } from '../../../store/builder.store';
import { PageApiService } from '../../../services/page-api.service';
import { CanvasBlock, VideoBackground, getDefaultVideoBackground } from '../../../store/builder.models';
import { DeviceTabComponent } from '../device-tab/device-tab.component';
import { VideoService } from '../../../services/video.service';
import { AnimationPanelComponent } from '../animation-panel/animation-panel.component';
import { BlockAnimation } from '../../../models/animation.models';

@Component({
  selector: 'app-right-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DeviceTabComponent, AnimationPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="right-shell">
      <ng-container *ngIf="selectedBlock() as block; else emptyState">
        <div class="block-info">
          <div class="block-icon">
            <lucide-icon [name]="iconFor(block.type)" [size]="16"></lucide-icon>
          </div>
          <div>
            <h3>{{ block.type }} block</h3>
            <p>#{{ block.id.substring(0, 8) }}</p>
          </div>
        </div>

        <!-- Premium Device Selector Tab Row -->
        <app-device-tab></app-device-tab>

        <!-- Sync / Customize indicator when in mobile edit mode -->
        <div *ngIf="store.editMode() === 'mobile'" class="mobile-sync-info-box">
          <div *ngIf="!block.mobileProps" class="info-card">
            <lucide-icon name="info" [size]="14" class="text-blue"></lucide-icon>
            <div class="card-desc">
              <span class="title">Using Desktop Styles</span>
              <p>Mobile views currently inherit all desktop style configurations.</p>
            </div>
            <button class="custom-btn" (click)="customizeForMobile(block.id)">Customize Mobile</button>
          </div>
          
          <div *ngIf="block.mobileProps" class="info-card active">
            <lucide-icon name="check-circle" [size]="14" class="text-orange"></lucide-icon>
            <div class="card-desc">
              <span class="title">Mobile Overrides Active</span>
              <p>Custom mobile style overrides are configured for this block.</p>
            </div>
            <button class="reset-btn" (click)="resetMobileStyles(block.id)">Reset to Desktop</button>
          </div>
        </div>

        <div class="tab-row">
          <button [class.active]="activeTab() === 'style'" (click)="activeTab.set('style')">Style</button>
          <button [class.active]="activeTab() === 'layout'" (click)="activeTab.set('layout')">Layout</button>
          <button *ngIf="block.type === 'section'" [class.active]="activeTab() === 'video'" (click)="activeTab.set('video')">Video</button>
          <button [class.active]="activeTab() === 'animate'" (click)="activeTab.set('animate')">Animate</button>
          <button [class.active]="activeTab() === 'advanced'" (click)="activeTab.set('advanced')">Advanced</button>
        </div>

        <div class="panel-scroll" [class.mobile-active-scroll]="store.editMode() === 'mobile' && block.mobileProps">
          <ng-container *ngIf="activeTab() === 'style'">
            <section class="panel-section">
              <span class="section-title">
                Content 
                <span class="badge" *ngIf="store.editMode() === 'mobile'">(Mobile)</span>
              </span>

              <div *ngIf="store.editMode() === 'mobile'" class="content-shared-warning">
                <lucide-icon name="info" [size]="12"></lucide-icon>
                <span>Text content & URLs are shared across desktop and mobile screens. Only style parameters differ.</span>
              </div>

              <label *ngIf="block.type === 'text' || block.type === 'heading'">
                <span>Text Content</span>
                <textarea class="input-field" [ngModel]="block.props['content']" (ngModelChange)="updateSharedContent('content', $event)"></textarea>
              </label>

              <label *ngIf="block.type === 'heading'">
                <span>Level</span>
                <select class="input-field" [ngModel]="block.props['level'] || 'h2'" (ngModelChange)="updateSharedContent('level', $event)">
                  <option value="h1">H1</option>
                  <option value="h2">H2</option>
                  <option value="h3">H3</option>
                  <option value="h4">H4</option>
                  <option value="h5">H5</option>
                  <option value="h6">H6</option>
                </select>
              </label>

              <label *ngIf="block.type === 'button'">
                <span>Label</span>
                <input class="input-field" [ngModel]="block.props['label']" (ngModelChange)="updateSharedContent('label', $event)" />
              </label>

              <label *ngIf="block.type === 'button'">
                <span>Link</span>
                <input class="input-field" [ngModel]="block.props['href']" (ngModelChange)="updateSharedContent('href', $event)" />
              </label>

              <label *ngIf="block.type === 'image' || block.type === 'section'">
                <span>Image URL</span>
                <input class="input-field" [ngModel]="block.props['src']" (ngModelChange)="updateSharedContent('src', $event)" />
              </label>

              <label *ngIf="block.type === 'input'">
                <span>Placeholder</span>
                <input class="input-field" [ngModel]="block.props['placeholder']" (ngModelChange)="updateSharedContent('placeholder', $event)" />
              </label>

              <label *ngIf="block.type === 'input'">
                <span>Label Text</span>
                <input class="input-field" [ngModel]="block.props['labelText']" (ngModelChange)="updateSharedContent('labelText', $event)" />
              </label>

              <label *ngIf="block.type === 'input'">
                <span>Input Type</span>
                <select class="input-field" [ngModel]="block.props['inputType'] || 'text'" (ngModelChange)="updateSharedContent('inputType', $event)">
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="tel">Telephone</option>
                  <option value="password">Password</option>
                </select>
              </label>

              <label *ngIf="block.type === 'columns'">
                <span>Number of Columns</span>
                <input class="input-field" type="number" min="1" max="4" [ngModel]="block.props['columns'] || 2" (ngModelChange)="updateSharedContent('columns', +$event)" />
              </label>

              <label *ngIf="block.type === 'video'">
                <span>Video URL</span>
                <input class="input-field" [ngModel]="block.props['videoUrl']" (ngModelChange)="updateSharedContent('videoUrl', $event)" />
              </label>
            </section>

            <section class="panel-section" [class.disabled-style-panel]="store.editMode() === 'mobile' && !block.mobileProps">
              <span class="section-title">
                Typography
                <span class="badge orange" *ngIf="store.editMode() === 'mobile'">(Mobile)</span>
              </span>
              <div class="grid-2">
                <label>
                  <span>Size</span>
                  <input class="input-field" [ngModel]="store.getActiveProps(block)['fontSize']" (ngModelChange)="update('fontSize', $event)" placeholder="16px" />
                </label>
                <label>
                  <span>Weight</span>
                  <select class="input-field" [ngModel]="store.getActiveProps(block)['fontWeight'] || 'normal'" (ngModelChange)="update('fontWeight', $event)">
                    <option value="normal">400</option>
                    <option value="500">500</option>
                    <option value="600">600</option>
                    <option value="bold">700</option>
                  </select>
                </label>
              </div>

              <div class="grid-2">
                <label>
                  <span>Line Height</span>
                  <input class="input-field" [ngModel]="store.getActiveProps(block)['lineHeight']" (ngModelChange)="update('lineHeight', $event)" placeholder="1.2" />
                </label>
                <label>
                  <span>Letter Spacing</span>
                  <input class="input-field" [ngModel]="store.getActiveProps(block)['letterSpacing']" (ngModelChange)="update('letterSpacing', $event)" placeholder="0.05em" />
                </label>
              </div>

              <label>
                <span>Align</span>
                <div class="align-group">
                  <button [class.active]="store.getActiveProps(block)['textAlign'] === 'left'" (click)="update('textAlign', 'left')"><lucide-icon name="align-left" [size]="15"></lucide-icon></button>
                  <button [class.active]="store.getActiveProps(block)['textAlign'] === 'center'" (click)="update('textAlign', 'center')"><lucide-icon name="align-center" [size]="15"></lucide-icon></button>
                  <button [class.active]="store.getActiveProps(block)['textAlign'] === 'right'" (click)="update('textAlign', 'right')"><lucide-icon name="align-right" [size]="15"></lucide-icon></button>
                </div>
              </label>
            </section>

            <section class="panel-section" [class.disabled-style-panel]="store.editMode() === 'mobile' && !block.mobileProps">
              <span class="section-title">
                Theme Sync
                <span class="badge orange" *ngIf="store.editMode() === 'mobile'">(Mobile)</span>
              </span>
              <button class="toggle-row" (click)="update('useThemeColors', store.getActiveProps(block)['useThemeColors'] === false)">
                <span>Use Theme Colors</span>
                <b [class.on]="store.getActiveProps(block)['useThemeColors'] !== false"></b>
              </button>
              <button class="toggle-row" (click)="update('useThemeFonts', store.getActiveProps(block)['useThemeFonts'] === false)">
                <span>Use Theme Fonts</span>
                <b [class.on]="store.getActiveProps(block)['useThemeFonts'] !== false"></b>
              </button>
              <button class="toggle-row" (click)="update('useThemeRadius', store.getActiveProps(block)['useThemeRadius'] === false)">
                <span>Use Theme Radius</span>
                <b [class.on]="store.getActiveProps(block)['useThemeRadius'] !== false"></b>
              </button>
            </section>

            <section class="panel-section" [class.disabled-style-panel]="store.editMode() === 'mobile' && !block.mobileProps">
              <span class="section-title">
                Colors
                <span class="badge orange" *ngIf="store.editMode() === 'mobile'">(Mobile)</span>
              </span>
              <label>
                <span>Text</span>
                <div class="color-row">
                  <input type="color" [ngModel]="store.getActiveProps(block)['color'] || '#111827'" (ngModelChange)="update('color', $event)" />
                  <input class="input-field" [ngModel]="store.getActiveProps(block)['color']" (ngModelChange)="update('color', $event)" placeholder="#111827" />
                </div>
              </label>
              <label>
                <span>Background</span>
                <div class="color-row">
                  <input type="color" [ngModel]="store.getActiveProps(block)['backgroundColor'] || '#ffffff'" (ngModelChange)="update('backgroundColor', $event)" />
                  <input class="input-field" [ngModel]="store.getActiveProps(block)['backgroundColor']" (ngModelChange)="update('backgroundColor', $event)" placeholder="#ffffff" />
                </div>
              </label>

              <!-- Section Gradients -->
              <ng-container *ngIf="block.type === 'section'">
                <label>
                  <span>Gradient From</span>
                  <div class="color-row">
                    <input type="color" [ngModel]="store.getActiveProps(block)['gradientFrom'] || '#4f6ef7'" (ngModelChange)="update('gradientFrom', $event)" />
                    <input class="input-field" [ngModel]="store.getActiveProps(block)['gradientFrom']" (ngModelChange)="update('gradientFrom', $event)" placeholder="#4f6ef7" />
                  </div>
                </label>
                <label>
                  <span>Gradient To</span>
                  <div class="color-row">
                    <input type="color" [ngModel]="store.getActiveProps(block)['gradientTo'] || '#7c3aed'" (ngModelChange)="update('gradientTo', $event)" />
                    <input class="input-field" [ngModel]="store.getActiveProps(block)['gradientTo']" (ngModelChange)="update('gradientTo', $event)" placeholder="#7c3aed" />
                  </div>
                </label>
              </ng-container>

              <!-- Input Border Color -->
              <ng-container *ngIf="block.type === 'input'">
                <label>
                  <span>Border Color</span>
                  <div class="color-row">
                    <input type="color" [ngModel]="store.getActiveProps(block)['borderColor'] || '#cbd5e1'" (ngModelChange)="update('borderColor', $event)" />
                    <input class="input-field" [ngModel]="store.getActiveProps(block)['borderColor']" (ngModelChange)="update('borderColor', $event)" placeholder="#cbd5e1" />
                  </div>
                </label>
              </ng-container>
            </section>
          </ng-container>

          <ng-container *ngIf="activeTab() === 'layout'">
            <!-- Visibility Toggles (Always accessible on layout tab) -->
            <section class="panel-section">
              <span class="section-title">Device Visibility</span>
              <div class="visibility-toggles-grid">
                <button 
                  class="vis-btn" 
                  [class.active]="block.visibility?.desktop !== false" 
                  (click)="store.toggleBlockVisibility(block.id, 'desktop', block.visibility?.desktop === false)">
                  <lucide-icon name="monitor" [size]="13"></lucide-icon>
                  <span>Desktop</span>
                </button>
                <button 
                  class="vis-btn" 
                  [class.active]="block.visibility?.tablet !== false" 
                  (click)="store.toggleBlockVisibility(block.id, 'tablet', block.visibility?.tablet === false)">
                  <lucide-icon name="tablet" [size]="13"></lucide-icon>
                  <span>Tablet</span>
                </button>
                <button 
                  class="vis-btn" 
                  [class.active]="block.visibility?.mobile !== false" 
                  (click)="store.toggleBlockVisibility(block.id, 'mobile', block.visibility?.mobile === false)">
                  <lucide-icon name="smartphone" [size]="13"></lucide-icon>
                  <span>Mobile</span>
                </button>
              </div>
              <div *ngIf="block.visibility?.mobile === false" class="vis-warning animate-fade-in">
                <lucide-icon name="alert-triangle" [size]="12"></lucide-icon>
                <span>Block is hidden on mobile screen layout</span>
              </div>
            </section>

            <!-- Custom Mobile sorting input -->
            <section class="panel-section">
              <span class="section-title">Mobile Sort Order</span>
              <label>
                <span>Sort Sequence Offset</span>
                <input 
                  class="input-field" 
                  type="number" 
                  [ngModel]="block.mobileOrder" 
                  (ngModelChange)="store.updateBlockMobileOrder(block.id, $event !== null ? +$event : null)" 
                  placeholder="Inherited desktop ordering sequence" />
              </label>
            </section>

            <section class="panel-section" [class.disabled-style-panel]="store.editMode() === 'mobile' && !block.mobileProps">
              <span class="section-title">
                Size & Layout
                <span class="badge orange" *ngIf="store.editMode() === 'mobile'">(Mobile)</span>
              </span>
              <div class="grid-2">
                <label><span>Width</span><input class="input-field" [ngModel]="store.getActiveProps(block)['width']" (ngModelChange)="update('width', $event)" /></label>
                <label><span>Height</span><input class="input-field" [ngModel]="store.getActiveProps(block)['height']" (ngModelChange)="update('height', $event)" /></label>
              </div>
              <div class="grid-2">
                <label><span>Radius</span><input class="input-field" [ngModel]="store.getActiveProps(block)['borderRadius']" (ngModelChange)="update('borderRadius', $event)" /></label>
                <label *ngIf="block.type === 'section'"><span>Min Height</span><input class="input-field" [ngModel]="store.getActiveProps(block)['minHeight']" (ngModelChange)="update('minHeight', $event)" placeholder="100px" /></label>
              </div>

              <!-- Section Custom Layout (display, flexDirection, flexAlign, flexJustify, gridColumns, gap, shadow, border) -->
              <ng-container *ngIf="block.type === 'section'">
                <label>
                  <span>Border Style</span>
                  <input class="input-field" [ngModel]="store.getActiveProps(block)['border']" (ngModelChange)="update('border', $event)" placeholder="1px solid #e5e7eb" />
                </label>
                
                <label>
                  <span>Display Layout</span>
                  <select class="input-field" [ngModel]="store.getActiveProps(block)['display'] || 'block'" (ngModelChange)="update('display', $event)">
                    <option value="block">Block</option>
                    <option value="flex">Flexbox</option>
                    <option value="grid">CSS Grid</option>
                  </select>
                </label>

                <!-- Flex options -->
                <div *ngIf="store.getActiveProps(block)['display'] === 'flex'" class="grid-2">
                  <label>
                    <span>Direction</span>
                    <select class="input-field" [ngModel]="store.getActiveProps(block)['flexDirection'] || 'row'" (ngModelChange)="update('flexDirection', $event)">
                      <option value="row">Row (Horizontal)</option>
                      <option value="column">Column (Vertical)</option>
                    </select>
                  </label>
                  <label>
                    <span>Gap</span>
                    <input class="input-field" [ngModel]="store.getActiveProps(block)['gap']" (ngModelChange)="update('gap', $event)" placeholder="16px" />
                  </label>
                </div>
                <div *ngIf="store.getActiveProps(block)['display'] === 'flex'" class="grid-2">
                  <label>
                    <span>Align Items</span>
                    <select class="input-field" [ngModel]="store.getActiveProps(block)['alignItems'] || 'stretch'" (ngModelChange)="update('alignItems', $event)">
                      <option value="stretch">Stretch</option>
                      <option value="center">Center</option>
                      <option value="flex-start">Start</option>
                      <option value="flex-end">End</option>
                    </select>
                  </label>
                  <label>
                    <span>Justify Content</span>
                    <select class="input-field" [ngModel]="store.getActiveProps(block)['justifyContent'] || 'flex-start'" (ngModelChange)="update('justifyContent', $event)">
                      <option value="flex-start">Start</option>
                      <option value="center">Center</option>
                      <option value="flex-end">End</option>
                      <option value="space-between">Space Between</option>
                      <option value="space-around">Space Around</option>
                    </select>
                  </label>
                </div>

                <!-- Grid options -->
                <div *ngIf="store.getActiveProps(block)['display'] === 'grid'" class="grid-2">
                  <label>
                    <span>Grid Columns</span>
                    <input class="input-field" [ngModel]="store.getActiveProps(block)['gridColumns'] || '1fr 1fr'" (ngModelChange)="update('gridColumns', $event)" placeholder="1fr 1fr" />
                  </label>
                  <label>
                    <span>Gap</span>
                    <input class="input-field" [ngModel]="store.getActiveProps(block)['gap']" (ngModelChange)="update('gap', $event)" placeholder="16px" />
                  </label>
                </div>

                <label>
                  <span>Box Shadow</span>
                  <input class="input-field" [ngModel]="store.getActiveProps(block)['shadow']" (ngModelChange)="update('shadow', $event)" placeholder="0 4px 6px rgba(0,0,0,0.1)" />
                </label>
              </ng-container>

              <!-- Columns Custom gap -->
              <ng-container *ngIf="block.type === 'columns'">
                <label>
                  <span>Column Gap</span>
                  <input class="input-field" [ngModel]="store.getActiveProps(block)['gap']" (ngModelChange)="update('gap', $event)" placeholder="20px" />
                </label>
                <button class="toggle-row" (click)="update('stackMobile', !store.getActiveProps(block)['stackMobile'])">
                  <span>Stack on Mobile</span>
                  <b [class.on]="store.getActiveProps(block)['stackMobile']"></b>
                </button>
              </ng-container>
            </section>

            <section class="panel-section" [class.disabled-style-panel]="store.editMode() === 'mobile' && !block.mobileProps">
              <span class="section-title">
                Box Model
                <span class="badge orange" *ngIf="store.editMode() === 'mobile'">(Mobile)</span>
              </span>
              <div class="box-model">
                <input [ngModel]="splitBox(store.getActiveProps(block)['margin'], 0)" (ngModelChange)="updateBox('margin', 0, $event)" placeholder="M top" />
                <div class="box-middle">
                  <input [ngModel]="splitBox(store.getActiveProps(block)['margin'], 3)" (ngModelChange)="updateBox('margin', 3, $event)" placeholder="M left" />
                  <div class="padding-box">
                    <input [ngModel]="splitBox(store.getActiveProps(block)['padding'], 0)" (ngModelChange)="updateBox('padding', 0, $event)" placeholder="P top" />
                    <div class="box-middle">
                      <input [ngModel]="splitBox(store.getActiveProps(block)['padding'], 3)" (ngModelChange)="updateBox('padding', 3, $event)" placeholder="P left" />
                      <div class="center-box">Block</div>
                      <input [ngModel]="splitBox(store.getActiveProps(block)['padding'], 1)" (ngModelChange)="updateBox('padding', 1, $event)" placeholder="P right" />
                    </div>
                    <input [ngModel]="splitBox(store.getActiveProps(block)['padding'], 2)" (ngModelChange)="updateBox('padding', 2, $event)" placeholder="P bottom" />
                  </div>
                  <input [ngModel]="splitBox(store.getActiveProps(block)['margin'], 1)" (ngModelChange)="updateBox('margin', 1, $event)" placeholder="M right" />
                </div>
                <input [ngModel]="splitBox(store.getActiveProps(block)['margin'], 2)" (ngModelChange)="updateBox('margin', 2, $event)" placeholder="M bottom" />
              </div>
            </section>
          </ng-container>

          <ng-container *ngIf="activeTab() === 'video'">
            <section class="panel-section" [class.disabled-style-panel]="store.editMode() === 'mobile' && !block.mobileProps">
              <span class="section-title">
                Video Background
                <span class="badge orange" *ngIf="store.editMode() === 'mobile'">(Mobile)</span>
              </span>

              <button class="toggle-row" (click)="toggleVideoBackground(!block.props.videoBackground?.enabled)">
                <span>Enable Video Background</span>
                <b [class.on]="block.props.videoBackground?.enabled"></b>
              </button>
            </section>

            <ng-container *ngIf="block.props.videoBackground?.enabled">
              <section class="panel-section" [class.disabled-style-panel]="store.editMode() === 'mobile' && !block.mobileProps">
                <span class="section-title">Source Configuration</span>
                
                <label>
                  <span>Video Type</span>
                  <select 
                    class="input-field" 
                    [ngModel]="block.props.videoBackground?.type || 'none'" 
                    (ngModelChange)="updateVideoProperty('type', $event)">
                    <option value="youtube">YouTube</option>
                    <option value="mp4">MP4 Video URL</option>
                  </select>
                </label>

                <!-- YouTube Settings -->
                <ng-container *ngIf="block.props.videoBackground?.type === 'youtube'">
                  <label>
                    <span>YouTube URL or Video ID</span>
                    <input 
                      type="text" 
                      class="input-field"
                      [class.valid-input]="isYoutubeUrlValid()"
                      [class.invalid-input]="block.props.videoBackground?.youtubeUrl && !isYoutubeUrlValid()"
                      [ngModel]="block.props.videoBackground?.youtubeUrl" 
                      (ngModelChange)="updateVideoProperty('youtubeUrl', $event)" 
                      placeholder="e.g. https://youtube.com/watch?v=..." 
                    />
                  </label>
                  
                  <!-- Youtube Thumbnail loader preview -->
                  <div *ngIf="block.props.videoBackground?.youtubeId" class="video-preview-thumb-box">
                    <img 
                      [src]="videoService.getYoutubeThumbnail(block.props.videoBackground?.youtubeId || '')" 
                      alt="YouTube Thumbnail" 
                      class="video-preview-thumb" 
                    />
                    <div class="video-preview-badge">ID: {{ block.props.videoBackground?.youtubeId }}</div>
                  </div>
                </ng-container>

                <!-- MP4 Settings -->
                <ng-container *ngIf="block.props.videoBackground?.type === 'mp4'">
                  <label>
                    <span>MP4 File URL</span>
                    <input 
                      type="text" 
                      class="input-field"
                      [class.valid-input]="isMp4UrlValid()"
                      [class.invalid-input]="block.props.videoBackground?.mp4Url && !isMp4UrlValid()"
                      [ngModel]="block.props.videoBackground?.mp4Url" 
                      (ngModelChange)="updateVideoProperty('mp4Url', $event)" 
                      placeholder="e.g. https://example.com/video.mp4" 
                    />
                  </label>
                </ng-container>
              </section>

              <section class="panel-section" [class.disabled-style-panel]="store.editMode() === 'mobile' && !block.mobileProps">
                <span class="section-title">Playback Settings</span>
                
                <div class="grid-2">
                  <button class="toggle-row" (click)="updateVideoProperty('autoplay', !block.props.videoBackground?.autoplay)">
                    <span>Autoplay</span>
                    <b [class.on]="block.props.videoBackground?.autoplay"></b>
                  </button>

                  <button class="toggle-row" (click)="updateVideoProperty('loop', !block.props.videoBackground?.loop)">
                    <span>Loop</span>
                    <b [class.on]="block.props.videoBackground?.loop"></b>
                  </button>
                </div>

                <button class="toggle-row" (click)="updateVideoProperty('muted', !block.props.videoBackground?.muted)">
                  <span>Mute Audio</span>
                  <b [class.on]="block.props.videoBackground?.muted"></b>
                </button>

                <div class="grid-2">
                  <label>
                    <span>Start Time (s)</span>
                    <input 
                      type="number" 
                      class="input-field" 
                      min="0"
                      [ngModel]="block.props.videoBackground?.startTime ?? 0"
                      (ngModelChange)="updateVideoProperty('startTime', +$event)"
                    />
                  </label>
                  
                  <label>
                    <span>Playback Speed</span>
                    <select 
                      class="input-field"
                      [ngModel]="block.props.videoBackground?.playbackSpeed ?? 1"
                      (ngModelChange)="updateVideoProperty('playbackSpeed', +$event)">
                      <option [value]="0.5">0.5x</option>
                      <option [value]="1">1.0x</option>
                      <option [value]="1.5">1.5x</option>
                      <option [value]="2">2.0x</option>
                    </select>
                  </label>
                </div>
              </section>

              <section class="panel-section" [class.disabled-style-panel]="store.editMode() === 'mobile' && !block.mobileProps">
                <span class="section-title">Visual Overlay</span>
                
                <button class="toggle-row" (click)="updateVideoProperty('overlayEnabled', !block.props.videoBackground?.overlayEnabled)">
                  <span>Enable Overlay</span>
                  <b [class.on]="block.props.videoBackground?.overlayEnabled"></b>
                </button>

                <ng-container *ngIf="block.props.videoBackground?.overlayEnabled">
                  <div class="color-row">
                    <input 
                      type="color" 
                      [ngModel]="block.props.videoBackground?.overlayColor ?? '#000000'"
                      (ngModelChange)="updateVideoProperty('overlayColor', $event)" 
                    />
                    <input 
                      type="text" 
                      class="input-field" 
                      [ngModel]="block.props.videoBackground?.overlayColor ?? '#000000'"
                      (ngModelChange)="updateVideoProperty('overlayColor', $event)" 
                    />
                  </div>

                  <label>
                    <span>Overlay Opacity ({{ block.props.videoBackground?.overlayOpacity ?? 40 }}%)</span>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      [ngModel]="block.props.videoBackground?.overlayOpacity ?? 40"
                      (ngModelChange)="updateVideoProperty('overlayOpacity', +$event)" 
                    />
                  </label>

                  <label>
                    <span>Backdrop Blur ({{ block.props.videoBackground?.overlayBlur ?? 0 }}px)</span>
                    <input 
                      type="range" 
                      min="0" 
                      max="20" 
                      [ngModel]="block.props.videoBackground?.overlayBlur ?? 0"
                      (ngModelChange)="updateVideoProperty('overlayBlur', +$event)" 
                    />
                  </label>
                </ng-container>
              </section>

              <section class="panel-section" [class.disabled-style-panel]="store.editMode() === 'mobile' && !block.mobileProps">
                <span class="section-title">Fallback & Mobile</span>
                
                <label>
                  <span>Desktop Fallback Image</span>
                  <input 
                    type="text" 
                    class="input-field" 
                    [ngModel]="block.props.videoBackground?.fallbackImage"
                    (ngModelChange)="updateVideoProperty('fallbackImage', $event)"
                    placeholder="URL to standard background image"
                  />
                </label>

                <label>
                  <span>Mobile Fallback Image</span>
                  <input 
                    type="text" 
                    class="input-field" 
                    [ngModel]="block.props.videoBackground?.mobileFallbackImage"
                    (ngModelChange)="updateVideoProperty('mobileFallbackImage', $event)"
                    placeholder="URL to mobile background image"
                  />
                </label>
              </section>
            </ng-container>
          </ng-container>

          <ng-container *ngIf="activeTab() === 'advanced'">
            <section class="panel-section" [class.disabled-style-panel]="store.editMode() === 'mobile' && !block.mobileProps">
              <span class="section-title">
                State
                <span class="badge orange" *ngIf="store.editMode() === 'mobile'">(Mobile)</span>
              </span>
              <label>
                <span>Opacity {{ ((store.getActiveProps(block)['opacity'] ?? 1) * 100) | number:'1.0-0' }}%</span>
                <input type="range" min="0" max="1" step="0.05" [ngModel]="store.getActiveProps(block)['opacity'] ?? 1" (ngModelChange)="update('opacity', +$event)" />
              </label>
              <label><span>CSS Class</span><input class="input-field" [ngModel]="store.getActiveProps(block)['class']" (ngModelChange)="update('class', $event)" placeholder="custom-class" /></label>
              <button class="toggle-row" (click)="toggleHidden(block)">
                <span>Hide Block</span>
                <b [class.on]="block.hidden"></b>
              </button>
            </section>
          </ng-container>

          <ng-container *ngIf="activeTab() === 'animate'">
            <app-animation-panel
              [block]="block"
              (animationChange)="onAnimChange($event)">
            </app-animation-panel>
          </ng-container>
        </div>
      </ng-container>

      <ng-template #emptyState>
        <div class="empty-state">
          <lucide-icon name="mouse-pointer" [size]="32"></lucide-icon>
          <h3>Select a block</h3>
          <p>to edit its properties</p>
        </div>
      </ng-template>
    </aside>
  `,
  styles: [`
    :host { display: block; height: 100%; flex: 0 0 260px; }
    .right-shell { width: 260px; height: 100%; background: var(--bg-secondary); border-left: 1px solid var(--border-subtle); color: var(--text-primary); display: flex; flex-direction: column; overflow: hidden; }
    .block-info { height: 48px; flex: 0 0 auto; display: flex; align-items: center; gap: 10px; padding: 0 12px; border-bottom: 1px solid var(--border-subtle); }
    .block-icon { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 6px; background: var(--bg-tertiary); color: var(--accent-teal); }
    .block-info h3 { font-size: 13px; font-weight: 700; text-transform: capitalize; }
    .block-info p { color: var(--text-muted); font-size: 10px; font-family: ui-monospace, monospace; }
    
    /* Device Specific info box styling */
    .mobile-sync-info-box {
      padding: 8px 12px;
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border-subtle);
      flex: 0 0 auto;
    }
    .info-card {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 10px;
      background: rgba(59, 130, 246, 0.08);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 8px;
    }
    .info-card.active {
      background: rgba(249, 115, 22, 0.08);
      border-color: rgba(249, 115, 22, 0.2);
    }
    .info-card lucide-icon { margin-bottom: 2px; }
    .text-blue { color: #3b82f6; }
    .text-orange { color: #f97316; }
    .card-desc span.title { font-size: 11px; font-weight: 700; color: white; display: block; margin-bottom: 2px; }
    .card-desc p { font-size: 10px; color: var(--text-secondary); line-height: 1.4; }
    
    .custom-btn {
      width: 100%; height: 26px; border-radius: 5px; font-size: 10px; font-weight: 700;
      color: white; background: #3b82f6; border: none; cursor: pointer; transition: all 150ms ease;
    }
    .custom-btn:hover { background: #2563eb; }
    
    .reset-btn {
      width: 100%; height: 26px; border-radius: 5px; font-size: 10px; font-weight: 700;
      color: var(--text-primary); border: 1px solid var(--border-subtle); background: var(--bg-tertiary); cursor: pointer; transition: all 150ms ease;
    }
    .reset-btn:hover { background: var(--bg-elevated); }

    /* Visibility grids */
    .visibility-toggles-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
    }
    .vis-btn {
      height: 30px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
      font-size: 9px; font-weight: 700; border-radius: 6px; color: var(--text-muted); background: var(--bg-tertiary);
      border: 1px solid transparent; cursor: pointer; transition: all 150ms ease;
    }
    .vis-btn lucide-icon { color: var(--text-muted); }
    .vis-btn.active {
      color: white; background: var(--bg-elevated); border-color: var(--border-subtle);
    }
    .vis-btn.active lucide-icon { color: var(--accent-teal); }
    
    .vis-warning {
      display: flex; align-items: center; gap: 6px; padding: 8px; border-radius: 6px;
      background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.15);
      color: #f87171; font-size: 10px; font-weight: 600; margin-top: 6px;
    }

    .tab-row { height: 36px; flex: 0 0 auto; display: flex; background: var(--bg-primary); border-bottom: 1px solid var(--border-subtle); }
    .tab-row button { flex: 1; color: var(--text-secondary); font-size: 11px; font-weight: 700; border-bottom: 2px solid transparent; transition: all 150ms ease; background: transparent; border: none; cursor: pointer; }
    .tab-row button.active { color: white; border-bottom-color: var(--accent-blue); }
    
    .panel-scroll { overflow-y: auto; flex: 1; animation: panelIn 250ms ease; }
    .panel-scroll.mobile-active-scroll {
      border-left: 2px solid rgba(249, 115, 22, 0.3);
    }
    
    /* Disabled indicator overlay styling for Mobile override mode when not active */
    .disabled-style-panel {
      position: relative;
      opacity: 0.45;
      pointer-events: none;
      filter: blur(0.5px);
    }
    
    .content-shared-warning {
      display: flex; align-items: flex-start; gap: 6px; padding: 8px 10px; border-radius: 6px;
      background: rgba(59, 130, 246, 0.06); border: 1px solid rgba(59, 130, 246, 0.12);
      color: #93c5fd; font-size: 10px; font-weight: 600; line-height: 1.45; margin-bottom: 8px;
    }

    .panel-section { padding: 0 12px 12px; display: grid; gap: 10px; }
    .section-title { display: flex; align-items: center; justify-content: space-between; color: var(--text-muted); font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; padding: 16px 0 8px; border-bottom: 1px solid var(--bg-tertiary); }
    
    .badge {
      font-size: 8px; font-weight: 800; color: #3b82f6; background: rgba(59, 130, 246, 0.12);
      padding: 1px 5px; border-radius: 4px; letter-spacing: 0; text-transform: none;
    }
    .badge.orange {
      color: #f97316; background: rgba(249, 115, 22, 0.12);
    }

    label span { display: block; color: var(--text-secondary); font-size: 11px; font-weight: 600; margin-bottom: 6px; }
    .input-field {
      width: 100%; height: 32px; border: 1px solid var(--border-subtle); border-radius: 6px;
      background: var(--bg-tertiary); color: var(--text-primary); padding: 0 10px; font-size: 12px;
      outline: none; transition: border-color 0.2s;
    }
    .input-field:focus { border-color: var(--accent-blue); }
    textarea.input-field { height: 64px; padding: 8px 10px; resize: vertical; }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .color-row { display: grid; grid-template-columns: 28px 1fr; gap: 8px; align-items: center; }
    input[type="color"] { width: 24px; height: 24px; border: 1px solid var(--border-subtle); border-radius: 4px; background: transparent; padding: 2px; cursor: pointer; }
    .align-group { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
    .align-group button { height: 30px; display: grid; place-items: center; color: var(--text-secondary); background: var(--bg-tertiary); border-radius: 6px; border: none; transition: all 150ms ease; cursor: pointer; }
    .align-group button.active { color: white; background: var(--accent-blue); }
    input[type="range"] { width: 100%; accent-color: var(--accent-blue); }
    .toggle-row { height: 34px; padding: 0 10px; display: flex; align-items: center; justify-content: space-between; border-radius: 6px; background: var(--bg-tertiary); color: var(--text-primary); border: none; cursor: pointer; }
    .toggle-row b { width: 32px; height: 18px; border-radius: 999px; background: var(--border-active); position: relative; transition: background 150ms ease; }
    .toggle-row b:after { content: ''; position: absolute; width: 14px; height: 14px; top: 2px; left: 2px; border-radius: 50%; background: white; transition: transform 150ms ease; }
    .toggle-row b.on { background: var(--accent-blue); }
    .toggle-row b.on:after { transform: translateX(14px); }
    .preview-btn { height: 32px; border-radius: 6px; color: white; font-weight: 700; background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); border: none; cursor: pointer; }
    .preview-btn:disabled { opacity: 0.5; }
    .box-model { border: 1px solid var(--border-subtle); border-radius: 10px; padding: 8px; display: grid; gap: 6px; background: var(--bg-primary); }
    .box-model input { width: 100%; height: 26px; min-width: 0; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-subtle); border-radius: 5px; text-align: center; font-size: 10px; }
    .box-middle { display: grid; grid-template-columns: 48px 1fr 48px; gap: 6px; align-items: center; }
    .padding-box { border: 1px dashed var(--border-active); border-radius: 8px; padding: 6px; display: grid; gap: 6px; }
    .center-box { height: 34px; display: grid; place-items: center; border-radius: 6px; color: var(--text-secondary); background: var(--bg-elevated); font-size: 11px; }
    .empty-state { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: var(--border-subtle); }
    .empty-state h3 { margin-top: 12px; color: var(--text-secondary); font-weight: 700; }
    .empty-state p { color: var(--text-muted); font-size: 12px; }
    
    
    .animate-fade-in { animation: fadeIn 200ms ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes panelIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }

    /* Video validation & thumbnail box styles */
    .valid-input { border-color: #10b981 !important; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15); }
    .invalid-input { border-color: #ef4444 !important; box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15); }
    
    .video-preview-thumb-box {
      position: relative;
      width: 100%;
      height: 110px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border-subtle);
      margin-top: 4px;
    }
    .video-preview-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .video-preview-badge {
      position: absolute;
      bottom: 6px;
      right: 6px;
      background: rgba(0, 0, 0, 0.75);
      color: #94a3b8;
      font-family: monospace;
      font-size: 9px;
      padding: 2px 6px;
      border-radius: 4px;
    }
  `]
})
export class RightSidebarComponent {
  store = inject(BuilderStore);
  private pageApi = inject(PageApiService);
  videoService = inject(VideoService);

  activeTab = signal<'style' | 'layout' | 'video' | 'advanced' | 'animate'>('style');
  aiPrompt = '';
  aiLoading = signal(false);
  selectedBlock = this.store.selectedBlock;

  onAnimChange(anim: BlockAnimation) {
    const block = this.selectedBlock();
    if (block) {
      this.store.updateBlockMetadata(block.id, { animation: anim });
    }
  }

  isYoutubeUrlValid = computed(() => {
    const block = this.selectedBlock();
    if (!block || block.type !== 'section') return false;
    const url = block.props.videoBackground?.youtubeUrl;
    if (!url) return false;
    return !!this.videoService.extractYoutubeId(url);
  });

  isMp4UrlValid = computed(() => {
    const block = this.selectedBlock();
    if (!block || block.type !== 'section') return false;
    const url = block.props.videoBackground?.mp4Url;
    if (!url) return false;
    return this.videoService.validateMp4Url(url);
  });

  updateVideoProperty(key: keyof VideoBackground, value: any) {
    const block = this.selectedBlock();
    if (!block || block.type !== 'section') return;
    
    const currentBg = block.props.videoBackground || getDefaultVideoBackground();
    const updatedBg = { ...currentBg, [key]: value };
    
    if (key === 'youtubeUrl') {
      const ytId = this.videoService.extractYoutubeId(value);
      updatedBg.youtubeId = ytId || '';
    }
    
    this.store.updateBlock(block.id, { videoBackground: updatedBg });
  }

  toggleVideoBackground(enabled: boolean) {
    const block = this.selectedBlock();
    if (!block || block.type !== 'section') return;
    
    const currentBg = block.props.videoBackground || getDefaultVideoBackground();
    const updatedBg = { ...currentBg, enabled };
    
    if (enabled && updatedBg.type === 'none') {
      updatedBg.type = 'youtube';
    }
    
    this.store.updateBlock(block.id, { videoBackground: updatedBg });
  }

  customizeForMobile(blockId: string) {
    this.store.updateBlockMobile(blockId, {});
  }

  resetMobileStyles(blockId: string) {
    this.store.resetMobileProps(blockId);
  }

  update(key: string, value: any) {
    const id = this.store.selectedBlockId();
    if (id) this.store.updateBlock(id, { [key]: value });
  }

  updateSharedContent(key: string, value: any) {
    const id = this.store.selectedBlockId();
    if (id) {
      this.store.updateBlockSharedProps(id, { [key]: value });
    }
  }

  updateBox(key: 'padding' | 'margin', index: number, value: string) {
    const block = this.selectedBlock();
    if (!block) return;
    
    const activeProps = this.store.getActiveProps(block);
    const parts = this.expandBox(activeProps[key]);
    parts[index] = value || '0px';
    this.update(key, parts.join(' '));
  }

  splitBox(value: string | undefined, index: number) {
    return this.expandBox(value)[index];
  }

  private expandBox(value: string | undefined) {
    const parts = (value || '0px').trim().split(/\s+/);
    if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
    if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
    if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
    return [parts[0], parts[1], parts[2], parts[3]];
  }

  toggleHidden(block: CanvasBlock) {
    const id = this.store.selectedBlockId();
    if (id) this.store.updateBlockMetadata(id, { hidden: !block.hidden });
  }

  generateAiContent(context: string) {
    const id = this.store.selectedBlockId();
    if (!id || !this.aiPrompt.trim()) return;
    this.aiLoading.set(true);
    this.pageApi.generateContent(this.aiPrompt, context).subscribe({
      next: res => {
        this.store.updateBlock(id, { content: res.content });
        this.aiLoading.set(false);
      },
      error: () => this.aiLoading.set(false)
    });
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
