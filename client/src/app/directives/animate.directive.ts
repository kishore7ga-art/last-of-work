import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, inject } from '@angular/core';
import { BlockAnimation } from '../models/animation.models';

@Directive({
  selector: '[mbAnimate]',
  standalone: true
})
export class AnimateDirective implements OnInit, OnChanges, OnDestroy {

  @Input('mbAnimate') animation!: BlockAnimation | undefined;
  
  // When true: plays immediately (editor preview)
  @Input() mbAnimatePreview = false;

  private el = inject(ElementRef);
  private observer: IntersectionObserver | null = null;
  private twTimer: any = null;
  private originalText = '';
  private isPlaying = false;

  ngOnInit(): void {
    this.setup();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['animation'] || changes['mbAnimatePreview']) {
      this.cleanup();
      this.setup();
    }
  }

  setup(): void {
    const anim = this.animation;
    if (!anim?.enabled || anim.type === 'none') {
      // No animation: ensure visible
      this.el.nativeElement.style.opacity = '';
      this.el.nativeElement.classList.remove('mb-anim-ready', 'mb-anim-play');
      return;
    }

    if (this.mbAnimatePreview) {
      // Editor preview: play immediately
      this.playAnimation();
      return;
    }

    // Set initial hidden state
    this.el.nativeElement.classList.add('mb-anim-ready');

    // Create IntersectionObserver
    const documentContainer = document.querySelector('.drop-zone') || document.body;
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.isPlaying) {
            this.playAnimation();
            if (anim.triggerOnce) {
              this.observer?.unobserve(this.el.nativeElement);
            }
          } else if (!entry.isIntersecting && !anim.triggerOnce) {
            this.resetAnimation();
          }
        });
      },
      {
        threshold: anim.threshold || 0.15,
        root: documentContainer,
        rootMargin: '100px 0px'
      }
    );

    this.observer.observe(this.el.nativeElement);
  }

  private NATURAL_DEFAULTS: Record<string, {
    duration: number;
    easing: string;
  }> = {
    fadeIn:       { duration: 800, easing: 'ease-out' },
    fadeInUp:     { duration: 700, easing: 'ease-out' },
    fadeInDown:   { duration: 700, easing: 'ease-out' },
    fadeInLeft:   { duration: 650, easing: 'ease-out' },
    fadeInRight:  { duration: 650, easing: 'ease-out' },
    slideUp:      { duration: 500, easing: 'cubic-bezier(0.25,0.46,0.45,0.94)' },
    slideDown:    { duration: 500, easing: 'cubic-bezier(0.25,0.46,0.45,0.94)' },
    slideLeft:    { duration: 450, easing: 'cubic-bezier(0.25,0.46,0.45,0.94)' },
    slideRight:   { duration: 450, easing: 'cubic-bezier(0.25,0.46,0.45,0.94)' },
    zoomIn:       { duration: 600, easing: 'cubic-bezier(0.175,0.885,0.32,1.275)' },
    zoomOut:      { duration: 700, easing: 'ease-out' },
    zoomInUp:     { duration: 650, easing: 'cubic-bezier(0.175,0.885,0.32,1.275)' },
    bounceIn:     { duration: 800, easing: 'linear' },
    bounceInUp:   { duration: 900, easing: 'linear' },
    bounceInDown: { duration: 900, easing: 'linear' },
    bounceInLeft: { duration: 850, easing: 'linear' },
    bounceInRight:{ duration: 850, easing: 'linear' },
    pulse:        { duration: 1000, easing: 'ease-in-out' },
    bounce:       { duration: 1200, easing: 'linear' },
    flipInX:      { duration: 1000, easing: 'linear' },
    flipInY:      { duration: 1000, easing: 'linear' },
    rotateIn:     { duration: 900, easing: 'cubic-bezier(0.175,0.885,0.32,1.275)' },
    shake:        { duration: 600, easing: 'ease-in-out' },
    wobble:       { duration: 1000, easing: 'ease-in-out' },
    wiggle:       { duration: 800, easing: 'ease-in-out' },
    jello:        { duration: 900, easing: 'linear' },
    heartBeat:    { duration: 1300, easing: 'ease-in-out' },
    flash:        { duration: 1000, easing: 'ease-in-out' },
    rubberBand:   { duration: 1000, easing: 'linear' },
    blurIn:       { duration: 900, easing: 'ease-out' },
    glitch:       { duration: 800, easing: 'steps(1)' }
  };

  playAnimation(): void {
    const anim = this.animation!;
    this.isPlaying = true;

    if (anim.type === 'typewriter') {
      this.playTypewriter();
      return;
    }

    const el = this.el.nativeElement as HTMLElement;

    // Remove ready class
    el.classList.remove('mb-anim-ready');

    // Clear any existing animation
    el.style.animation = 'none';
    void el.offsetHeight; // Force reflow

    const defaults = this.NATURAL_DEFAULTS[anim.type]
      || { duration: 600, easing: 'ease-out' };

    // Use user-set duration OR natural default
    const duration = anim.duration === 600
      ? defaults.duration  // Still at default
      : anim.duration;     // User customized it

    const easing = anim.easing === 'ease-out'
      ? defaults.easing    // Still at default
      : anim.easing;       // User customized it

    // Build animation value
    const iterCount = 
      anim.repeat === 'once' ? '1' :
      anim.repeat === 'loop' ? 'infinite' :
      String(anim.repeat);

    el.style.animation = [
      `mb-${anim.type}`,
      `${duration}ms`,
      easing,
      `${anim.delay}ms`,
      iterCount,
      anim.direction,
      'both'
    ].join(' ');

    // Add play classes
    el.classList.add('mb-anim-play', `mb-${anim.type}`);

    // Handle stagger for children
    if (anim.stagger) {
      this.applyStagger(el, anim);
    }

    // Reset isPlaying after animation
    const totalTime = anim.delay + duration;
    setTimeout(() => {
      this.isPlaying = false;
    }, totalTime + 100);
  }

  resetAnimation(): void {
    const el = this.el.nativeElement as HTMLElement;
    el.style.animation = 'none';
    el.classList.remove('mb-anim-play');
    el.classList.add('mb-anim-ready');
    this.isPlaying = false;
    void el.offsetHeight; // Force reflow
  }

  applyStagger(parent: HTMLElement, anim: BlockAnimation): void {
    const children = Array.from(parent.children) as HTMLElement[];
    
    const defaults = this.NATURAL_DEFAULTS[anim.type]
      || { duration: 600, easing: 'ease-out' };

    const duration = anim.duration === 600
      ? defaults.duration
      : anim.duration;

    const easing = anim.easing === 'ease-out'
      ? defaults.easing
      : anim.easing;

    children.forEach((child, i) => {
      child.style.opacity = '0';
      child.style.animation = 'none';
      
      setTimeout(() => {
        child.style.animation = [
          `mb-${anim.type}`,
          `${duration}ms`,
          easing,
          '0ms',
          '1',
          'normal',
          'both'
        ].join(' ');
        child.style.opacity = '';
        child.classList.add('mb-anim-play', `mb-${anim.type}`);
      }, i * anim.staggerMs + anim.delay);
    });
  }

  playTypewriter(): void {
    const el = this.el.nativeElement as HTMLElement;
    const anim = this.animation!;
    
    // Get original text
    this.originalText = el.textContent?.trim() || '';
    
    // Clear element
    el.innerHTML = '';
    el.style.opacity = '1';
    el.style.visibility = 'visible';
    el.classList.remove('mb-anim-ready');
    
    // Create text span and cursor
    const textSpan = document.createElement('span');
    el.appendChild(textSpan);
    
    let cursorEl: HTMLElement | null = null;
    if (anim.twCursor) {
      cursorEl = document.createElement('span');
      cursorEl.className = 'mb-tw-cursor';
      cursorEl.textContent = '|';
      el.appendChild(cursorEl);
    }
    
    let i = 0;
    const typeChar = () => {
      if (i < this.originalText.length) {
        textSpan.textContent += this.originalText[i];
        i++;
        this.twTimer = setTimeout(typeChar, anim.twSpeed);
      } else {
        // Done typing
        this.isPlaying = false;
        if (anim.twLoop) {
          // Wait then delete
          this.twTimer = setTimeout(() => {
            this.deleteTypewriter(textSpan, cursorEl, anim);
          }, 1500);
        } else if (!anim.twCursor && cursorEl) {
          // Remove cursor after done
          setTimeout(() => {
            cursorEl?.remove();
          }, 600);
        }
      }
    };
    
    setTimeout(typeChar, anim.delay);
  }

  deleteTypewriter(textSpan: HTMLElement, cursorEl: HTMLElement | null, anim: BlockAnimation): void {
    const deleteChar = () => {
      const text = textSpan.textContent || '';
      if (text.length > 0) {
        textSpan.textContent = text.slice(0, -1);
        this.twTimer = setTimeout(deleteChar, anim.twSpeed / 2);
      } else {
        // Restart
        this.twTimer = setTimeout(() => {
          let i = 0;
          const reType = () => {
            if (i < this.originalText.length) {
              textSpan.textContent += this.originalText[i];
              i++;
              this.twTimer = setTimeout(reType, anim.twSpeed);
            } else if (anim.twLoop) {
              this.twTimer = setTimeout(() => {
                this.deleteTypewriter(textSpan, cursorEl, anim);
              }, 1500);
            }
          };
          reType();
        }, 300);
      }
    };
    deleteChar();
  }

  cleanup(): void {
    this.observer?.disconnect();
    this.observer = null;
    clearTimeout(this.twTimer);
    this.isPlaying = false;
    
    const el = this.el.nativeElement as HTMLElement;
    el.style.animation = '';
    el.style.opacity = '';
    el.classList.remove('mb-anim-ready', 'mb-anim-play');
    
    // Remove all mb- classes
    const toRemove = Array.from(el.classList).filter(c => c.startsWith('mb-'));
    toRemove.forEach(c => el.classList.remove(c));
  }

  ngOnDestroy(): void {
    this.cleanup();
  }
}
