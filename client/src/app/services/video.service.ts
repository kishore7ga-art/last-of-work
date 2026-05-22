import { Injectable } from '@angular/core';
import { VideoBackground } from '../store/builder.models';

@Injectable({ providedIn: 'root' })
export class VideoService {

  // Extract YouTube video ID from any URL format
  extractYoutubeId(url: string): string | null {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  // Build YouTube embed URL with all params
  buildYoutubeEmbedUrl(videoId: string, config: VideoBackground): string {
    const params = new URLSearchParams({
      autoplay: config.autoplay ? '1' : '0',
      loop: config.loop ? '1' : '0',
      mute: config.muted ? '1' : '0', // YouTube expects mute instead of muted in iframe API
      controls: '0',
      showinfo: '0',
      rel: '0',
      modestbranding: '1',
      playsinline: '1',
      enablejsapi: '1',
      start: config.startTime ? config.startTime.toString() : '0',
      playlist: videoId // required for loop
    });
    
    return 'https://www.youtube.com/embed/' + videoId + '?' + params.toString();
  }

  // Validate MP4 URL
  validateMp4Url(url: string): boolean {
    if (!url) return false;
    return url.endsWith('.mp4') 
      || url.includes('.mp4?')
      || url.includes('video/mp4');
  }

  // Get video thumbnail from YouTube
  getYoutubeThumbnail(videoId: string): string {
    if (!videoId) return '';
    return 'https://img.youtube.com/vi/' + videoId + '/maxresdefault.jpg';
  }

  // Check if device is mobile
  isMobile(): boolean {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  }

  // Build overlay CSS
  buildOverlayStyle(video: VideoBackground): object {
    return {
      position: 'absolute',
      inset: '0',
      backgroundColor: video.overlayColor || '#000000',
      opacity: (video.overlayOpacity ?? 40) / 100,
      backdropFilter: video.overlayBlur > 0
        ? 'blur(' + video.overlayBlur + 'px)'
        : 'none',
      zIndex: '1',
      pointerEvents: 'none'
    };
  }
}
