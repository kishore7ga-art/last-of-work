import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, inject } from '@angular/core';
import { BlockAnimation } from '../models/animation.models';

@Directive({
  selector: '[mbAnimate]',
  standalone: true
})
export class AnimateDirective
  implements OnInit, OnChanges, OnDestroy {

  @Input('mbAnimate') animation?: BlockAnimation
  @Input() mbPreview = false

  private el = inject(ElementRef)
  private observer: IntersectionObserver | null = null
  private twTimer: any = null
  private hasPlayed = false
  private originalText = ''

  private readonly DEFAULTS: Record<string, {
    dur: number, ease: string
  }> = {
    fadeIn:        {dur:800, ease:'ease-out'},
    fadeInUp:      {dur:700, ease:'ease-out'},
    fadeInDown:    {dur:700, ease:'ease-out'},
    fadeInLeft:    {dur:650, ease:'ease-out'},
    fadeInRight:   {dur:650, ease:'ease-out'},
    slideUp:       {dur:500, ease:
      'cubic-bezier(0.25,0.46,0.45,0.94)'},
    slideDown:     {dur:500, ease:
      'cubic-bezier(0.25,0.46,0.45,0.94)'},
    slideLeft:     {dur:450, ease:
      'cubic-bezier(0.25,0.46,0.45,0.94)'},
    slideRight:    {dur:450, ease:
      'cubic-bezier(0.25,0.46,0.45,0.94)'},
    zoomIn:        {dur:600, ease:
      'cubic-bezier(0.175,0.885,0.32,1.275)'},
    zoomOut:       {dur:700, ease:'ease-out'},
    zoomInUp:      {dur:650, ease:
      'cubic-bezier(0.175,0.885,0.32,1.275)'},
    bounceIn:      {dur:800, ease:'linear'},
    bounceInUp:    {dur:900, ease:'linear'},
    bounceInDown:  {dur:900, ease:'linear'},
    bounceInLeft:  {dur:850, ease:'linear'},
    bounceInRight: {dur:850, ease:'linear'},
    pulse:         {dur:1000,ease:'ease-in-out'},
    bounce:        {dur:1200,ease:'linear'},
    flipInX:       {dur:1000,ease:'linear'},
    flipInY:       {dur:1000,ease:'linear'},
    rotateIn:      {dur:900, ease:
      'cubic-bezier(0.175,0.885,0.32,1.275)'},
    shake:         {dur:600, ease:'ease-in-out'},
    wobble:        {dur:1000,ease:'ease-in-out'},
    wiggle:        {dur:800, ease:'ease-in-out'},
    jello:         {dur:900, ease:'linear'},
    heartBeat:     {dur:1300,ease:'ease-in-out'},
    flash:         {dur:1000,ease:'ease-in-out'},
    rubberBand:    {dur:1000,ease:'linear'},
    blurIn:        {dur:900, ease:'ease-out'},
    glitch:        {dur:800, ease:'steps(1)'},
  }

  ngOnInit(): void {
    setTimeout(() => this.init(), 150)
  }

  ngOnChanges(c: SimpleChanges): void {
    if (c['mbPreview']?.currentValue === true) {
      setTimeout(() => this.play(), 50)
    }
    if (c['animation'] && !c['animation']
        .firstChange) {
      this.cleanup()
      setTimeout(() => this.init(), 150)
    }
  }

  private init(): void {
    const anim = this.animation
    const el = this.el.nativeElement as HTMLElement

    if (!anim?.enabled || anim.type === 'none') {
      el.style.opacity = '1'
      el.style.animation = ''
      return
    }

    if (this.mbPreview) {
      this.play()
      return
    }

    el.style.opacity = '0'
    el.style.willChange = 'transform, opacity'

    this.observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting && !this.hasPlayed) {
          this.play()
          if (anim.triggerOnce ?? true) {
            this.observer?.unobserve(el)
          }
        } else if (
          !e.isIntersecting &&
          !(anim.triggerOnce ?? true) &&
          this.hasPlayed) {
          this.reset()
        }
      }),
      {
        threshold: anim.threshold ?? 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )
    this.observer.observe(el)
  }

  private play(): void {
    const anim = this.animation
    if (!anim) return
    const el = this.el.nativeElement as HTMLElement
    this.hasPlayed = true

    if (anim.type === 'typewriter') {
      this.runTypewriter()
      return
    }

    const def = this.DEFAULTS[anim.type]
      || { dur: 600, ease: 'ease-out' }

    const dur = anim.duration ?? def.dur
    const ease = anim.easing === 'ease-out'
      ? def.ease : (anim.easing ?? def.ease)
    const delay = anim.delay ?? 0
    const iter =
      anim.repeat === 'once' ? '1' :
      anim.repeat === 'loop' ? 'infinite' :
      String(anim.repeat ?? 1)

    el.style.animation = 'none'
    el.style.opacity = '0'

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = ''
        el.style.animation = [
          `mb-${anim.type}`,
          `${dur}ms`, ease,
          `${delay}ms`, iter,
          anim.direction ?? 'normal',
          'both'
        ].join(' ')
      })
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
    this.originalText = el.textContent?.trim()||''
    el.style.opacity = '1'
    el.innerHTML = ''

    const textSpan = document.createElement('span')
    el.appendChild(textSpan)

    if (anim.twCursor ?? true) {
      const cursor = document.createElement('span')
      cursor.className = 'mb-tw-cursor'
      cursor.textContent = '|'
      el.appendChild(cursor)
    }

    let i = 0
    const speed = anim.twSpeed ?? 60
    setTimeout(() => {
      const type = () => {
        if (i < this.originalText.length) {
          textSpan.textContent +=
            this.originalText[i++]
          this.twTimer = setTimeout(type, speed)
        }
      }
      type()
    }, anim.delay ?? 0)
  }

  private cleanup(): void {
    this.observer?.disconnect()
    this.observer = null
    if (this.twTimer) clearTimeout(this.twTimer)
    this.hasPlayed = false
    const el = this.el.nativeElement as HTMLElement
    el.style.animation = ''
    el.style.opacity = ''
    el.style.willChange = ''
  }

  ngOnDestroy(): void { this.cleanup() }
}
