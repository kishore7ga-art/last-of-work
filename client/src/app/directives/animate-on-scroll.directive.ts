import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AnimationType } from '../store/builder.models';

@Directive({
  selector: '[animateOnScroll]',
  standalone: true
})
export class AnimateOnScrollDirective implements OnInit, OnChanges, OnDestroy {
  @Input() animationType: AnimationType = 'none';
  @Input() animationDelay: number = 0;
  @Input() animationDuration: number = 600;

  private observer?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit() {
    this.setupObserver();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['animationType'] && !changes['animationDelay'] && !changes['animationDuration']) return;
    this.setupObserver();
  }

  private setupObserver() {
    this.observer?.disconnect();
    this.el.nativeElement.style.opacity = '';
    this.el.nativeElement.style.transform = '';
    this.el.nativeElement.style.transition = '';
    if (!this.animationType || this.animationType === 'none') return;
    this.prepareElement();
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.trigger();
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    this.observer.observe(this.el.nativeElement);
  }

  private prepareElement() {
    const el = this.el.nativeElement;
    el.style.opacity = '0';
    el.style.transition = `opacity ${this.animationDuration}ms ease ${this.animationDelay}ms, transform ${this.animationDuration}ms ease ${this.animationDelay}ms`;

    switch (this.animationType) {
      case 'slideUp':    el.style.transform = 'translateY(40px)'; break;
      case 'slideLeft':  el.style.transform = 'translateX(-40px)'; break;
      case 'zoomIn':     el.style.transform = 'scale(0.85)'; break;
      case 'bounce':     el.style.transform = 'translateY(30px)'; break;
      default: break;
    }
  }

  private trigger() {
    const el = this.el.nativeElement;
    el.style.opacity = '1';

    if (this.animationType === 'bounce') {
      el.style.transition = `opacity ${this.animationDuration}ms ease ${this.animationDelay}ms, transform ${this.animationDuration * 0.6}ms cubic-bezier(0.34,1.56,0.64,1) ${this.animationDelay}ms`;
    }

    el.style.transform = 'translateY(0) translateX(0) scale(1)';
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
