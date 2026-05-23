import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-fallback-block',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="
      padding: 16px;
      background: #fef3c7;
      border: 1px dashed #f59e0b;
      border-radius: 6px;
      font-size: 12px;
      color: #92400e;
      margin: 8px 0;
    ">
      ⚠️ Unknown block type: {{ props?.type }}
    </div>
  `
})
export class FallbackBlockComponent {
  @Input() props: any;
}
