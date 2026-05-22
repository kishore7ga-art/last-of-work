import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuilderStore } from '../../../store/builder.store';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-device-tab',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="device-tab-row">
      <button 
        class="device-tab-btn" 
        [class.active]="store.editMode() === 'desktop'" 
        (click)="store.setEditMode('desktop')">
        <lucide-icon name="monitor" [size]="14"></lucide-icon>
        <span>Desktop Style</span>
      </button>
      <button 
        class="device-tab-btn" 
        [class.active]="store.editMode() === 'mobile'" 
        (click)="store.setEditMode('mobile')"
        [class.mobile-active]="store.editMode() === 'mobile'">
        <lucide-icon name="smartphone" [size]="14"></lucide-icon>
        <span>Mobile Overrides</span>
      </button>
    </div>
  `,
  styles: [`
    .device-tab-row {
      display: flex;
      padding: 6px 12px;
      gap: 6px;
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border-subtle);
    }
    .device-tab-btn {
      flex: 1;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      color: var(--text-secondary);
      background: transparent;
      border: 1px solid transparent;
      transition: all 150ms ease;
      cursor: pointer;
    }
    .device-tab-btn:hover {
      color: white;
      background: var(--bg-tertiary);
    }
    .device-tab-btn.active {
      color: white;
      background: var(--bg-elevated);
      border-color: var(--border-subtle);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .device-tab-btn.mobile-active.active {
      border-color: rgba(249, 115, 22, 0.3);
      box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.2);
    }
  `]
})
export class DeviceTabComponent {
  store = inject(BuilderStore);
}
