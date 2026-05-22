export type AnimationType =
  'none' |
  'fadeIn' | 'fadeInUp' | 'fadeInDown' |
  'fadeInLeft' | 'fadeInRight' |
  'slideUp' | 'slideDown' |
  'slideLeft' | 'slideRight' |
  'zoomIn' | 'zoomOut' | 'zoomInUp' |
  'bounceIn' | 'bounceInUp' | 'bounceInDown' |
  'bounceInLeft' | 'bounceInRight' |
  'pulse' | 'bounce' |
  'flipInX' | 'flipInY' | 'rotateIn' |
  'shake' | 'wobble' | 'wiggle' |
  'jello' | 'heartBeat' | 'flash' | 'rubberBand' |
  'blurIn' | 'glitch' |
  'typewriter';

export type EasingType =
  'ease' | 'ease-in' | 'ease-out' |
  'ease-in-out' | 'linear' |
  'cubic-bezier(0.68,-0.55,0.265,1.55)' |
  'cubic-bezier(0.36,0.07,0.19,0.97)';

export interface BlockAnimation {
  enabled: boolean;
  type: AnimationType;

  // Timing
  duration: number;      // ms — default 600
  delay: number;         // ms — default 0
  easing: EasingType;    // default 'ease-out'

  // Repeat
  repeat: 'once' | 'loop' | number;
  // once = play 1 time
  // loop = infinite
  // number = play N times

  // Direction
  direction: 'normal' | 'reverse' |
    'alternate' | 'alternate-reverse';

  // Scroll trigger
  threshold: number;     // 0-1 default 0.15
  triggerOnce: boolean;  // default true

  // Stagger (sections)
  stagger: boolean;
  staggerMs: number;     // ms between children

  // Typewriter (text/heading only)
  twSpeed: number;       // ms per char, default 60
  twCursor: boolean;     // show cursor
  twLoop: boolean;       // loop after done
}

export function defaultAnimation(): BlockAnimation {
  return {
    enabled: false,
    type: 'fadeInUp',
    duration: 600,
    delay: 0,
    easing: 'ease-out',
    repeat: 'once',
    direction: 'normal',
    threshold: 0.15,
    triggerOnce: true,
    stagger: false,
    staggerMs: 120,
    twSpeed: 60,
    twCursor: true,
    twLoop: false,
  };
}

export interface AnimationGroup {
  label: string;
  icon: string;
  color: string;
  items: {
    type: AnimationType;
    label: string;
    textOnly?: boolean;
  }[];
}

export const ANIMATION_GROUPS: AnimationGroup[] = [
  {
    label: 'Fade',
    icon: 'Sparkles',
    color: '#818cf8',
    items: [
      { type: 'fadeIn',      label: 'Fade In' },
      { type: 'fadeInUp',    label: 'Fade Up' },
      { type: 'fadeInDown',  label: 'Fade Down' },
      { type: 'fadeInLeft',  label: 'Fade Left' },
      { type: 'fadeInRight', label: 'Fade Right' },
    ]
  },
  {
    label: 'Slide',
    icon: 'MoveRight',
    color: '#34d399',
    items: [
      { type: 'slideUp',    label: 'Slide Up' },
      { type: 'slideDown',  label: 'Slide Down' },
      { type: 'slideLeft',  label: 'Slide Left' },
      { type: 'slideRight', label: 'Slide Right' },
    ]
  },
  {
    label: 'Zoom',
    icon: 'ZoomIn',
    color: '#60a5fa',
    items: [
      { type: 'zoomIn',    label: 'Zoom In' },
      { type: 'zoomOut',   label: 'Zoom Out' },
      { type: 'zoomInUp',  label: 'Zoom Up' },
    ]
  },
  {
    label: 'Bounce',
    icon: 'Zap',
    color: '#fbbf24',
    items: [
      { type: 'bounceIn',      label: 'Bounce In' },
      { type: 'bounceInUp',    label: 'Bounce Up' },
      { type: 'bounceInDown',  label: 'Bounce Down' },
      { type: 'bounceInLeft',  label: 'Bounce Left' },
      { type: 'bounceInRight', label: 'Bounce Right' },
      { type: 'pulse',         label: 'Pulse' },
      { type: 'bounce',        label: 'Bounce Loop' },
    ]
  },
  {
    label: 'Flip',
    icon: 'RefreshCw',
    color: '#f472b6',
    items: [
      { type: 'flipInX',  label: 'Flip X' },
      { type: 'flipInY',  label: 'Flip Y' },
      { type: 'rotateIn', label: 'Rotate In' },
    ]
  },
  {
    label: 'Attention',
    icon: 'AlertCircle',
    color: '#fb923c',
    items: [
      { type: 'shake',      label: 'Shake' },
      { type: 'wobble',     label: 'Wobble' },
      { type: 'wiggle',     label: 'Wiggle' },
      { type: 'jello',      label: 'Jello' },
      { type: 'heartBeat',  label: 'HeartBeat' },
      { type: 'flash',      label: 'Flash' },
      { type: 'rubberBand', label: 'Rubber Band' },
    ]
  },
  {
    label: 'Special',
    icon: 'Wand2',
    color: '#a78bfa',
    items: [
      { type: 'blurIn',     label: 'Blur In' },
      { type: 'glitch',     label: 'Glitch' },
      { type: 'typewriter', label: 'Typewriter',
        textOnly: true },
    ]
  },
];
