import { Injectable, computed, inject, signal } from '@angular/core';
import { BlockProps, BlockType, BuilderPageTab, CanvasBlock, GlobalStyles, SavedComponent } from './builder.models';
import { SocketService } from '../services/socket.service';
import { AutoSaveService, SEOSettings, PageSettings } from '../services/auto-save.service';
import { getDefaultProps } from '../utils/block-defaults';
@Injectable({
  providedIn: 'root'
})
export class BuilderStore {
  // State
  private socketService = inject(SocketService);
  private autoSave = inject(AutoSaveService);
  private activePropsCache = new WeakMap<CanvasBlock, { props: BlockProps; mobileProps: BlockProps | null | undefined; value: BlockProps }>();
  
  blocks = signal<CanvasBlock[]>([]);
  pages = signal<BuilderPageTab[]>([]);
  activePageId = signal<string | null>(null);
  selectedBlockId = signal<string | null>(null);
  hoveredBlockId = signal<string | null>(null);
  previewMode = signal<'desktop' | 'tablet' | 'mobile'>('desktop');
  history = signal<CanvasBlock[][]>([]);
  historyIndex = signal<number>(-1);

  // NEW: Mobile-specific editing state signals
  editMode = signal<'desktop' | 'mobile'>('desktop');
  syncMobileWithDesktop = signal<boolean>(true);

  // NEW computeds
  isEditingMobile = computed(() => this.editMode() === 'mobile');
  isMobileMode = computed(() => this.previewMode() === 'mobile');

  globalStyles = signal<GlobalStyles>({
    fontFamily: 'Inter, sans-serif',
    primaryColor: '#3b82f6',
    secondaryColor: '#111827',
    accentColor: '#10b981',
    baseFontSize: '16px'
  });

  // Page Metadata State
  pageTitle = signal<string>('Untitled Page');
  pageSlug = signal<string>('');
  metaTitle = signal<string>('');
  metaDescription = signal<string>('');
  ogImage = signal<string>('');
  canonicalUrl = signal<string>('');
  customDomain = signal<string>('');
  published = signal<boolean>(false);
  
  favicon = signal<string>('');
  customCss = signal<string>('');
  customJs = signal<string>('');

  seoSettings = signal<SEOSettings>({
    metaTitle: '',
    metaDescription: '',
    ogImage: '',
    canonicalUrl: '',
    keywords: ''
  });

  // Memoized block map for O(1) lookups
  private _blockMap = computed(() => {
    const map = new Map<string, CanvasBlock>();
    const fillMap = (list: CanvasBlock[]) => {
      list.forEach(b => {
        map.set(b.id, b);
        if (b.children) fillMap(b.children);
      });
    };
    fillMap(this.blocks());
    return map;
  });

  // O(1) block lookup
  getBlock(id: string): CanvasBlock | undefined {
    return this._blockMap().get(id);
  }

  getBlockById(id: string): CanvasBlock | undefined {
    return this.getBlock(id);
  }

  // Recursive updater helper to handle nested sections correctly
  private updateBlockInArray(blocks: CanvasBlock[], id: string, updater: (b: CanvasBlock) => CanvasBlock): CanvasBlock[] {
    let changed = false;
    const nextBlocks = blocks.map(b => {
      if (b.id === id) {
        changed = true;
        return updater(b);
      }
      if (b.children && b.children.length > 0) {
        const nextChildren = this.updateBlockInArray(b.children, id, updater);
        if (nextChildren === b.children) {
          return b;
        }
        changed = true;
        return {
          ...b,
          children: nextChildren
        };
      }
      return b;
    });
    return changed ? nextBlocks : blocks;
  }

  // Computed
  selectedBlock = computed(() => {
    const id = this.selectedBlockId();
    if (!id) return null;
    return this.getBlockById(id) || null;
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

  private createBlock(type: BlockType): CanvasBlock {
    return {
      id: this.generateId(),
      type,
      props: getDefaultProps(type)
    };
  }

  private queueAutoSave(reason: string): void {
    queueMicrotask(() => this.autoSave.triggerSave(reason));
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
    
    newHistory.push(newBlocks);
    
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
      pages.map(page => page.id === activeId && page.blocks !== blocks ? { ...page, blocks } : page)
    );
  }

  addBlock(type: BlockType): void {
    const newBlock = this.createBlock(type);
    
    const newBlocks = [...this.blocks(), newBlock];
    this.saveHistory(newBlocks);
    this.selectBlock(newBlock.id);
    
    if (this.activePageId()) {
      this.socketService.emitBlockAdded(this.activePageId()!, newBlock);
    }
    
    this.queueAutoSave('block-added');
  }

  addBlockAtIndex(type: BlockType, index: number): void {
    const newBlock = this.createBlock(type);
    
    const newBlocks = [...this.blocks()];
    newBlocks.splice(index, 0, newBlock);
    
    this.saveHistory(newBlocks);
    this.selectBlock(newBlock.id);
    this.queueAutoSave('block-added');
  }

  addBlockAt(type: BlockType, index: number): void {
    const newBlock = this.createBlock(type);
    const newBlocks = [...this.blocks()];
    newBlocks.splice(index, 0, newBlock);
    
    this.saveHistory(newBlocks);
    this.selectBlock(newBlock.id);
    this.queueAutoSave('block-added');
  }

  addSavedComponentAtIndex(component: SavedComponent, index: number): void {
    const newBlock = this.cloneBlockWithNewIds(component.block);
    const newBlocks = [...this.blocks()];
    newBlocks.splice(index, 0, newBlock);
    this.saveHistory(newBlocks);
    this.selectBlock(newBlock.id);
    this.queueAutoSave('component-added');
  }

  selectBlock(id: string): void {
    if (this.selectedBlockId() === id) return;
    this.selectedBlockId.set(id);
  }

  clearSelection(): void {
    if (this.selectedBlockId() === null) return;
    this.selectedBlockId.set(null);
  }

  getActiveProps(block: CanvasBlock): BlockProps {
    if (this.editMode() === 'mobile' && block.mobileProps) {
      const cached = this.activePropsCache.get(block);
      if (cached && cached.props === block.props && cached.mobileProps === block.mobileProps) {
        return cached.value;
      }

      const value = { ...block.props, ...block.mobileProps };
      this.activePropsCache.set(block, {
        props: block.props,
        mobileProps: block.mobileProps,
        value
      });
      return value;
    }
    return block.props;
  }

  setEditMode(mode: 'desktop' | 'mobile'): void {
    this.editMode.set(mode);
    this.previewMode.set(mode === 'mobile' ? 'mobile' : 'desktop');
  }

  toggleSyncMode(): void {
    this.syncMobileWithDesktop.update(v => !v);
  }

  updateBlock(id: string, props: Partial<BlockProps>): void {
    const current = this.getBlockById(id);
    if (!current) return;

    // Check if actually changed (shallow compare)
    const activeProps = this.getActiveProps(current);
    const hasChanged = Object.keys(props).some(
      key => activeProps[key as keyof BlockProps] !== props[key as keyof BlockProps]
    );
    if (!hasChanged) return;  // Skip if no change!

    if (this.editMode() === 'desktop') {
      const newBlocks = this.updateBlockInArray(this.blocks(), id, b => ({
        ...b,
        props: { ...b.props, ...props },
        mobileProps: this.syncMobileWithDesktop() ? null : b.mobileProps
      }));

      this.saveHistory(newBlocks);
      const updatedBlock = this.getBlockById(id);
      if (updatedBlock && this.activePageId()) {
        this.socketService.emitBlockUpdated(this.activePageId()!, updatedBlock);
      }
      this.queueAutoSave('block-updated');
    } else {
      this.updateBlockMobile(id, props);
    }
  }

  updateBlockMobile(id: string, mobileProps: Partial<BlockProps>): void {
    const current = this.getBlockById(id);
    if (!current) return;

    const activeMobileProps = current.mobileProps || {};
    const updateKeys = Object.keys(mobileProps);
    const hasChanged = updateKeys.length === 0
      ? !current.mobileProps
      : updateKeys.some(
      key => activeMobileProps[key as keyof BlockProps] !== mobileProps[key as keyof BlockProps]
    );
    if (!hasChanged) return;

    const newBlocks = this.updateBlockInArray(this.blocks(), id, b => ({
      ...b,
      mobileProps: {
        ...(b.mobileProps || {}),
        ...mobileProps
      }
    }));

    this.saveHistory(newBlocks);
    const updatedBlock = this.getBlockById(id);
    if (updatedBlock && this.activePageId()) {
      this.socketService.emitBlockUpdated(this.activePageId()!, updatedBlock);
    }
    this.queueAutoSave('block-mobile-updated');
  }

  updateBlockSharedProps(id: string, props: Partial<BlockProps>): void {
    const current = this.getBlockById(id);
    if (!current) return;

    const hasChanged = Object.keys(props).some(
      key => current.props[key as keyof BlockProps] !== props[key as keyof BlockProps]
    );
    if (!hasChanged) return;

    const newBlocks = this.updateBlockInArray(this.blocks(), id, b => ({
      ...b,
      props: { ...b.props, ...props }
    }));

    this.saveHistory(newBlocks);
    const updatedBlock = this.getBlockById(id);
    if (updatedBlock && this.activePageId()) {
      this.socketService.emitBlockUpdated(this.activePageId()!, updatedBlock);
    }
    this.queueAutoSave('block-shared-updated');
  }

  resetMobileProps(id: string): void {
    const currentBlocks = this.blocks();
    const blockIndex = currentBlocks.findIndex(b => b.id === id);
    if (blockIndex === -1) return;

    const newBlocks = [...currentBlocks];
    newBlocks[blockIndex] = {
      ...newBlocks[blockIndex],
      mobileProps: null
    };

    this.saveHistory(newBlocks);
    if (this.activePageId()) {
      this.socketService.emitBlockUpdated(this.activePageId()!, newBlocks[blockIndex]);
    }
    this.queueAutoSave('block-mobile-reset');
  }

  toggleBlockVisibility(id: string, device: 'desktop' | 'mobile' | 'tablet', visible: boolean): void {
    const currentBlocks = this.blocks();
    const blockIndex = currentBlocks.findIndex(b => b.id === id);
    if (blockIndex === -1) return;

    const newBlocks = [...currentBlocks];
    const currentBlock = newBlocks[blockIndex];
    const visibility = currentBlock.visibility || { desktop: true, mobile: true, tablet: true };
    newBlocks[blockIndex] = {
      ...currentBlock,
      visibility: {
        ...visibility,
        [device]: visible
      }
    };

    this.saveHistory(newBlocks);
    if (this.activePageId()) {
      this.socketService.emitBlockUpdated(this.activePageId()!, newBlocks[blockIndex]);
    }
    this.queueAutoSave('block-visibility-changed');
  }

  updateBlockMobileOrder(id: string, order: number | null): void {
    const currentBlocks = this.blocks();
    const blockIndex = currentBlocks.findIndex(b => b.id === id);
    if (blockIndex === -1) return;

    const newBlocks = [...currentBlocks];
    newBlocks[blockIndex] = {
      ...newBlocks[blockIndex],
      mobileOrder: order
    };

    this.saveHistory(newBlocks);
    if (this.activePageId()) {
      this.socketService.emitBlockUpdated(this.activePageId()!, newBlocks[blockIndex]);
    }
    this.queueAutoSave('block-order-updated');
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
    this.queueAutoSave('block-metadata-updated');
  }

  deleteBlock(id: string): void {
    const newBlocks = this.blocks().filter(b => b.id !== id);
    this.saveHistory(newBlocks);
    if (this.selectedBlockId() === id) {
      this.clearSelection();
    }
    
    if (this.activePageId()) {
      this.socketService.emitBlockDeleted(this.activePageId()!, id);
    }
    this.queueAutoSave('block-deleted');
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
    this.queueAutoSave('block-duplicated');
  }

  reorderBlocks(previousIndex: number, currentIndex: number): void {
    if (previousIndex === currentIndex) return;

    const newBlocks = [...this.blocks()];
    const [item] = newBlocks.splice(previousIndex, 1);
    if (!item) return;

    newBlocks.splice(currentIndex, 0, item);
    this.saveHistory(newBlocks);
    this.queueAutoSave('blocks-reordered');
  }

  undo(): void {
    if (!this.canUndo()) return;
    
    const newIndex = this.historyIndex() - 1;
    this.historyIndex.set(newIndex);
    const blocks = this.history()[newIndex];
    this.blocks.set(blocks);
    this.syncActivePageBlocks(blocks);
    this.queueAutoSave('undo');
  }

  redo(): void {
    if (!this.canRedo()) return;
    
    const newIndex = this.historyIndex() + 1;
    this.historyIndex.set(newIndex);
    const blocks = this.history()[newIndex];
    this.blocks.set(blocks);
    this.syncActivePageBlocks(blocks);
    this.queueAutoSave('redo');
  }

  setPreviewMode(mode: 'desktop' | 'tablet' | 'mobile'): void {
    this.previewMode.set(mode);
  }

  clearCanvas(): void {
    this.saveHistory([]);
    this.clearSelection();
  }

  addTemplateBlocks(templateBlocks: CanvasBlock[], index?: number): string[] {
    const clonedBlocks = templateBlocks.map((block, idx) => {
      const cloned = JSON.parse(JSON.stringify(block)) as CanvasBlock;
      const refresh = (item: CanvasBlock, itemIdx: number) => {
        item.id = 'block-' + Date.now() + '-' + itemIdx + '-' + Math.random().toString(36).substr(2, 4);
        item.children?.forEach((child, cIdx) => refresh(child, itemIdx + cIdx + 1));
      };
      refresh(cloned, idx);
      return cloned;
    });

    return this.addMultipleBlocks(clonedBlocks, index, 'template-blocks-added');
  }

  addMultipleBlocks(blocks: CanvasBlock[], index?: number, reason = 'template-added'): string[] {
    if (blocks.length === 0) return [];

    const newBlocks = [...this.blocks()];
    if (typeof index === 'number' && index >= 0) {
      newBlocks.splice(index, 0, ...blocks);
    } else {
      newBlocks.push(...blocks);
    }

    this.saveHistory(newBlocks);
    if (blocks.length > 0) {
      this.selectBlock(blocks[0].id);
    }
    
    if (this.activePageId()) {
      blocks.forEach(b => {
        this.socketService.emitBlockAdded(this.activePageId()!, b);
      });
    }
    
    this.queueAutoSave(reason);
    return blocks.map(b => b.id);
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
    this.queueAutoSave('global-styles-updated');
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
    this.queueAutoSave('metadata-updated');
  }

  updatePublished(published: boolean): void {
    this.published.set(published);
    this.queueAutoSave('published-status');
  }

  handleRemoteBlockChange(updatedBlock: CanvasBlock): void {
    const currentBlocks = this.blocks();
    const blockIndex = currentBlocks.findIndex(b => b.id === updatedBlock.id);
    if (blockIndex === -1) return;

    const newBlocks = [...currentBlocks];
    newBlocks[blockIndex] = updatedBlock;
    
    // Save to history but don't emit
    this.history.update(h => {
      const newH = [...h];
      newH[this.historyIndex()] = newBlocks;
      return newH;
    });
    this.blocks.set(newBlocks);
    this.syncActivePageBlocks(newBlocks);
  }

  handleRemoteBlockAdded(block: CanvasBlock): void {
    const currentBlocks = this.blocks();
    const newBlocks = [...currentBlocks, block];
    
    this.history.update(h => {
      const newH = [...h];
      newH[this.historyIndex()] = newBlocks;
      return newH;
    });
    this.blocks.set(newBlocks);
    this.syncActivePageBlocks(newBlocks);
  }

  handleRemoteBlockDeleted(blockId: string): void {
    const newBlocks = this.blocks().filter(b => b.id !== blockId);
    
    this.history.update(h => {
      const newH = [...h];
      newH[this.historyIndex()] = newBlocks;
      return newH;
    });
    this.blocks.set(newBlocks);
    this.syncActivePageBlocks(newBlocks);
    
    if (this.selectedBlockId() === blockId) {
      this.clearSelection();
    }
  }

  // Auto-Save Additional Methods
  setPageTitle(title: string): void {
    this.pageTitle.set(title);
    this.queueAutoSave('title-changed');
  }

  updateSEO(seo: Partial<SEOSettings>): void {
    this.seoSettings.update(s => ({ ...s, ...seo }));
    this.queueAutoSave('seo-updated');
  }

  setFavicon(url: string): void {
    this.favicon.set(url);
    this.queueAutoSave('favicon-changed');
  }

  setCustomCss(css: string): void {
    this.customCss.set(css);
    this.queueAutoSave('custom-css-changed');
  }

  setCustomJs(js: string): void {
    this.customJs.set(js);
    this.queueAutoSave('custom-js-changed');
  }

  setPageTitleSilent(title: string): void {
    this.pageTitle.set(title || 'Untitled Page');
  }

  setSEOSilent(seo: Partial<SEOSettings> | undefined): void {
    if (seo) {
      this.seoSettings.update(s => ({ ...s, ...seo }));
    }
  }

  setSettingsSilent(settings: Partial<PageSettings> | undefined): void {
    if (settings) {
      this.favicon.set(settings.favicon || '');
      this.customCss.set(settings.customCss || '');
      this.customJs.set(settings.customJs || '');
    }
  }
}
