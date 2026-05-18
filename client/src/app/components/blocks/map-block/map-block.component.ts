import { Component, Input, ChangeDetectionStrategy, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BlockProps } from '../../../store/builder.models';

@Pipe({
  name: 'safeMapUrl',
  standalone: true
})
export class SafeMapUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(address: string, zoom: number): SafeResourceUrl {
    const query = encodeURIComponent(address || 'New York, NY');
    const url = `https://maps.google.com/maps?q=${query}&t=&z=${zoom || 12}&ie=UTF8&iwloc=&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
  selector: 'app-map-block',
  standalone: true,
  imports: [CommonModule, SafeMapUrlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [ngStyle]="getContainerStyles()" class="relative overflow-hidden w-full">
      <iframe 
        [src]="props.address || '' | safeMapUrl:(props.zoom || 12)" 
        [ngStyle]="getIframeStyles()"
        frameborder="0" 
        scrolling="no" 
        marginheight="0" 
        marginwidth="0">
      </iframe>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class MapBlockComponent {
  @Input() props!: BlockProps;

  getContainerStyles() {
    return {
      'padding': this.props.padding,
      'margin': this.props.margin,
      'width': this.props.width || '100%',
      'border-radius': this.props.borderRadius,
      'border': this.props.border,
      'box-shadow': this.props.shadow
    };
  }

  getIframeStyles() {
    return {
      'width': '100%',
      'height': this.props.height || '300px',
      'border-radius': this.props.borderRadius
    };
  }
}
