import { Component, Input, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { VideoBackground } from '../../../store/builder.models';
import { VideoService } from '../../../services/video.service';

@Component({
  selector: 'app-video-background',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-background.component.html',
  styleUrls: ['./video-background.component.scss']
})
export class VideoBackgroundComponent implements OnInit, OnDestroy {
  private videoService = inject(VideoService);
  private sanitizer = inject(DomSanitizer);
  
  @Input() video!: VideoBackground;
  @Input() isEditing = false;
  
  showFallback = signal(false);
  isMobile = signal(false);
  
  safeEmbedUrl = computed(() => {
    if (!this.video || !this.video.youtubeId) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      this.videoService.buildYoutubeEmbedUrl(
        this.video.youtubeId,
        this.video
      )
    );
  });
  
  overlayStyle = computed(() => {
    if (!this.video) return {};
    return this.videoService.buildOverlayStyle(this.video);
  });
  
  ngOnInit(): void {
    this.checkMobile();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.onResize);
    }
  }
  
  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResize);
    }
  }
  
  private onResize = () => {
    this.checkMobile();
  };
  
  private checkMobile(): void {
    const mobile = this.videoService.isMobile();
    this.isMobile.set(mobile);
    if (mobile) {
      this.showFallback.set(true);
    }
  }
  
  onVideoError(): void {
    this.showFallback.set(true);
  }
}
