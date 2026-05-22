import { BlockAnimation } from '../models/animation.models';

export type BlockType = 'text' | 'heading' | 'image' | 'button' | 'section' | 'divider' | 'spacer' | 'video' | 'columns' | 'card' | 'form' | 'input' | 'icon' | 'html' | 'map';

export interface BlockProps {
  // Text props
  content?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: string;
  color?: string;
  padding?: string;
  margin?: string;
  lineHeight?: string;

  // Image props
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  objectFit?: string;
  borderRadius?: string;

  // Button props
  label?: string;
  backgroundColor?: string;
  hoverColor?: string;
  href?: string;
  target?: string;
  placeholder?: string;
  inputType?: string;

  // New blocks props
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  thickness?: string;
  columns?: number;
  gap?: string;
  videoUrl?: string;
  cardTitle?: string;
  cardText?: string;
  cardButtonText?: string;
  iconName?: string;
  iconSize?: number;
  htmlContent?: string;
  address?: string;
  zoom?: number;

  // Shared
  border?: string;
  shadow?: string;
  opacity?: number;
  display?: string;
  minHeight?: string;

  // NEW responsive props
  mobileHide?: boolean;
  mobileFontSize?: string;
  mobilePadding?: string;
  mobileMargin?: string;
  mobileTextAlign?: string;
  mobileWidth?: string;
  mobileDisplay?: string;
  mobileFlexDirection?: string;
  mobileGridColumns?: string;

  // Theme settings
  useThemeColors?: boolean;
  useThemeFonts?: boolean;
  useThemeRadius?: boolean;

  videoBackground?: VideoBackground;
  [key: string]: any;
}

export interface VideoBackground {
  enabled: boolean;
  type: 'youtube' | 'mp4' | 'none';
  
  // Video source
  youtubeUrl: string;
  youtubeId: string;
  mp4Url: string;
  
  // Playback settings
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  startTime: number;
  playbackSpeed: number;
  
  // Overlay settings
  overlayEnabled: boolean;
  overlayColor: string;
  overlayOpacity: number;
  overlayBlur: number;
  
  // Fallback
  fallbackImage: string;
  mobileFallbackImage: string;
  
  // Display
  objectFit?: 'cover' | 'contain';
  position?: string;
}

export function getDefaultVideoBackground(): VideoBackground {
  return {
    enabled: false,
    type: 'none',
    youtubeUrl: '',
    youtubeId: '',
    mp4Url: '',
    autoplay: true,
    loop: true,
    muted: true,
    startTime: 0,
    playbackSpeed: 1,
    overlayEnabled: true,
    overlayColor: '#000000',
    overlayOpacity: 40,
    overlayBlur: 0,
    fallbackImage: '',
    mobileFallbackImage: '',
    objectFit: 'cover',
    position: 'center center'
  };
}

export interface CanvasBlock {
  id: string;
  type: BlockType;
  props: BlockProps;
  mobileProps?: BlockProps | null;
  visibility?: {
    desktop: boolean;
    mobile: boolean;
    tablet: boolean;
  };
  mobileOrder?: number | null;
  children?: CanvasBlock[];
  locked?: boolean;
  hidden?: boolean;
  animation?: BlockAnimation;
}

export interface SavedComponent {
  id: string;
  name: string;
  block: CanvasBlock;
  createdAt: string;
}

export interface GlobalStyles {
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  baseFontSize: string;
}

export interface BuilderPageTab {
  id: string;
  title: string;
  slug: string;
  blocks: CanvasBlock[];
}

export interface PageVersion {
  _id: string;
  pageId: string;
  blocks: CanvasBlock[];
  blockCount: number;
  createdAt: string;
  label?: string;
}

export interface PageData {
  id?: string;
  title: string;
  slug: string;
  blocks: CanvasBlock[];
  globalStyles?: GlobalStyles;
  createdAt?: Date;
  updatedAt?: Date;
  published?: boolean;
}

export interface EditorState {
  blocks: CanvasBlock[];
  pages: BuilderPageTab[];
  activePageId: string | null;
  globalStyles: GlobalStyles;
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
  history: CanvasBlock[][];
  historyIndex: number;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  isDirty: boolean;
}
