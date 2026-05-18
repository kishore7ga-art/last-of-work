import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockProps } from '../../../store/builder.models';

@Component({
  selector: 'app-image-block',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <img 
      [src]="props.src || 'https://placehold.co/800x400'" 
      [alt]="props.alt" 
      [ngStyle]="getStyles()" />
  `,
  styles: [`
    :host {
      display: block;
    }
    img {
      max-width: 100%;
    }
  `]
})
export class ImageBlockComponent {
  @Input() props!: BlockProps;

  getStyles() {
    return {
      'width': this.props.width,
      'height': this.props.height,
      'object-fit': this.props.objectFit,
      'border-radius': this.props.borderRadius,
      'padding': this.props.padding,
      'margin': this.props.margin
    };
  }
}
