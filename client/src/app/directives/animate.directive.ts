import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, inject } from '@angular/core';
import { BlockAnimation } from '../models/animation.models';

@Directive({
  selector: '[mbAnimate]',
  standalone: true
})
export class AnimateDirective 
  implements OnInit, OnChanges, OnDestroy {

  @Input('mbAnimate') 
  animation?: BlockAnimation
  
  @Input() mbPreview = false

  private el = inject(ElementRef)
  private observer: IntersectionObserver | null = null
  private twTimer: ReturnType<typeof setTimeout> | null 
    = null
  private originalText = ''
  private hasPlayed = false

  ngOnInit(): void {
    // Small delay to ensure DOM is ready
    setTimeout(() => this.init(), 100)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mbPreview'] && 
        changes['mbPreview'].currentValue === true) {
      this.cleanup()
      setTimeout(() => this.playNow(), 50)
    }
    if (changes['animation'] && !changes['animation']
        .firstChange) {
      this.cleanup()
      setTimeout(() => this.init(), 100)
    }
  }

  private init(): void {
    const anim = this.animation
    const el = this.el.nativeElement as HTMLElement
    
    if (!anim?.enabled || anim.type === 'none') {
      el.style.opacity = '1'
      el.style.animation = ''
      el.classList.remove('mb-anim-ready')
      return
    }

    if (this.mbPreview) {
      this.playNow()
      return
    }

    // Set initial hidden state
    el.style.opacity = '0'
    el.style.willChange = 'transform, opacity'

    // Create observer
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.playNow()
            if (anim.triggerOnce ?? true) {
              this.observer?.unobserve(el)
            }
          } else if (!(anim.triggerOnce ?? true) && 
                     this.hasPlayed) {
            this.reset()
          }
        })
      },
      {
        threshold: anim.threshold ?? 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    this.observer.observe(el)
  }

  private playNow(): void {
    const anim = this.animation
    if (!anim) return;
    const el = this.el.nativeElement as HTMLElement
    this.hasPlayed = true

    if (anim.type === 'typewriter') {
      this.runTypewriter()
      return
    }

    // Get natural defaults
    const defaults = NATURAL_DEFAULTS[anim.type] 
      || { duration: 600, easing: 'ease-out' }
    
    const duration = anim.duration ?? defaults.duration
    const easing = anim.easing === 'ease-out' 
      ? defaults.easing 
      : (anim.easing ?? defaults.easing)

    const delay = anim.delay ?? 0
    const repeat = anim.repeat ?? 'once'
    const direction = anim.direction ?? 'normal'

    const iterCount = 
      repeat === 'once' ? '1' :
      repeat === 'loop' ? 'infinite' :
      String(repeat)

    // Force reset then play
    el.style.animation = 'none'
    el.style.opacity = '0'
    
    // Use requestAnimationFrame for reliability
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = ''
        el.style.animation = [
          `mb-${anim.type}`,
          `${duration}ms`,
          easing,
          `${delay}ms`,
          iterCount,
          direction,
          'both'
        ].join(' ')
        
        // Stagger children if section
        if ((anim.stagger ?? false) && 
            el.children.length > 0) {
          this.applyStagger(el, anim)
        }
      })
    })
  }

  private applyStagger(
    parent: HTMLElement,
    anim: BlockAnimation): void {
    
    const children = Array.from(
      parent.children) as HTMLElement[]
    const staggerMs = anim.staggerMs ?? 120
    const defaults = NATURAL_DEFAULTS[anim.type]
      || { duration: 600, easing: 'ease-out' }
    
    children.forEach((child, i) => {
      const childHtml = child as HTMLElement;
      childHtml.style.opacity = '0'
      childHtml.style.animation = 'none'
      
      setTimeout(() => {
        childHtml.style.animation = [
          `mb-${anim.type}`,
          `${anim.duration ?? defaults.duration}ms`,
          anim.easing ?? defaults.easing,
          '0ms',
          '1',
          'normal',
          'both'
        ].join(' ')
        childHtml.style.opacity = ''
      }, i * staggerMs + (anim.delay ?? 0))
    })
  }

  private reset(): void {
    const el = this.el.nativeElement as HTMLElement
    el.style.animation = 'none'
    el.style.opacity = '0'
    this.hasPlayed = false
  }

  private runTypewriter(): void {
    const anim = this.animation!
    const el = this.el.nativeElement as HTMLElement
    
    this.originalText = el.textContent?.trim() || ''
    el.style.opacity = '1'
    el.innerHTML = ''
    
    const textSpan = document.createElement('span')
    el.appendChild(textSpan)
    
    if (anim.twCursor ?? true) {
      const cursor = document.createElement('span')
      cursor.className = 'mb-tw-cursor'
      cursor.textContent = '|'
      cursor.style.cssText = 
        'animation:mb-cursor-blink 0.7s ' +
        'step-end infinite;margin-left:1px;'
      el.appendChild(cursor)
    }
    
    let i = 0
    const speed = anim.twSpeed ?? 60
    const delay = anim.delay ?? 0
    
    setTimeout(() => {
      const type = () => {
        if (i < this.originalText.length) {
          textSpan.textContent += 
            this.originalText[i++]
          this.twTimer = setTimeout(type, speed)
        }
      }
      type()
    }, delay)
  }

  private cleanup(): void {
    this.observer?.disconnect()
    this.observer = null
    if (this.twTimer) clearTimeout(this.twTimer)
    this.twTimer = null
    this.hasPlayed = false
    
    const el = this.el.nativeElement as HTMLElement
    el.style.animation = ''
    el.style.opacity = ''
    el.style.willChange = ''
  }

  ngOnDestroy(): void { this.cleanup() }
}

// Natural defaults constant (outside class)
export const NATURAL_DEFAULTS: Record<string, {
  duration: number, easing: string
}> = {
  fadeIn:        { duration: 800, easing: 'ease-out' },
  fadeInUp:      { duration: 700, easing: 'ease-out' },
  fadeInDown:    { duration: 700, easing: 'ease-out' },
  fadeInLeft:    { duration: 650, easing: 'ease-out' },
  fadeInRight:   { duration: 650, easing: 'ease-out' },
  slideUp:       { duration: 500, easing:'cubic-bezier(0.25,0.46,0.45,0.94)' },
  slideDown:     { duration: 500, easing:'cubic-bezier(0.25,0.46,0.45,0.94)' },
  slideLeft:     { duration: 450, easing:'cubic-bezier(0.25,0.46,0.45,0.94)' },
  slideRight:    { duration: 450, easing:'cubic-bezier(0.25,0.46,0.45,0.94)' },
  zoomIn:        { duration: 600, easing:'cubic-bezier(0.175,0.885,0.32,1.275)' },
  zoomOut:       { duration: 700, easing: 'ease-out' },
  zoomInUp:      { duration: 650, easing:'cubic-bezier(0.175,0.885,0.32,1.275)' },
  bounceIn:      { duration: 800, easing: 'linear' },
  bounceInUp:    { duration: 900, easing: 'linear' },
  bounceInDown:  { duration: 900, easing: 'linear' },
  bounceInLeft:  { duration: 850, easing: 'linear' },
  bounceInRight: { duration: 850, easing: 'linear' },
  pulse:         { duration: 1000, easing: 'ease-in-out' },
  bounce:        { duration: 1200, easing: 'linear' },
  flipInX:       { duration: 1000, easing: 'linear' },
  flipInY:       { duration: 1000, easing: 'linear' },
  rotateIn:      { duration: 900, easing:'cubic-bezier(0.175,0.885,0.32,1.275)' },
  shake:         { duration: 600, easing: 'ease-in-out' },
  wobble:        { duration: 1000, easing: 'ease-in-out' },
  wiggle:        { duration: 800, easing: 'ease-in-out' },
  jello:         { duration: 900, easing: 'linear' },
  heartBeat:     { duration: 1300, easing: 'ease-in-out' },
  flash:         { duration: 1000, easing: 'ease-in-out' },
  rubberBand:    { duration: 1000, easing: 'linear' },
  blurIn:        { duration: 900, easing: 'ease-out' },
  glitch:        { duration: 800, easing: 'steps(1)' },
}
