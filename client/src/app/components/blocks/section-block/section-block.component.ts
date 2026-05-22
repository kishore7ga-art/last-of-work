import { Component, Input, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockProps } from '../../../store/builder.models';
import { VideoBackgroundComponent } from '../video-background/video-background.component';
import { BuilderStore } from '../../../store/builder.store';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-section-block',
  standalone: true,
  imports: [CommonModule, VideoBackgroundComponent, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './section-block.component.html',
  styleUrls: ['./section-block.component.scss']
})
export class SectionBlockComponent {
  private store = inject(BuilderStore);
  
  @Input() props!: BlockProps;
  @Input() blockId!: string;
  @Input() isEditing = false;
  
  sectionStyle = computed(() => {
    const p = this.props;
    if (!p) return {};
    
    const useColors = p['useThemeColors'] !== false;
    const useRadius = p['useThemeRadius'] !== false;

    let bgColor = p.backgroundColor;
    if (useColors && (!bgColor || bgColor === '#ffffff' || bgColor === '#f9fafb' || bgColor === '#f8fafc' || bgColor === '#111827' || bgColor === '#0f172a')) {
      bgColor = 'var(--theme-surface)';
    }

    let radius = p.borderRadius;
    if (useRadius && (!radius || radius === '0px' || radius === '8px')) {
      radius = 'var(--theme-radius-card)';
    }

    const videoEnabled = p.videoBackground?.enabled;

    return {
      position: 'relative',
      overflow: 'hidden',
      display: p['display'] || 'block',
      'flex-direction': p['flexDirection'],
      'align-items': p['alignItems'],
      'justify-content': p['justifyContent'],
      'grid-template-columns': p['gridColumns'],
      gap: p['gap'],
      'box-shadow': p['shadow'],
      'background-color': videoEnabled ? 'transparent' : bgColor,
      padding: p.padding || '40px',
      'min-height': p.minHeight || 'auto',
      width: p.width || '100%',
      margin: p.margin,
      border: p.border,
      'border-radius': radius,
      background: !videoEnabled && p['gradientFrom'] && p['gradientTo'] 
        ? `linear-gradient(135deg, ${p['gradientFrom']}, ${p['gradientTo']})` 
        : (!videoEnabled && p.src ? `url(${p.src}) center/cover no-repeat` : undefined),
    };
  });
  
  contentStyle = computed(() => ({
    position: 'relative',
    'z-index': '2',  // above video and overlay
    width: '100%',
  }));

  togglePlayPause(event: Event): void {
    event.stopPropagation();
    if (!this.blockId || !this.props.videoBackground) return;
    const current = this.props.videoBackground;
    this.store.updateBlock(this.blockId, {
      videoBackground: { ...current, autoplay: !current.autoplay }
    });
  }

  updateOverlayOpacity(event: Event): void {
    event.stopPropagation();
    if (!this.blockId || !this.props.videoBackground) return;
    const value = +(event.target as HTMLInputElement).value;
    const current = this.props.videoBackground;
    this.store.updateBlock(this.blockId, {
      videoBackground: { ...current, overlayOpacity: value }
    });
  }

  removeVideoBackground(event: Event): void {
    event.stopPropagation();
    if (!this.blockId || !this.props.videoBackground) return;
    const current = this.props.videoBackground;
    this.store.updateBlock(this.blockId, {
      videoBackground: { ...current, enabled: false }
    });
  }
}
