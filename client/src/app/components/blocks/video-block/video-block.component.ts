import { Component, Input, ChangeDetectionStrategy, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BlockProps } from '../../../store/builder.models';

@Pipe({
  name: 'safeUrl',
  standalone: true
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
  selector: 'app-video-block',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [ngStyle]="getContainerStyles()" class="relative overflow-hidden w-full">
      <iframe 
        [src]="props.videoUrl || '' | safeUrl" 
        [ngStyle]="getIframeStyles()"
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class VideoBlockComponent {
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
      'height': this.props.height || '400px',
      'border-radius': this.props.borderRadius
    };
  }
}
