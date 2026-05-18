export type BlockType = 'text' | 'heading' | 'image' | 'button' | 'section' | 'divider' | 'spacer' | 'video' | 'columns' | 'card' | 'form' | 'input' | 'icon' | 'html' | 'map';

export type AnimationType = 'none' | 'fadeIn' | 'slideUp' | 'slideLeft' | 'zoomIn' | 'bounce';

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

  // Animation props
  animation?: AnimationType;
  animationDelay?: number;
  animationDuration?: number;
}

export interface CanvasBlock {
  id: string;
  type: BlockType;
  props: BlockProps;
  children?: CanvasBlock[];
  locked?: boolean;
  hidden?: boolean;
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
