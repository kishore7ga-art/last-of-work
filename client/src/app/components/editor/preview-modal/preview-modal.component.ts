import { Component, inject, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuilderStore } from '../../../store/builder.store';
import { PageApiService } from '../../../services/page-api.service';
import { ToastService } from '../../../services/toast.service';
import { LucideAngularModule } from 'lucide-angular';
import { PreviewComponent } from '../../preview/preview.component';

@Component({
  selector: 'app-preview-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, PreviewComponent],
  template: `
    <div class="preview-overlay">
      <div class="preview-topbar">
        <div class="topbar-left">
          <span class="preview-label">Preview Mode</span>
        </div>
        <div class="topbar-center">
          <div class="device-toggle">
            <button class="device-btn" [class.active]="store.previewMode() === 'desktop'" (click)="store.setPreviewMode('desktop')">
              <lucide-icon name="monitor" [size]="16"></lucide-icon>
            </button>
            <button class="device-btn" [class.active]="store.previewMode() === 'tablet'" (click)="store.setPreviewMode('tablet')">
              <lucide-icon name="tablet" [size]="16"></lucide-icon>
            </button>
            <button class="device-btn" [class.active]="store.previewMode() === 'mobile'" (click)="store.setPreviewMode('mobile')">
              <lucide-icon name="smartphone" [size]="16"></lucide-icon>
            </button>
          </div>
        </div>
        <div class="topbar-right">
          <button *ngIf="store.published()" class="topbar-btn" (click)="openLiveSite()">
            <lucide-icon name="external-link" [size]="16"></lucide-icon>
            Open Live
          </button>
          <button class="topbar-icon-btn" (click)="close.emit()" title="Close (Esc)">
            <lucide-icon name="x" [size]="20"></lucide-icon>
          </button>
        </div>
      </div>
      
      <div class="preview-content-area">
        <div class="preview-frame" [style.width]="getDeviceWidth()">
          <app-preview></app-preview>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .preview-overlay { position: fixed; inset: 0; z-index: 9999; display: flex; flex-direction: column; background: #1e1e2e; animation: fadeScale 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeScale { 0% { opacity: 0; transform: scale(0.98); } 100% { opacity: 1; transform: scale(1); } }
    .preview-topbar { height: 48px; background: #111118; border-bottom: 1px solid #2a2a3d; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 0 16px; color: white; }
    .topbar-left, .topbar-center, .topbar-right { display: flex; align-items: center; gap: 12px; }
    .topbar-right { justify-content: flex-end; }
    .preview-label { font-size: 13px; font-weight: 600; color: #a1a1aa; }
    .device-toggle { display: flex; background: #1e1e2e; border: 1px solid #2a2a3d; border-radius: 6px; padding: 2px; }
    .device-btn { width: 32px; height: 28px; display: grid; place-items: center; color: #a1a1aa; border-radius: 4px; transition: all 0.2s; }
    .device-btn:hover { color: white; }
    .device-btn.active { background: #3b82f6; color: white; }
    .topbar-btn { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; color: #a1a1aa; padding: 6px 12px; border-radius: 6px; transition: all 0.2s; background: rgba(255,255,255,0.05); }
    .topbar-btn:hover { color: white; background: rgba(255,255,255,0.1); }
    .topbar-icon-btn { display: grid; place-items: center; width: 32px; height: 32px; color: #a1a1aa; border-radius: 6px; transition: all 0.2s; }
    .topbar-icon-btn:hover { background: rgba(255,255,255,0.1); color: white; }
    .preview-content-area { flex: 1; overflow: auto; display: flex; justify-content: center; padding: 24px; }
    .preview-frame { background: white; border-radius: 8px; overflow: hidden; min-height: 100%; box-shadow: 0 8px 48px rgba(0,0,0,0.5); transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
  `]
})
export class PreviewModalComponent {
  store = inject(BuilderStore);
  @Output() close = new EventEmitter<void>();

  getDeviceWidth(): string {
    switch (this.store.previewMode()) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  }

  openLiveSite() {
    const slug = this.store.pageSlug();
    if (slug) {
      window.open(`${window.location.origin}/site/${slug}`, '_blank');
    }
  }
}
