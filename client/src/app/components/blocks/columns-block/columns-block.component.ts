import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockProps } from '../../../store/builder.models';

@Component({
  selector: 'app-columns-block',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [ngStyle]="getStyles()">
      <div *ngFor="let col of colsArray()" class="flex-1 min-h-[50px] border border-dashed border-gray-300 p-4 bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
        Column {{ col }}
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ColumnsBlockComponent {
  @Input() props!: BlockProps;

  colsArray() {
    return Array.from({ length: this.props.columns || 2 }, (_, i) => i + 1);
  }

  getStyles() {
    return {
      'display': 'flex',
      'gap': this.props.gap || '20px',
      'padding': this.props.padding,
      'margin': this.props.margin,
      'width': this.props.width || '100%',
      'min-height': this.props.minHeight || '100px',
      'background-color': this.props.backgroundColor
    };
  }
}
