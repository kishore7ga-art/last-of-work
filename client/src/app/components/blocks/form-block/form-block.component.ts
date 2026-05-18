import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockProps } from '../../../store/builder.models';

@Component({
  selector: 'app-form-block',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [ngStyle]="getStyles()">
      <form (submit)="$event.preventDefault()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Your name" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="you@example.com" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea class="w-full border border-gray-300 rounded-md px-3 py-2 h-24 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Your message..."></textarea>
        </div>
        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
          Submit
        </button>
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class FormBlockComponent {
  @Input() props!: BlockProps;

  getStyles() {
    return {
      'padding': this.props.padding,
      'margin': this.props.margin,
      'background-color': this.props.backgroundColor,
      'border-radius': this.props.borderRadius,
      'box-shadow': this.props.shadow,
      'width': this.props.width || '100%',
      'border': this.props.border
    };
  }
}
