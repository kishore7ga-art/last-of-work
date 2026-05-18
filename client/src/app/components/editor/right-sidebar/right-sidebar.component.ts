import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { BuilderStore } from '../../../store/builder.store';
import { PageApiService } from '../../../services/page-api.service';
import { CanvasBlock } from '../../../store/builder.models';

@Component({
  selector: 'app-right-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
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

        <div class="tab-row">
          <button [class.active]="activeTab() === 'style'" (click)="activeTab.set('style')">Style</button>
          <button [class.active]="activeTab() === 'layout'" (click)="activeTab.set('layout')">Layout</button>
          <button [class.active]="activeTab() === 'advanced'" (click)="activeTab.set('advanced')">Advanced</button>
        </div>

        <div class="panel-scroll">
          <ng-container *ngIf="activeTab() === 'style'">
            <section class="panel-section">
              <span class="section-title">Content</span>

              <label *ngIf="block.type === 'text' || block.type === 'heading'">
                <span>Text</span>
                <textarea class="input-field" [ngModel]="block.props.content" (ngModelChange)="update('content', $event)"></textarea>
              </label>

              <label *ngIf="block.type === 'heading'">
                <span>Level</span>
                <select class="input-field" [ngModel]="block.props.level || 'h2'" (ngModelChange)="update('level', $event)">
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
                <input class="input-field" [ngModel]="block.props.label" (ngModelChange)="update('label', $event)" />
              </label>

              <label *ngIf="block.type === 'button'">
                <span>Link</span>
                <input class="input-field" [ngModel]="block.props.href" (ngModelChange)="update('href', $event)" />
              </label>

              <label *ngIf="block.type === 'image'">
                <span>Image URL</span>
                <input class="input-field" [ngModel]="block.props.src" (ngModelChange)="update('src', $event)" />
              </label>

              <label *ngIf="block.type === 'input'">
                <span>Placeholder</span>
                <input class="input-field" [ngModel]="block.props.placeholder" (ngModelChange)="update('placeholder', $event)" />
              </label>

              <label *ngIf="block.type === 'video'">
                <span>Video URL</span>
                <input class="input-field" [ngModel]="block.props.videoUrl" (ngModelChange)="update('videoUrl', $event)" />
              </label>
            </section>

            <section class="panel-section">
              <span class="section-title">Typography</span>
              <div class="grid-2">
                <label>
                  <span>Size</span>
                  <input class="input-field" [ngModel]="block.props.fontSize" (ngModelChange)="update('fontSize', $event)" placeholder="16px" />
                </label>
                <label>
                  <span>Weight</span>
                  <select class="input-field" [ngModel]="block.props.fontWeight || 'normal'" (ngModelChange)="update('fontWeight', $event)">
                    <option value="normal">400</option>
                    <option value="500">500</option>
                    <option value="600">600</option>
                    <option value="bold">700</option>
                  </select>
                </label>
              </div>

              <label>
                <span>Align</span>
                <div class="align-group">
                  <button [class.active]="block.props.textAlign === 'left'" (click)="update('textAlign', 'left')"><lucide-icon name="align-left" [size]="15"></lucide-icon></button>
                  <button [class.active]="block.props.textAlign === 'center'" (click)="update('textAlign', 'center')"><lucide-icon name="align-center" [size]="15"></lucide-icon></button>
                  <button [class.active]="block.props.textAlign === 'right'" (click)="update('textAlign', 'right')"><lucide-icon name="align-right" [size]="15"></lucide-icon></button>
                </div>
              </label>
            </section>

            <section class="panel-section">
              <span class="section-title">Colors</span>
              <label>
                <span>Text</span>
                <div class="color-row">
                  <input type="color" [ngModel]="block.props.color || '#111827'" (ngModelChange)="update('color', $event)" />
                  <input class="input-field" [ngModel]="block.props.color" (ngModelChange)="update('color', $event)" placeholder="#111827" />
                </div>
              </label>
              <label>
                <span>Background</span>
                <div class="color-row">
                  <input type="color" [ngModel]="block.props.backgroundColor || '#ffffff'" (ngModelChange)="update('backgroundColor', $event)" />
                  <input class="input-field" [ngModel]="block.props.backgroundColor" (ngModelChange)="update('backgroundColor', $event)" placeholder="#ffffff" />
                </div>
              </label>
            </section>
          </ng-container>

          <ng-container *ngIf="activeTab() === 'layout'">
            <section class="panel-section">
              <span class="section-title">Size</span>
              <div class="grid-2">
                <label><span>Width</span><input class="input-field" [ngModel]="block.props.width" (ngModelChange)="update('width', $event)" /></label>
                <label><span>Height</span><input class="input-field" [ngModel]="block.props.height" (ngModelChange)="update('height', $event)" /></label>
              </div>
              <label><span>Radius</span><input class="input-field" [ngModel]="block.props.borderRadius" (ngModelChange)="update('borderRadius', $event)" /></label>
            </section>

            <section class="panel-section">
              <span class="section-title">Box Model</span>
              <div class="box-model">
                <input [ngModel]="splitBox(block.props.margin, 0)" (ngModelChange)="updateBox('margin', 0, $event)" placeholder="M top" />
                <div class="box-middle">
                  <input [ngModel]="splitBox(block.props.margin, 3)" (ngModelChange)="updateBox('margin', 3, $event)" placeholder="M left" />
                  <div class="padding-box">
                    <input [ngModel]="splitBox(block.props.padding, 0)" (ngModelChange)="updateBox('padding', 0, $event)" placeholder="P top" />
                    <div class="box-middle">
                      <input [ngModel]="splitBox(block.props.padding, 3)" (ngModelChange)="updateBox('padding', 3, $event)" placeholder="P left" />
                      <div class="center-box">Block</div>
                      <input [ngModel]="splitBox(block.props.padding, 1)" (ngModelChange)="updateBox('padding', 1, $event)" placeholder="P right" />
                    </div>
                    <input [ngModel]="splitBox(block.props.padding, 2)" (ngModelChange)="updateBox('padding', 2, $event)" placeholder="P bottom" />
                  </div>
                  <input [ngModel]="splitBox(block.props.margin, 1)" (ngModelChange)="updateBox('margin', 1, $event)" placeholder="M right" />
                </div>
                <input [ngModel]="splitBox(block.props.margin, 2)" (ngModelChange)="updateBox('margin', 2, $event)" placeholder="M bottom" />
              </div>
            </section>
          </ng-container>

          <ng-container *ngIf="activeTab() === 'advanced'">
            <section class="panel-section">
              <span class="section-title">State</span>
              <label>
                <span>Opacity {{ ((block.props.opacity ?? 1) * 100) | number:'1.0-0' }}%</span>
                <input type="range" min="0" max="1" step="0.05" [ngModel]="block.props.opacity ?? 1" (ngModelChange)="update('opacity', +$event)" />
              </label>
              <label><span>CSS Class</span><input class="input-field" [ngModel]="block.props.display" (ngModelChange)="update('display', $event)" placeholder="custom-class" /></label>
              <button class="toggle-row" (click)="toggleHidden(block)">
                <span>Hide Block</span>
                <b [class.on]="block.hidden"></b>
              </button>
            </section>

            <section class="panel-section">
              <span class="section-title">Animation</span>
              <label>
                <span>Entrance</span>
                <select class="input-field" [ngModel]="block.props.animation || 'none'" (ngModelChange)="update('animation', $event)">
                  <option value="none">None</option>
                  <option value="fadeIn">Fade In</option>
                  <option value="slideUp">Slide Up</option>
                  <option value="zoomIn">Zoom In</option>
                  <option value="bounce">Bounce</option>
                </select>
              </label>
              <div class="grid-2">
                <label><span>Delay</span><input class="input-field" type="number" min="0" max="2000" [ngModel]="block.props.animationDelay || 0" (ngModelChange)="update('animationDelay', +$event)" /></label>
                <label><span>Duration</span><input class="input-field" type="number" min="300" max="3000" [ngModel]="block.props.animationDuration || 600" (ngModelChange)="update('animationDuration', +$event)" /></label>
              </div>
              <button class="preview-btn" (click)="previewAnimation(block.id)">Preview Animation</button>
            </section>

            <section class="panel-section">
              <span class="section-title">AI Text</span>
              <textarea class="input-field" [(ngModel)]="aiPrompt" placeholder="Describe the copy you want..."></textarea>
              <button class="preview-btn" [disabled]="aiLoading()" (click)="generateAiContent(block.props.content || '')">Generate Content</button>
            </section>
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
    .tab-row { height: 36px; flex: 0 0 auto; display: flex; background: var(--bg-primary); border-bottom: 1px solid var(--border-subtle); }
    .tab-row button { flex: 1; color: var(--text-secondary); font-size: 11px; font-weight: 700; border-bottom: 2px solid transparent; transition: all 150ms ease; }
    .tab-row button.active { color: white; border-bottom-color: var(--accent-blue); }
    .panel-scroll { overflow-y: auto; flex: 1; animation: panelIn 250ms ease; }
    .panel-section { padding: 0 12px 12px; display: grid; gap: 10px; }
    .section-title { color: var(--text-muted); font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; padding: 16px 0 8px; border-bottom: 1px solid var(--bg-tertiary); }
    label span { display: block; color: var(--text-secondary); font-size: 11px; font-weight: 600; margin-bottom: 6px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .color-row { display: grid; grid-template-columns: 28px 1fr; gap: 8px; align-items: center; }
    input[type="color"] { width: 24px; height: 24px; border: 1px solid var(--border-subtle); border-radius: 4px; background: transparent; padding: 2px; }
    .align-group { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
    .align-group button { height: 30px; display: grid; place-items: center; color: var(--text-secondary); background: var(--bg-tertiary); border-radius: 6px; transition: all 150ms ease; }
    .align-group button.active { color: white; background: var(--accent-blue); }
    input[type="range"] { width: 100%; accent-color: var(--accent-blue); }
    .toggle-row { height: 34px; padding: 0 10px; display: flex; align-items: center; justify-content: space-between; border-radius: 6px; background: var(--bg-tertiary); color: var(--text-primary); }
    .toggle-row b { width: 32px; height: 18px; border-radius: 999px; background: var(--border-active); position: relative; transition: background 150ms ease; }
    .toggle-row b:after { content: ''; position: absolute; width: 14px; height: 14px; top: 2px; left: 2px; border-radius: 50%; background: white; transition: transform 150ms ease; }
    .toggle-row b.on { background: var(--accent-blue); }
    .toggle-row b.on:after { transform: translateX(14px); }
    .preview-btn { height: 32px; border-radius: 6px; color: white; font-weight: 700; background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); }
    .preview-btn:disabled { opacity: 0.5; }
    .box-model { border: 1px solid var(--border-subtle); border-radius: 10px; padding: 8px; display: grid; gap: 6px; background: var(--bg-primary); }
    .box-model input { width: 100%; height: 26px; min-width: 0; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-subtle); border-radius: 5px; text-align: center; font-size: 10px; }
    .box-middle { display: grid; grid-template-columns: 48px 1fr 48px; gap: 6px; align-items: center; }
    .padding-box { border: 1px dashed var(--border-active); border-radius: 8px; padding: 6px; display: grid; gap: 6px; }
    .center-box { height: 34px; display: grid; place-items: center; border-radius: 6px; color: var(--text-secondary); background: var(--bg-elevated); font-size: 11px; }
    .empty-state { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: var(--border-subtle); }
    .empty-state h3 { margin-top: 12px; color: var(--text-secondary); font-weight: 700; }
    .empty-state p { color: var(--text-muted); font-size: 12px; }
    @keyframes panelIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
  `]
})
export class RightSidebarComponent {
  store = inject(BuilderStore);
  private pageApi = inject(PageApiService);

  activeTab = signal<'style' | 'layout' | 'advanced'>('style');
  aiPrompt = '';
  aiLoading = signal(false);
  selectedBlock = this.store.selectedBlock;

  update(key: string, value: any) {
    const id = this.store.selectedBlockId();
    if (id) this.store.updateBlock(id, { [key]: value });
  }

  updateBox(key: 'padding' | 'margin', index: number, value: string) {
    const block = this.selectedBlock();
    if (!block) return;
    const parts = this.expandBox(block.props[key]);
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

  previewAnimation(blockId: string) {
    const el = document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement | null;
    if (!el) return;
    el.classList.remove('builder-animation-preview');
    void el.offsetWidth;
    el.classList.add('builder-animation-preview');
    window.setTimeout(() => el.classList.remove('builder-animation-preview'), 900);
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
