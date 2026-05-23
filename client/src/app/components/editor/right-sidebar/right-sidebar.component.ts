import { Component, inject, ChangeDetectionStrategy, signal, computed, ChangeDetectorRef, OnDestroy } from '@angular/core';
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
        
        <!-- BLOCK HEADER -->
        <div class="block-info-header">
          <div class="block-type-icon">
            <lucide-icon [name]="iconFor(block.type)" [size]="14"></lucide-icon>
          </div>
          <div class="block-info-text">
            <div class="block-type-name">{{ block.type }} block</div>
            <div class="block-id">#{{ block.id.substring(0, 8) }}</div>
          </div>
        </div>

        <!-- Sync / Customize indicator when in mobile edit mode -->
        <div *ngIf="store.editMode() === 'mobile'" style="padding: 8px; border-bottom: 1px solid #111118; background: #0c0c14; flex-shrink: 0;">
          <div *ngIf="!block.mobileProps" style="display: flex; flex-direction: column; gap: 4px; padding: 8px; background: rgba(79,110,247,0.08); border: 1px solid rgba(79,110,247,0.15); border-radius: 6px;">
            <span style="font-size: 10px; font-weight: 700; color: white;">Inheriting Desktop Styles</span>
            <button (click)="customizeForMobile(block.id)" style="width: 100%; height: 24px; border-radius: 4px; font-size: 10px; font-weight: 700; color: white; background: #4f6ef7; border: none; cursor: pointer;">Customize Mobile View</button>
          </div>
          <div *ngIf="block.mobileProps" style="display: flex; flex-direction: column; gap: 4px; padding: 8px; background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.15); border-radius: 6px;">
            <span style="font-size: 10px; font-weight: 700; color: #f97316;">Mobile Overrides Active</span>
            <button (click)="resetMobileStyles(block.id)" style="width: 100%; height: 24px; border-radius: 4px; font-size: 10px; font-weight: 700; color: #8b8ba0; background: #111118; border: 1px solid #1a1a24; cursor: pointer;">Reset to Desktop</button>
          </div>
        </div>

        <!-- PROPERTY TABS -->
        <div class="prop-tabs">
          <button class="prop-tab" [class.active]="activeTab() === 'style'" (click)="activeTab.set('style')">Style</button>
          <button class="prop-tab" [class.active]="activeTab() === 'layout'" (click)="activeTab.set('layout')">Layout</button>
          <button class="prop-tab" *ngIf="block.type === 'section'" [class.active]="activeTab() === 'video'" (click)="activeTab.set('video')">Video</button>
          <button class="prop-tab" [class.active]="activeTab() === 'animate'" (click)="activeTab.set('animate')">Animate</button>
          <button class="prop-tab" [class.active]="activeTab() === 'advanced'" (click)="activeTab.set('advanced')">Advanced</button>
        </div>

        <!-- PROPERTIES CONTENT -->
        <div class="props-content">
          <ng-container *ngIf="activeTab() === 'style'">
            <div class="prop-section-title">Content & Text</div>
            
            <div class="prop-field" *ngIf="block.type === 'text' || block.type === 'heading'">
              <label>Text Content</label>
              <textarea class="prop-textarea" [ngModel]="block.props['content']" (ngModelChange)="updateSharedContent('content', $event)"></textarea>
            </div>

            <div class="prop-field" *ngIf="block.type === 'heading'">
              <label>Heading Level</label>
              <select class="prop-select" [ngModel]="block.props['level'] || 'h2'" (ngModelChange)="updateSharedContent('level', $event)">
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="h4">Heading 4</option>
                <option value="h5">Heading 5</option>
                <option value="h6">Heading 6</option>
              </select>
            </div>

            <div class="prop-field" *ngIf="block.type === 'button'">
              <label>Label</label>
              <input class="prop-input" [ngModel]="block.props['label']" (ngModelChange)="updateSharedContent('label', $event)" />
            </div>

            <div class="prop-field" *ngIf="block.type === 'button'">
              <label>Link / URL</label>
              <input class="prop-input" [ngModel]="block.props['href']" (ngModelChange)="updateSharedContent('href', $event)" />
            </div>

            <div class="prop-field" *ngIf="block.type === 'image' || block.type === 'section'">
              <label>Background Image URL</label>
              <input class="prop-input" [ngModel]="block.props['src']" (ngModelChange)="updateSharedContent('src', $event)" />
            </div>

            <div class="prop-field" *ngIf="block.type === 'input'">
              <label>Placeholder</label>
              <input class="prop-input" [ngModel]="block.props['placeholder']" (ngModelChange)="updateSharedContent('placeholder', $event)" />
            </div>

            <!-- TYPOGRAPHY -->
            <div class="prop-section-title">Typography</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div class="prop-field">
                <label>Size</label>
                <input class="prop-input" [ngModel]="activeProps()['fontSize']" (ngModelChange)="update('fontSize', $event)" placeholder="16px" />
              </div>
              <div class="prop-field">
                <label>Weight</label>
                <select class="prop-select" [ngModel]="activeProps()['fontWeight'] || 'normal'" (ngModelChange)="update('fontWeight', $event)">
                  <option value="normal">400 (Regular)</option>
                  <option value="500">500 (Medium)</option>
                  <option value="600">600 (SemiBold)</option>
                  <option value="bold">700 (Bold)</option>
                </select>
              </div>
            </div>

            <!-- COLORS -->
            <div class="prop-section-title">Colors</div>
            <div class="prop-field">
              <label>Text Color</label>
              <div class="color-field">
                <div class="color-swatch-btn">
                  <input type="color" [ngModel]="activeProps()['color'] || '#111827'" (ngModelChange)="update('color', $event)" />
                </div>
                <input class="color-hex-input" [ngModel]="activeProps()['color']" (ngModelChange)="update('color', $event)" placeholder="#111827" />
              </div>
            </div>
            
            <div class="prop-field">
              <label>Background Color</label>
              <div class="color-field">
                <div class="color-swatch-btn">
                  <input type="color" [ngModel]="activeProps()['backgroundColor'] || '#ffffff'" (ngModelChange)="update('backgroundColor', $event)" />
                </div>
                <input class="color-hex-input" [ngModel]="activeProps()['backgroundColor']" (ngModelChange)="update('backgroundColor', $event)" placeholder="#ffffff" />
              </div>
            </div>

            <ng-container *ngIf="block.type === 'section'">
              <div class="prop-field">
                <label>Gradient From</label>
                <div class="color-field">
                  <div class="color-swatch-btn">
                    <input type="color" [ngModel]="activeProps()['gradientFrom'] || '#4f6ef7'" (ngModelChange)="update('gradientFrom', $event)" />
                  </div>
                  <input class="color-hex-input" [ngModel]="activeProps()['gradientFrom']" (ngModelChange)="update('gradientFrom', $event)" placeholder="#4f6ef7" />
                </div>
              </div>
              
              <div class="prop-field">
                <label>Gradient To</label>
                <div class="color-field">
                  <div class="color-swatch-btn">
                    <input type="color" [ngModel]="activeProps()['gradientTo'] || '#7c3aed'" (ngModelChange)="update('gradientTo', $event)" />
                  </div>
                  <input class="color-hex-input" [ngModel]="activeProps()['gradientTo']" (ngModelChange)="update('gradientTo', $event)" placeholder="#7c3aed" />
                </div>
              </div>
            </ng-container>
          </ng-container>

          <ng-container *ngIf="activeTab() === 'layout'">
            <div class="prop-section-title">Device Visibility</div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding-bottom: 8px;">
              <button style="height: 32px; background: #111118; border: 1px solid #1a1a24; border-radius: 6px; color: #8b8ba0; font-size: 10px; cursor: pointer; transition: all 150ms;"
                [style.border-color]="block.visibility?.desktop !== false ? '#4f6ef7' : '#1a1a24'"
                [style.color]="block.visibility?.desktop !== false ? 'white' : '#4a4a6a'"
                (click)="store.toggleBlockVisibility(block.id, 'desktop', block.visibility?.desktop === false)">
                Desktop
              </button>
              <button style="height: 32px; background: #111118; border: 1px solid #1a1a24; border-radius: 6px; color: #8b8ba0; font-size: 10px; cursor: pointer; transition: all 150ms;"
                [style.border-color]="block.visibility?.tablet !== false ? '#4f6ef7' : '#1a1a24'"
                [style.color]="block.visibility?.tablet !== false ? 'white' : '#4a4a6a'"
                (click)="store.toggleBlockVisibility(block.id, 'tablet', block.visibility?.tablet === false)">
                Tablet
              </button>
              <button style="height: 32px; background: #111118; border: 1px solid #1a1a24; border-radius: 6px; color: #8b8ba0; font-size: 10px; cursor: pointer; transition: all 150ms;"
                [style.border-color]="block.visibility?.mobile !== false ? '#4f6ef7' : '#1a1a24'"
                [style.color]="block.visibility?.mobile !== false ? 'white' : '#4a4a6a'"
                (click)="store.toggleBlockVisibility(block.id, 'mobile', block.visibility?.mobile === false)">
                Mobile
              </button>
            </div>

            <div class="prop-section-title">Size & Radius</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div class="prop-field">
                <label>Width</label>
                <input class="prop-input" [ngModel]="activeProps()['width']" (ngModelChange)="update('width', $event)" placeholder="100%" />
              </div>
              <div class="prop-field">
                <label>Height</label>
                <input class="prop-input" [ngModel]="activeProps()['height']" (ngModelChange)="update('height', $event)" placeholder="auto" />
              </div>
            </div>
            
            <div class="prop-field">
              <label>Border Radius</label>
              <input class="prop-input" [ngModel]="activeProps()['borderRadius']" (ngModelChange)="update('borderRadius', $event)" placeholder="8px" />
            </div>

            <!-- CSS Grid / Flex options -->
            <ng-container *ngIf="block.type === 'section'">
              <div class="prop-section-title">Layout Engine</div>
              <div class="prop-field">
                <label>Display Mode</label>
                <select class="prop-select" [ngModel]="activeProps()['display'] || 'block'" (ngModelChange)="update('display', $event)">
                  <option value="block">Standard Block</option>
                  <option value="flex">Flexbox Container</option>
                  <option value="grid">CSS Grid Container</option>
                </select>
              </div>

              <div *ngIf="activeProps()['display'] === 'flex'" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div class="prop-field">
                  <label>Direction</label>
                  <select class="prop-select" [ngModel]="activeProps()['flexDirection'] || 'row'" (ngModelChange)="update('flexDirection', $event)">
                    <option value="row">Horizontal</option>
                    <option value="column">Vertical</option>
                  </select>
                </div>
                <div class="prop-field">
                  <label>Gap</label>
                  <input class="prop-input" [ngModel]="activeProps()['gap']" (ngModelChange)="update('gap', $event)" placeholder="16px" />
                </div>
              </div>
            </ng-container>

            <!-- Padding & Margin Box Model -->
            <div class="prop-section-title">Box Model</div>
            <div class="box-model" style="border: 1px solid #1a1a24; border-radius: 8px; padding: 12px; background: #08080f; display: grid; gap: 6px;">
              <input [ngModel]="splitBox(activeProps()['margin'], 0)" (ngModelChange)="updateBox('margin', 0, $event)" placeholder="Margin Top" style="height: 24px; background: #111118; border: 1px solid #1a1a24; color: white; border-radius: 4px; text-align: center; font-size: 10px;" />
              <div style="display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 6px; align-items: center;">
                <input [ngModel]="splitBox(activeProps()['margin'], 3)" (ngModelChange)="updateBox('margin', 3, $event)" placeholder="M Left" style="height: 24px; background: #111118; border: 1px solid #1a1a24; color: white; border-radius: 4px; text-align: center; font-size: 10px;" />
                <div style="border: 1px dashed #4f6ef7; border-radius: 6px; padding: 6px; display: grid; gap: 4px;">
                  <input [ngModel]="splitBox(activeProps()['padding'], 0)" (ngModelChange)="updateBox('padding', 0, $event)" placeholder="Padding Top" style="height: 20px; background: #111118; border: 1px solid #1a1a24; color: white; border-radius: 4px; text-align: center; font-size: 10px;" />
                  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; align-items: center;">
                    <input [ngModel]="splitBox(activeProps()['padding'], 3)" (ngModelChange)="updateBox('padding', 3, $event)" placeholder="P Left" style="height: 20px; background: #111118; border: 1px solid #1a1a24; color: white; border-radius: 4px; text-align: center; font-size: 10px;" />
                    <div style="font-size: 9px; color: #4a4a6a; text-align: center; font-weight: 700;">Content</div>
                    <input [ngModel]="splitBox(activeProps()['padding'], 1)" (ngModelChange)="updateBox('padding', 1, $event)" placeholder="P Right" style="height: 20px; background: #111118; border: 1px solid #1a1a24; color: white; border-radius: 4px; text-align: center; font-size: 10px;" />
                  </div>
                  <input [ngModel]="splitBox(activeProps()['padding'], 2)" (ngModelChange)="updateBox('padding', 2, $event)" placeholder="Padding Bottom" style="height: 20px; background: #111118; border: 1px solid #1a1a24; color: white; border-radius: 4px; text-align: center; font-size: 10px;" />
                </div>
                <input [ngModel]="splitBox(activeProps()['margin'], 1)" (ngModelChange)="updateBox('margin', 1, $event)" placeholder="M Right" style="height: 24px; background: #111118; border: 1px solid #1a1a24; color: white; border-radius: 4px; text-align: center; font-size: 10px;" />
              </div>
              <input [ngModel]="splitBox(activeProps()['margin'], 2)" (ngModelChange)="updateBox('margin', 2, $event)" placeholder="Margin Bottom" style="height: 24px; background: #111118; border: 1px solid #1a1a24; color: white; border-radius: 4px; text-align: center; font-size: 10px;" />
            </div>
          </ng-container>

          <ng-container *ngIf="activeTab() === 'video'">
            <div class="prop-section-title">Video Background</div>
            <div class="toggle-field">
              <span class="toggle-label">Enable Video Layer</span>
              <label class="toggle">
                <input type="checkbox" [checked]="block.props.videoBackground?.enabled" (change)="toggleVideoBackground(!block.props.videoBackground?.enabled)" />
                <span class="slider"></span>
              </label>
            </div>

            <ng-container *ngIf="block.props.videoBackground?.enabled">
              <div class="prop-field" style="margin-top: 10px;">
                <label>Video Provider</label>
                <select class="prop-select" [ngModel]="block.props.videoBackground?.type || 'none'" (ngModelChange)="updateVideoProperty('type', $event)">
                  <option value="youtube">YouTube Backdrop</option>
                  <option value="mp4">Local MP4 URL</option>
                </select>
              </div>

              <div class="prop-field" *ngIf="block.props.videoBackground?.type === 'youtube'">
                <label>YouTube Link or Video ID</label>
                <input class="prop-input" [ngModel]="block.props.videoBackground?.youtubeUrl" (ngModelChange)="updateVideoProperty('youtubeUrl', $event)" placeholder="https://youtube.com/watch?v=..." />
              </div>

              <div class="prop-field" *ngIf="block.props.videoBackground?.type === 'mp4'">
                <label>MP4 Stream URL</label>
                <input class="prop-input" [ngModel]="block.props.videoBackground?.mp4Url" (ngModelChange)="updateVideoProperty('mp4Url', $event)" placeholder="https://domain.com/video.mp4" />
              </div>
            </ng-container>
          </ng-container>

          <ng-container *ngIf="activeTab() === 'animate'">
            <app-animation-panel [block]="block" (animationChange)="onAnimChange($event)"></app-animation-panel>
          </ng-container>

          <ng-container *ngIf="activeTab() === 'advanced'">
            <div class="prop-section-title">Opacity & Blend</div>
            <div class="prop-field">
              <label>Opacity ({{ ((activeProps()['opacity'] ?? 1) * 100) | number:'1.0-0' }}%)</label>
              <div class="range-field">
                <input type="range" min="0" max="1" step="0.05" [ngModel]="activeProps()['opacity'] ?? 1" (ngModelChange)="update('opacity', +$event)" />
                <span class="range-value">{{ (activeProps()['opacity'] ?? 1) }}</span>
              </div>
            </div>

            <div class="prop-field">
              <label>Custom CSS Class</label>
              <input class="prop-input" [ngModel]="activeProps()['class']" (ngModelChange)="update('class', $event)" placeholder="my-custom-class" />
            </div>

            <div class="toggle-field" style="margin-top: 10px;">
              <span class="toggle-label">Hide on all screens</span>
              <label class="toggle">
                <input type="checkbox" [checked]="block.hidden" (change)="toggleHidden(block)" />
                <span class="slider"></span>
              </label>
            </div>
          </ng-container>
        </div>

      </ng-container>

      <ng-template #emptyState>
        <div class="no-block-selected">
          <lucide-icon name="mouse-pointer" [size]="28" class="no-block-icon"></lucide-icon>
          <div class="no-block-title">No Block Selected</div>
          <div class="no-block-sub">Click on any element on the canvas to configure its properties here.</div>
        </div>
      </ng-template>
    </aside>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      width: 256px;
      height: 100%;
      background: #0c0c14;
      border-left: 1px solid #161622;
      flex-shrink: 0;
      overflow: hidden;
    }

    // Block info header
    .block-info-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border-bottom: 1px solid #111118;
      flex-shrink: 0;
      min-height: 48px;
      
      .block-type-icon {
        width: 28px;
        height: 28px;
        background: #111118;
        border: 1px solid #1a1a24;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #4f6ef7;
        flex-shrink: 0;
      }
      
      .block-info-text {
        flex: 1;
        min-width: 0;
        
        .block-type-name {
          font-size: 12px;
          font-weight: 600;
          color: #f1f1f3;
          text-transform: capitalize;
        }
        
        .block-id {
          font-size: 9px;
          color: #4a4a6a;
          font-family: monospace;
        }
      }
    }

    // Property tabs
    .prop-tabs {
      display: flex;
      background: #080810;
      border-bottom: 1px solid #111118;
      flex-shrink: 0;
      
      .prop-tab {
        flex: 1;
        padding: 8px 2px;
        background: transparent;
        border: none;
        border-bottom: 2px solid transparent;
        color: #363650;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        cursor: pointer;
        transition: all 150ms;
        
        &:hover { color: #6b6b8a; }
        
        &.active {
          color: #4f6ef7;
          border-bottom-color: #4f6ef7;
        }
      }
    }

    // Properties content
    .props-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      box-sizing: border-box;
      
      &::-webkit-scrollbar { width: 3px; }
      &::-webkit-scrollbar-thumb {
        background: #1a1a24;
        border-radius: 3px;
      }
    }

    // Section titles
    .prop-section-title {
      font-size: 9px;
      font-weight: 700;
      color: #4a4a6a;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 10px 4px 6px;
      display: block;
    }

    // Input fields
    .prop-field {
      margin-bottom: 8px;
      
      label {
        display: block;
        font-size: 10px;
        color: #8b8ba0;
        margin-bottom: 4px;
        font-weight: 500;
      }
    }

    .prop-input {
      width: 100%;
      height: 30px;
      background: #111118;
      border: 1px solid #1a1a24;
      border-radius: 6px;
      color: #c8c8d8;
      font-size: 12px;
      padding: 0 10px;
      outline: none;
      transition: border-color 150ms;
      box-sizing: border-box;
      
      &:focus {
        border-color: #4f6ef7;
        box-shadow: 0 0 0 2px 
          rgba(79,110,247,0.12);
      }
      
      &::placeholder { color: #2a2a3d; }
    }

    .prop-textarea {
      @extend .prop-input;
      height: auto;
      min-height: 72px;
      padding: 8px 10px;
      resize: vertical;
      line-height: 1.5;
      width: 100%;
    }

    .prop-select {
      @extend .prop-input;
      cursor: pointer;
      appearance: none;
      background-image: url(
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234a4a6a' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 8px center;
      padding-right: 28px;
    }

    // Color input
    .color-field {
      display: flex;
      gap: 6px;
      align-items: center;
      
      .color-swatch-btn {
        width: 30px;
        height: 30px;
        border-radius: 6px;
        border: 1px solid #1a1a24;
        cursor: pointer;
        flex-shrink: 0;
        padding: 2px;
        background: #111118;
        box-sizing: border-box;
        
        input[type="color"] {
          width: 100%;
          height: 100%;
          border: none;
          padding: 0;
          border-radius: 4px;
          cursor: pointer;
          background: transparent;
        }
      }
      
      .color-hex-input {
        @extend .prop-input;
        font-family: monospace;
        font-size: 11px;
        letter-spacing: 0.05em;
      }
    }

    // Range slider
    .range-field {
      display: flex;
      align-items: center;
      gap: 8px;
      
      input[type="range"] {
        flex: 1;
        height: 3px;
        accent-color: #4f6ef7;
        cursor: pointer;
        background: #111118;
        border-radius: 2px;
      }
      
      .range-value {
        font-size: 11px;
        color: #6b6b8a;
        min-width: 32px;
        text-align: right;
        font-family: monospace;
      }
    }

    // Toggle
    .toggle-field {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 0;
      
      .toggle-label {
        font-size: 11px;
        color: #6b6b8a;
      }
      
      .toggle {
        position: relative;
        width: 32px;
        height: 18px;
        
        input { display: none; }
        
        .slider {
          position: absolute;
          inset: 0;
          background: #1a1a24;
          border-radius: 9px;
          cursor: pointer;
          transition: background 200ms;
          
          &::after {
            content: '';
            position: absolute;
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 50%;
            top: 3px;
            left: 3px;
            transition: transform 200ms;
          }
        }
        
        input:checked + .slider {
          background: #4f6ef7;
          &::after { transform: translateX(14px); }
        }
      }
    }

    // Empty state (no block selected)
    .no-block-selected {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 10px;
      padding: 32px 20px;
      box-sizing: border-box;
      
      .no-block-icon {
        color: #4a4a6a;
      }
      
      .no-block-title {
        font-size: 13px;
        color: #f1f1f3;
        font-weight: 500;
      }
      
      .no-block-sub {
        font-size: 11px;
        color: #4a4a6a;
        text-align: center;
        line-height: 1.5;
      }
    }
  `]
})
export class RightSidebarComponent implements OnDestroy {
  store = inject(BuilderStore);
  private cdr = inject(ChangeDetectorRef);
  private pageApi = inject(PageApiService);
  videoService = inject(VideoService);

  activeTab = signal<'style' | 'layout' | 'video' | 'advanced' | 'animate'>('style');
  aiPrompt = '';
  aiLoading = signal(false);
  selectedBlock = this.store.selectedBlock;
  blockType = computed(() => this.selectedBlock()?.type);
  activeProps = computed(() => {
    const block = this.selectedBlock();
    return block ? this.store.getActiveProps(block) : {};
  });
  private updateQueue = new Map<string, any>();
  private sharedUpdateQueue = new Map<string, any>();
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnDestroy(): void {
    this.clearFlushTimer();
    this.flushUpdates();
  }

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
    
    this.updatePropNow('videoBackground', updatedBg);
  }

  toggleVideoBackground(enabled: boolean) {
    const block = this.selectedBlock();
    if (!block || block.type !== 'section') return;
    
    const currentBg = block.props.videoBackground || getDefaultVideoBackground();
    const updatedBg = { ...currentBg, enabled };
    
    if (enabled && updatedBg.type === 'none') {
      updatedBg.type = 'youtube';
    }
    
    this.updatePropNow('videoBackground', updatedBg);
  }

  customizeForMobile(blockId: string) {
    this.store.updateBlockMobile(blockId, {});
  }

  resetMobileStyles(blockId: string) {
    this.store.resetMobileProps(blockId);
  }

  update(key: string, value: any) {
    this.updateProp(key, value);
  }

  updateSharedContent(key: string, value: any) {
    this.sharedUpdateQueue.set(key, value);
    this.scheduleFlush();
  }

  updateProp(key: string, value: any): void {
    this.updateQueue.set(key, value);
    this.scheduleFlush();
  }

  updatePropNow(key: string, value: any): void {
    const id = this.selectedBlock()?.id;
    if (!id) return;
    this.clearFlushTimer();
    this.flushUpdates();
    this.store.updateBlock(id, { [key]: value });
    this.cdr.markForCheck();
  }

  private scheduleFlush(): void {
    this.clearFlushTimer();
    this.flushTimer = setTimeout(() => {
      this.flushUpdates();
    }, 16);
  }

  private clearFlushTimer(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }

  private flushUpdates(): void {
    this.flushTimer = null;
    const id = this.selectedBlock()?.id;
    if (!id) {
      this.updateQueue.clear();
      this.sharedUpdateQueue.clear();
      return;
    }

    if (this.updateQueue.size === 0 && this.sharedUpdateQueue.size === 0) return;

    const updates = Object.fromEntries(this.updateQueue);
    const sharedUpdates = Object.fromEntries(this.sharedUpdateQueue);
    this.updateQueue.clear();
    this.sharedUpdateQueue.clear();

    if (Object.keys(sharedUpdates).length > 0) {
      this.store.updateBlockSharedProps(id, sharedUpdates);
    }
    if (Object.keys(updates).length > 0) {
      this.store.updateBlock(id, updates);
    }
    this.cdr.markForCheck();
  }

  updateBox(key: 'padding' | 'margin', index: number, value: string) {
    const block = this.selectedBlock();
    if (!block) return;
    
    const activeProps = this.activeProps();
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
