import { Injectable, computed, signal } from '@angular/core';
import { BlockProps, BlockType, BuilderPageTab, CanvasBlock, GlobalStyles, SavedComponent } from './builder.models';
import { getDefaultProps } from '../utils/block-defaults';

@Injectable({
  providedIn: 'root'
})
export class BuilderStore {
  // State
  blocks = signal<CanvasBlock[]>([]);
  pages = signal<BuilderPageTab[]>([]);
  activePageId = signal<string | null>(null);
  selectedBlockId = signal<string | null>(null);
  hoveredBlockId = signal<string | null>(null);
  previewMode = signal<'desktop' | 'tablet' | 'mobile'>('desktop');
  history = signal<CanvasBlock[][]>([]);
  historyIndex = signal<number>(-1);
  globalStyles = signal<GlobalStyles>({
    fontFamily: 'Inter, sans-serif',
    primaryColor: '#3b82f6',
    secondaryColor: '#111827',
    accentColor: '#10b981',
    baseFontSize: '16px'
  });

  // Page Metadata State
  pageTitle = signal<string>('');
  pageSlug = signal<string>('');
  metaTitle = signal<string>('');
  metaDescription = signal<string>('');
  ogImage = signal<string>('');
  canonicalUrl = signal<string>('');
  customDomain = signal<string>('');
  published = signal<boolean>(false);

  // Computed
  selectedBlock = computed(() => {
    const id = this.selectedBlockId();
    if (!id) return null;
    return this.blocks().find(b => b.id === id) || null;
  });

  canUndo = computed(() => this.historyIndex() > 0);
  canRedo = computed(() => {
    const historyLength = this.history().length;
    return historyLength > 0 && this.historyIndex() < historyLength - 1;
  });
  
  blockCount = computed(() => this.blocks().length);

  // Methods
  generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private cloneBlocks(blocks: CanvasBlock[]): CanvasBlock[] {
    return JSON.parse(JSON.stringify(blocks));
  }

  private cloneBlockWithNewIds(block: CanvasBlock): CanvasBlock {
    const cloned = JSON.parse(JSON.stringify(block)) as CanvasBlock;
    const refresh = (item: CanvasBlock) => {
      item.id = this.generateId();
      item.children?.forEach(refresh);
    };
    refresh(cloned);
    return cloned;
  }

  private saveHistory(newBlocks: CanvasBlock[]) {
    const currentHistory = this.history();
    const currentIndex = this.historyIndex();
    
    // Remove future history if we are in the middle and making a new change
    const newHistory = currentHistory.slice(0, currentIndex + 1);
    
    newHistory.push(this.cloneBlocks(newBlocks));
    
    // Keep max 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    this.history.set(newHistory);
    this.historyIndex.set(newHistory.length - 1);
    this.blocks.set(newBlocks);
    this.syncActivePageBlocks(newBlocks);
  }

  private syncActivePageBlocks(blocks: CanvasBlock[]): void {
    const activeId = this.activePageId();
    if (!activeId) return;

    this.pages.update(pages =>
      pages.map(page => page.id === activeId ? { ...page, blocks: this.cloneBlocks(blocks) } : page)
    );
  }

  addBlock(type: BlockType): void {
    const newBlock: CanvasBlock = {
      id: this.generateId(),
      type,
      props: getDefaultProps(type)
    };
    
    const newBlocks = [...this.blocks(), newBlock];
    this.saveHistory(newBlocks);
    this.selectBlock(newBlock.id);
  }

  addBlockAtIndex(type: BlockType, index: number): void {
    const newBlock: CanvasBlock = {
      id: this.generateId(),
      type,
      props: getDefaultProps(type)
    };
    
    const newBlocks = [...this.blocks()];
    newBlocks.splice(index, 0, newBlock);
    
    this.saveHistory(newBlocks);
    this.selectBlock(newBlock.id);
  }

  addSavedComponentAtIndex(component: SavedComponent, index: number): void {
    const newBlock = this.cloneBlockWithNewIds(component.block);
    const newBlocks = [...this.blocks()];
    newBlocks.splice(index, 0, newBlock);
    this.saveHistory(newBlocks);
    this.selectBlock(newBlock.id);
  }

  selectBlock(id: string): void {
    this.selectedBlockId.set(id);
  }

  clearSelection(): void {
    this.selectedBlockId.set(null);
  }

  updateBlock(id: string, props: Partial<BlockProps>): void {
    const currentBlocks = this.blocks();
    const blockIndex = currentBlocks.findIndex(b => b.id === id);
    
    if (blockIndex === -1) return;

    const newBlocks = [...currentBlocks];
    newBlocks[blockIndex] = {
      ...newBlocks[blockIndex],
      props: { ...newBlocks[blockIndex].props, ...props }
    };

    this.saveHistory(newBlocks);
  }

  updateBlockMetadata(id: string, metadata: Partial<CanvasBlock>): void {
    const currentBlocks = this.blocks();
    const blockIndex = currentBlocks.findIndex(b => b.id === id);
    
    if (blockIndex === -1) return;

    const newBlocks = [...currentBlocks];
    newBlocks[blockIndex] = {
      ...newBlocks[blockIndex],
      ...metadata
    };

    this.saveHistory(newBlocks);
  }

  deleteBlock(id: string): void {
    const newBlocks = this.blocks().filter(b => b.id !== id);
    this.saveHistory(newBlocks);
    if (this.selectedBlockId() === id) {
      this.clearSelection();
    }
  }

  duplicateBlock(id: string): void {
    const currentBlocks = this.blocks();
    const blockIndex = currentBlocks.findIndex(b => b.id === id);
    
    if (blockIndex === -1) return;

    const blockToDuplicate = currentBlocks[blockIndex];
    const newBlock: CanvasBlock = {
      ...this.cloneBlockWithNewIds(blockToDuplicate),
      id: this.generateId()
    };

    const newBlocks = [...currentBlocks];
    newBlocks.splice(blockIndex + 1, 0, newBlock);
    
    this.saveHistory(newBlocks);
    this.selectBlock(newBlock.id);
  }

  reorderBlocks(previousIndex: number, currentIndex: number): void {
    const newBlocks = [...this.blocks()];
    const [movedBlock] = newBlocks.splice(previousIndex, 1);
    newBlocks.splice(currentIndex, 0, movedBlock);
    
    this.saveHistory(newBlocks);
  }

  undo(): void {
    if (!this.canUndo()) return;
    
    const newIndex = this.historyIndex() - 1;
    this.historyIndex.set(newIndex);
    const blocks = this.cloneBlocks(this.history()[newIndex]);
    this.blocks.set(blocks);
    this.syncActivePageBlocks(blocks);
  }

  redo(): void {
    if (!this.canRedo()) return;
    
    const newIndex = this.historyIndex() + 1;
    this.historyIndex.set(newIndex);
    const blocks = this.cloneBlocks(this.history()[newIndex]);
    this.blocks.set(blocks);
    this.syncActivePageBlocks(blocks);
  }

  setPreviewMode(mode: 'desktop' | 'tablet' | 'mobile'): void {
    this.previewMode.set(mode);
  }

  clearCanvas(): void {
    this.saveHistory([]);
    this.clearSelection();
  }

  loadBlocks(blocks: CanvasBlock[]): void {
    this.history.set([this.cloneBlocks(blocks)]);
    this.historyIndex.set(0);
    this.blocks.set(blocks);
    this.syncActivePageBlocks(blocks);
  }

  loadPages(pages: BuilderPageTab[], activePageId?: string | null): void {
    this.pages.set(pages.map(page => ({ ...page, blocks: this.cloneBlocks(page.blocks || []) })));
    if (activePageId) {
      this.switchPage(activePageId);
    } else if (pages.length > 0) {
      this.switchPage(pages[0].id);
    }
  }

  switchPage(pageId: string): void {
    const page = this.pages().find(item => item.id === pageId);
    if (!page) return;

    this.activePageId.set(page.id);
    this.pageTitle.set(page.title);
    this.pageSlug.set(page.slug);
    this.selectedBlockId.set(null);
    this.history.set([this.cloneBlocks(page.blocks || [])]);
    this.historyIndex.set(0);
    this.blocks.set(this.cloneBlocks(page.blocks || []));
  }

  addLocalPage(title: string, slug: string): BuilderPageTab {
    const page: BuilderPageTab = {
      id: this.generateId(),
      title,
      slug,
      blocks: []
    };
    this.pages.update(pages => [...pages, page]);
    this.switchPage(page.id);
    return page;
  }

  updateGlobalStyles(styles: Partial<GlobalStyles>): void {
    this.globalStyles.update(current => ({ ...current, ...styles }));
  }

  loadPageSettings(settings: { title: string, slug?: string, metaTitle?: string, metaDescription?: string, ogImage?: string, canonicalUrl?: string, customDomain?: string, published?: boolean, globalStyles?: GlobalStyles }): void {
    this.pageTitle.set(settings.title || '');
    this.pageSlug.set(settings.slug || '');
    this.metaTitle.set(settings.metaTitle || '');
    this.metaDescription.set(settings.metaDescription || '');
    this.ogImage.set(settings.ogImage || '');
    this.canonicalUrl.set(settings.canonicalUrl || '');
    this.customDomain.set(settings.customDomain || '');
    this.published.set(settings.published || false);
    if (settings.globalStyles) {
      this.updateGlobalStyles(settings.globalStyles);
    }
  }

  updatePageMetadata(key: 'pageTitle' | 'pageSlug' | 'metaTitle' | 'metaDescription' | 'ogImage' | 'canonicalUrl' | 'customDomain', value: string): void {
    switch (key) {
      case 'pageTitle': this.pageTitle.set(value); break;
      case 'pageSlug': this.pageSlug.set(value); break;
      case 'metaTitle': this.metaTitle.set(value); break;
      case 'metaDescription': this.metaDescription.set(value); break;
      case 'ogImage': this.ogImage.set(value); break;
      case 'canonicalUrl': this.canonicalUrl.set(value); break;
      case 'customDomain': this.customDomain.set(value); break;
    }
  }

  updatePublished(published: boolean): void {
    this.published.set(published);
  }
}
