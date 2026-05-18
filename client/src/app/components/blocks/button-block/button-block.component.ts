import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockProps } from '../../../store/builder.models';

@Component({
  selector: 'app-button-block',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a 
      [href]="props.href || '#'" 
      [target]="props.target || '_self'" 
      [ngStyle]="getStyles()"
      (click)="$event.preventDefault()">
      {{ props.label }}
    </a>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    a {
      text-decoration: none;
      display: inline-block;
      transition: opacity 0.2s;
    }
    a:hover {
      opacity: 0.9;
    }
  `]
})
export class ButtonBlockComponent {
  @Input() props!: BlockProps;

  getStyles() {
    return {
      'background-color': this.props.backgroundColor,
      'color': this.props.color,
      'font-size': this.props.fontSize,
      'font-weight': this.props.fontWeight,
      'padding': this.props.padding,
      'margin': this.props.margin,
      'border-radius': this.props.borderRadius
    };
  }
}
