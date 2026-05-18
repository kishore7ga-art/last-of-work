import { Component, Input, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockProps } from '../../../store/builder.models';

@Component({
  selector: 'app-html-block',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div [ngStyle]="getStyles()" [innerHTML]="props.htmlContent"></div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class HtmlBlockComponent {
  @Input() props!: BlockProps;

  getStyles() {
    return {
      'padding': this.props.padding,
      'margin': this.props.margin,
      'width': this.props.width || '100%'
    };
  }
}
