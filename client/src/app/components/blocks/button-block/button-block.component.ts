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
    const p = this.props;
    const useColors = p.useThemeColors !== false;
    const useFonts = p.useThemeFonts !== false;
    const useRadius = p.useThemeRadius !== false;

    let bgColor = p.backgroundColor;
    let color = p.color;

    if (useColors && (!bgColor || bgColor === '#2563eb' || bgColor === '#3b82f6' || bgColor === '#4f6ef7' || bgColor === '#10b981')) {
      bgColor = 'var(--theme-primary)';
      color = 'var(--theme-button-text)';
    } else if (useColors && (!color || color === '#ffffff')) {
      color = 'var(--theme-button-text)';
    }

    return {
      'background-color': bgColor,
      'color': color,
      'font-family': useFonts ? 'var(--theme-font-body)' : undefined,
      'font-size': p.fontSize,
      'font-weight': p.fontWeight,
      'padding': p.padding,
      'margin': p.margin,
      'border-radius': useRadius && (!p.borderRadius || p.borderRadius === '6px' || p.borderRadius === '8px') ? 'var(--theme-radius-btn)' : p.borderRadius
    };
  }
}
