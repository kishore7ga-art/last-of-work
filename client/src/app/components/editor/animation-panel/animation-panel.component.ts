import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, computed, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { CanvasBlock } from '../../../store/builder.models';
import { BlockAnimation, ANIMATION_GROUPS, defaultAnimation } from '../../../models/animation.models';
import { BuilderStore } from '../../../store/builder.store';
import { NATURAL_DEFAULTS } from '../../../directives/animate.directive';

@Component({
  selector: 'app-animation-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="animation-panel animate-fade-in">
      <div class="panel-header">
        <h3 class="panel-title">Element Animation</h3>
        <label class="toggle-switch">
          <input type="checkbox" [ngModel]="anim().enabled" (ngModelChange)="toggleEnabled($event)" />
          <span class="slider"></span>
        </label>
      </div>

      <ng-container *ngIf="anim().enabled">
        
        <!-- Animation Type Selection -->
        <div class="anim-section mt-4">
          <label class="field-label">Animation Type</label>
          <div class="anim-groups">
            <div *ngFor="let group of groups" class="anim-group">
              <div class="group-header" [style.color]="group.color">
                <lucide-icon [name]="group.icon" [size]="14"></lucide-icon>
                <span>{{ group.label }}</span>
              </div>
              <div class="group-grid">
                <button 
                  *ngFor="let item of getItems(group)"
                  class="anim-btn"
                  [class.active]="anim().type === item.type"
                  (click)="updateType(item.type)">
                  {{ item.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Customization -->
        <div class="anim-section mt-6">
          <label class="field-label">Timing</label>
          
          <div class="grid-2">
            <div class="field-group">
              <label>Duration (ms)</label>
              <input type="number" class="input-field" min="100" max="5000" step="100"
                [ngModel]="anim().duration" 
                (ngModelChange)="updateField('duration', +$event)" />
            </div>
            <div class="field-group">
              <label>Delay (ms)</label>
              <input type="number" class="input-field" min="0" max="5000" step="100"
                [ngModel]="anim().delay" 
                (ngModelChange)="updateField('delay', +$event)" />
            </div>
          </div>

          <div class="field-group mt-3">
            <label>Easing</label>
            <select class="input-field" [ngModel]="anim().easing" (ngModelChange)="updateField('easing', $event)">
              <option value="ease">Ease (Default)</option>
              <option value="linear">Linear</option>
              <option value="ease-in">Ease In</option>
              <option value="ease-out">Ease Out</option>
              <option value="ease-in-out">Ease In Out</option>
              <option value="cubic-bezier(0.68,-0.55,0.265,1.55)">Bouncy</option>
              <option value="cubic-bezier(0.36,0.07,0.19,0.97)">Snappy</option>
            </select>
          </div>
        </div>

        <!-- Triggers -->
        <div class="anim-section mt-6">
          <label class="field-label">Trigger</label>
          
          <div class="field-group">
            <div class="flex-row">
              <label>Trigger Once</label>
              <label class="toggle-switch small">
                <input type="checkbox" [ngModel]="anim().triggerOnce" (ngModelChange)="updateField('triggerOnce', $event)" />
                <span class="slider"></span>
              </label>
            </div>
            <p class="field-hint">If off, animation replays when scrolling back into view.</p>
          </div>

          <div class="field-group mt-3">
            <div class="flex-between">
              <label>Scroll Threshold</label>
              <span class="value-display">{{ (anim().threshold * 100).toFixed(0) }}%</span>
            </div>
            <input type="range" class="range-slider" min="0" max="1" step="0.05"
              [ngModel]="anim().threshold" 
              (ngModelChange)="updateField('threshold', +$event)" />
            <p class="field-hint">How much of element must be visible before playing.</p>
          </div>
        </div>

        <!-- Typewriter Settings -->
        <ng-container *ngIf="anim().type === 'typewriter'">
          <div class="anim-section mt-6">
            <label class="field-label">Typewriter Settings</label>
            <div class="grid-2">
              <div class="field-group">
                <label>Speed (ms/char)</label>
                <input type="number" class="input-field" min="10" max="500" step="10"
                  [ngModel]="anim().twSpeed" 
                  (ngModelChange)="updateField('twSpeed', +$event)" />
              </div>
            </div>
            
            <div class="field-group mt-3">
              <div class="flex-row">
                <label>Show Cursor</label>
                <label class="toggle-switch small">
                  <input type="checkbox" [ngModel]="anim().twCursor" (ngModelChange)="updateField('twCursor', $event)" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>

            <div class="field-group mt-2">
              <div class="flex-row">
                <label>Loop Effect</label>
                <label class="toggle-switch small">
                  <input type="checkbox" [ngModel]="anim().twLoop" (ngModelChange)="updateField('twLoop', $event)" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- Stagger (Only for Sections) -->
        <ng-container *ngIf="block.type === 'section'">
          <div class="anim-section mt-6">
            <label class="field-label">Child Elements</label>
            <div class="field-group">
              <div class="flex-row">
                <label>Stagger Children</label>
                <label class="toggle-switch small">
                  <input type="checkbox" [ngModel]="anim().stagger" (ngModelChange)="updateField('stagger', $event)" />
                  <span class="slider"></span>
                </label>
              </div>
              <p class="field-hint">Animate blocks inside this section sequentially.</p>
            </div>

            <div class="field-group mt-3" *ngIf="anim().stagger">
              <label>Stagger Delay (ms)</label>
              <input type="number" class="input-field" min="50" max="1000" step="50"
                [ngModel]="anim().staggerMs" 
                (ngModelChange)="updateField('staggerMs', +$event)" />
            </div>
          </div>
        </ng-container>

        <!-- Preview Button -->
        <button class="preview-anim-btn mt-6" (click)="previewCurrent()">
          <lucide-icon name="play" [size]="14"></lucide-icon>
          Preview Animation
        </button>

      </ng-container>
    </div>
  `,
  styles: [`
    .animation-panel {
      padding: 4px;
    }
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-color, #334155);
    }
    .panel-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary, #f8fafc);
      margin: 0;
    }
    
    .anim-section {
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      padding-bottom: 16px;
    }
    .anim-section:last-child {
      border-bottom: none;
    }
    .mt-3 { margin-top: 12px; }
    .mt-4 { margin-top: 16px; }
    .mt-6 { margin-top: 24px; }
    
    .field-label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary, #94a3b8);
      margin-bottom: 12px;
    }
    
    .field-group label {
      display: block;
      font-size: 12px;
      color: var(--text-primary, #e2e8f0);
      margin-bottom: 6px;
    }
    
    .field-hint {
      font-size: 11px;
      color: var(--text-secondary, #94a3b8);
      margin-top: 4px;
      margin-bottom: 0;
    }
    
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    
    .flex-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .flex-row label {
      margin-bottom: 0;
    }
    
    .flex-between {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .flex-between label { margin-bottom: 0; }
    .value-display {
      font-size: 11px;
      font-family: monospace;
      color: var(--accent-blue, #60a5fa);
      background: rgba(96, 165, 250, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }
    
    .input-field {
      width: 100%;
      background: var(--bg-surface, #1e293b);
      border: 1px solid var(--border-color, #334155);
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 12px;
      color: var(--text-primary, #f8fafc);
      transition: all 0.2s;
    }
    .input-field:focus {
      outline: none;
      border-color: var(--accent-blue, #60a5fa);
      box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
    }
    
    .range-slider {
      width: 100%;
      height: 4px;
      background: var(--bg-surface, #1e293b);
      border-radius: 2px;
      appearance: none;
      outline: none;
    }
    .range-slider::-webkit-slider-thumb {
      appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--accent-blue, #60a5fa);
      cursor: pointer;
      transition: transform 0.1s;
    }
    .range-slider::-webkit-slider-thumb:hover {
      transform: scale(1.2);
    }
    
    .anim-groups {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .group-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    
    .group-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 6px;
    }
    
    .anim-btn {
      background: var(--bg-surface, #1e293b);
      border: 1px solid var(--border-color, #334155);
      color: var(--text-secondary, #94a3b8);
      font-size: 11px;
      padding: 6px 8px;
      border-radius: 6px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
    }
    .anim-btn:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-primary, #f8fafc);
    }
    .anim-btn.active {
      background: var(--accent-blue, #3b82f6);
      border-color: var(--accent-blue, #3b82f6);
      color: white;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
    }
    
    .preview-anim-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: transparent;
      border: 1px solid var(--accent-teal, #2dd4bf);
      color: var(--accent-teal, #2dd4bf);
      padding: 10px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .preview-anim-btn:hover {
      background: rgba(45, 212, 191, 0.1);
      box-shadow: 0 4px 12px rgba(45, 212, 191, 0.15);
    }
    
    /* Toggle Switch */
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 40px;
      height: 22px;
    }
    .toggle-switch.small {
      width: 32px;
      height: 18px;
    }
    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: var(--bg-surface, #1e293b);
      border: 1px solid var(--border-color, #334155);
      transition: .3s;
      border-radius: 34px;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 14px;
      width: 14px;
      left: 3px;
      bottom: 3px;
      background-color: var(--text-secondary, #94a3b8);
      transition: .3s;
      border-radius: 50%;
    }
    .toggle-switch.small .slider:before {
      height: 12px;
      width: 12px;
      left: 2px;
      bottom: 2px;
    }
    input:checked + .slider {
      background-color: var(--accent-blue, #3b82f6);
      border-color: var(--accent-blue, #3b82f6);
    }
    input:checked + .slider:before {
      background-color: white;
      transform: translateX(18px);
    }
    .toggle-switch.small input:checked + .slider:before {
      transform: translateX(14px);
    }
  `]
})
export class AnimationPanelComponent {
  @Input() block!: CanvasBlock;
  @Output() animationChange = new EventEmitter<BlockAnimation>();

  private store = inject(BuilderStore);
  
  groups = ANIMATION_GROUPS;
  previewing = signal(false);

  // Computed signal for current animation
  anim = computed(() => {
    return this.block.animation || defaultAnimation();
  });

  getItems(group: any) {
    // Filter out text-only animations if block is not text/heading
    return group.items.filter((item: any) => {
      if (item.textOnly) {
        return this.block.type === 'text' || this.block.type === 'heading';
      }
      return true;
    });
  }

  toggleEnabled(enabled: boolean) {
    const newAnim = { ...this.anim(), enabled };
    this.animationChange.emit(newAnim);
  }

  updateType(type: any) {
    const newAnim = { ...this.anim(), type };
    this.animationChange.emit(newAnim);
    
    // Automatically preview when selecting a new type
    setTimeout(() => this.previewCurrent(), 50);
  }

  updateField(field: keyof BlockAnimation, value: any) {
    const newAnim = { ...this.anim(), [field]: value };
    this.animationChange.emit(newAnim);
  }

  previewCurrent(): void {
    const blockId = this.block?.id;
    if (!blockId) return;
    
    const el = document.getElementById('block-' + blockId);
    if (!el) {
      console.warn('Block element not found:', 'block-' + blockId);
      return;
    }
    
    // Enable animation if not enabled
    if (!this.anim().enabled) {
      this.updateField('enabled', true);
      setTimeout(() => this.triggerPreview(el), 100);
    } else {
      this.triggerPreview(el);
    }
  }

  private triggerPreview(el: HTMLElement): void {
    const anim = this.anim();
    const defaults = NATURAL_DEFAULTS[anim.type]
      || { duration: 600, easing: 'ease-out' };
    
    // Reset
    el.style.animation = 'none';
    el.style.opacity = '0';
    this.previewing.set(true);
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = '';
        el.style.animation = [
          `mb-${anim.type}`,
          `${anim.duration ?? defaults.duration}ms`,
          anim.easing === 'ease-out' 
            ? defaults.easing : anim.easing,
          `${anim.delay ?? 0}ms`,
          '1',
          'normal',
          'both'
        ].join(' ');
        
        const total = (anim.duration ?? defaults.duration) + (anim.delay ?? 0) + 200;
        setTimeout(() => {
          this.previewing.set(false);
        }, total);
      });
    });
  }
}
