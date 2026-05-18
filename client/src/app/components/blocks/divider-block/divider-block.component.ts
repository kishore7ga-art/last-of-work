import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockProps } from '../../../store/builder.models';

@Component({
  selector: 'app-divider-block',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [ngStyle]="getContainerStyles()">
      <hr [ngStyle]="getDividerStyles()" />
    </div>
  `
})
export class DividerBlockComponent {
  @Input() props!: BlockProps;

  getContainerStyles() {
    return {
      'padding': this.props.padding,
      'margin': this.props.margin,
      'width': this.props.width
    };
  }

  getDividerStyles() {
    return {
      'border': 'none',
      'border-top-width': this.props.thickness || '1px',
      'border-top-style': 'solid',
      'border-top-color': this.props.color || '#e5e7eb',
      'margin': '0'
    };
  }
}
