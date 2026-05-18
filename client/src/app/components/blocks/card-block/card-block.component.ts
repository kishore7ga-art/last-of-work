import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockProps } from '../../../store/builder.models';

@Component({
  selector: 'app-card-block',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [ngStyle]="getContainerStyles()" class="flex flex-col overflow-hidden">
      <img *ngIf="props.src" [src]="props.src" class="w-full h-48 object-cover" />
      <div [ngStyle]="getContentStyles()">
        <h3 class="text-xl font-bold mb-2" [ngStyle]="{'color': props.color}">{{ props.cardTitle }}</h3>
        <p class="text-gray-600 mb-4">{{ props.cardText }}</p>
        <button [ngStyle]="getButtonStyles()">{{ props.cardButtonText }}</button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class CardBlockComponent {
  @Input() props!: BlockProps;

  getContainerStyles() {
    return {
      'background-color': this.props.backgroundColor,
      'border-radius': this.props.borderRadius,
      'box-shadow': this.props.shadow,
      'margin': this.props.margin,
      'width': this.props.width || '100%',
      'border': this.props.border
    };
  }

  getContentStyles() {
    return {
      'padding': this.props.padding || '20px'
    };
  }

  getButtonStyles() {
    return {
      'background-color': '#3b82f6',
      'color': '#ffffff',
      'padding': '8px 16px',
      'border-radius': '6px',
      'font-weight': '500',
      'border': 'none',
      'cursor': 'pointer'
    };
  }
}
