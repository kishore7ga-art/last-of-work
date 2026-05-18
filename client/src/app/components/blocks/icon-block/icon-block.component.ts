import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { BlockProps } from '../../../store/builder.models';
import { appIconNames } from '../../../app-icons';

@Component({
  selector: 'app-icon-block',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [ngStyle]="getStyles()">
      <lucide-icon 
        [name]="getIconName()" 
        [size]="props.iconSize || 24" 
        [color]="props.color || '#3b82f6'">
      </lucide-icon>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class IconBlockComponent {
  @Input() props!: BlockProps;

  getIconName() {
    const iconName = this.props.iconName || 'star';
    return appIconNames.has(iconName) ? iconName : 'star';
  }

  getStyles() {
    return {
      'text-align': this.props.textAlign || 'center',
      'padding': this.props.padding,
      'margin': this.props.margin,
      'display': 'flex',
      'justify-content': this.props.textAlign === 'left' ? 'flex-start' : this.props.textAlign === 'right' ? 'flex-end' : 'center'
    };
  }
}
