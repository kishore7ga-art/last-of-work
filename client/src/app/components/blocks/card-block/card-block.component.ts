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
        <h3 class="text-xl font-bold mb-2" [ngStyle]="getHeadingStyles()">{{ props.cardTitle }}</h3>
        <p class="mb-4" [ngStyle]="getTextStyles()">{{ props.cardText }}</p>
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
    const p = this.props;
    const useColors = p.useThemeColors !== false;
    const useRadius = p.useThemeRadius !== false;

    let bgColor = p.backgroundColor;
    if (useColors && (!bgColor || bgColor === '#ffffff' || bgColor === '#f9fafb' || bgColor === '#f8fafc' || bgColor === '#111827' || bgColor === '#0f172a')) {
      bgColor = 'var(--theme-surface)';
    }

    let radius = p.borderRadius;
    if (useRadius && (!radius || radius === '0px' || radius === '8px')) {
      radius = 'var(--theme-radius-card)';
    }

    return {
      'background-color': bgColor,
      'border-radius': radius,
      'box-shadow': p.shadow || 'var(--theme-shadow-card)',
      'margin': p.margin,
      'width': p.width || '100%',
      'border': p.border
    };
  }

  getContentStyles() {
    return {
      'padding': this.props.padding || '20px'
    };
  }
  
  getHeadingStyles() {
    const p = this.props;
    return {
      'color': (p.useThemeColors !== false) ? 'var(--theme-text)' : p.color,
      'font-family': (p.useThemeFonts !== false) ? 'var(--theme-font-heading)' : undefined,
      'font-weight': (p.useThemeFonts !== false) ? 'var(--theme-heading-weight)' : undefined
    };
  }
  
  getTextStyles() {
    const p = this.props;
    return {
      'color': (p.useThemeColors !== false) ? 'var(--theme-text-muted)' : '#4b5563',
      'font-family': (p.useThemeFonts !== false) ? 'var(--theme-font-body)' : undefined,
    };
  }

  getButtonStyles() {
    const p = this.props;
    return {
      'background-color': (p.useThemeColors !== false) ? 'var(--theme-primary)' : '#3b82f6',
      'color': (p.useThemeColors !== false) ? 'var(--theme-button-text)' : '#ffffff',
      'font-family': (p.useThemeFonts !== false) ? 'var(--theme-font-body)' : undefined,
      'padding': '8px 16px',
      'border-radius': (p.useThemeRadius !== false) ? 'var(--theme-radius-btn)' : '6px',
      'font-weight': '500',
      'border': 'none',
      'cursor': 'pointer'
    };
  }
}
