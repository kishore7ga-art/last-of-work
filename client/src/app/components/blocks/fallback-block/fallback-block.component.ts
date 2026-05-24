import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-fallback-block',
  standalone: true,
  template: `
    <div style="
      padding:12px 16px;
      background:#fef3c7;
      border:1px dashed #f59e0b;
      border-radius:6px;
      font-size:12px;
      color:#92400e;
      display:flex;
      align-items:center;
      gap:8px;">
      ⚠️ Unknown block: "{{ props?.type }}"
    </div>
  `
})
export class FallbackBlockComponent {
  @Input() props: any;
}
