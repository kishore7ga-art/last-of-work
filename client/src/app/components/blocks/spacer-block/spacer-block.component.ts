import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockProps } from '../../../store/builder.models';

@Component({
  selector: 'app-spacer-block',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [ngStyle]="getStyles()"></div>`
})
export class SpacerBlockComponent {
  @Input() props!: BlockProps;

  getStyles() {
    return {
      'height': this.props.height || '40px',
      'width': this.props.width || '100%',
      'display': 'block'
    };
  }
}
