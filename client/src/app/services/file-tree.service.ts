import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, catchError } from 'rxjs';
import { getApiBaseUrl } from '../config/api.config';
import { Page } from './page-api.service';
import {
  ROOT_FOLDER_ID,
  TreeNode,
  createFileNode,
  createFolderNode
} from '../models/file-tree.models';
import { BuilderStore } from '../store/builder.store';
import { CanvasBlock } from '../store/builder.models';

@Injectable({ providedIn: 'root' })
export class FileTreeService {
  private readonly STORAGE_KEY = 'builder_file_tree';
  private readonly apiUrl = `${getApiBaseUrl()}/user/tree`;
  private readonly http = inject(HttpClient);
  private builderStore = inject(BuilderStore);
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  nodes = signal<TreeNode[]>([]);
  selectedId = signal<string | null>(null);
  focusedId = signal<string | null>(null);
  expandedIds = signal<Set<string>>(new Set([ROOT_FOLDER_ID]));
  renamingId = signal<string | null>(null);
  searchQuery = signal('');
  cutNodeId = signal<string | null>(null);
  copiedNodeId = signal<string | null>(null);

  flatNodes = computed(() => this.flattenTree(this.nodes(), this.expandedIds(), this.searchQuery()));

  searchResults = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return [];
    return this.getAllNodes(this.nodes()).filter(node => node.name.toLowerCase().includes(q));
  });

  loadFromStorage(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        this.setTree(this.hydrateNodes(JSON.parse(saved)));
      } catch {
        this.setDefaultTree();
      }
    } else {
      this.setDefaultTree();
    }

    this.http.get<{ success: boolean; tree: TreeNode[] | null }>(this.apiUrl).pipe(
      catchError(() => EMPTY)
    ).subscribe(res => {
      if (res.tree?.length) {
        this.setTree(this.hydrateNodes(res.tree));
        this.saveLocalOnly();
      }
    });
  }

  saveToStorage(): void {
    this.saveLocalOnly();
    this.scheduleBackendSave();
  }

  getNode(id: string, nodes: TreeNode[] = this.nodes()): TreeNode | null {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children?.length) {
        const found = this.getNode(id, node.children);
        if (found) return found;
      }
    }
    return null;
  }

  getParent(id: string): TreeNode | null {
    const node = this.getNode(id);
    if (!node?.parentId) return null;
    return this.getNode(node.parentId);
  }

  getAllNodes(nodes: TreeNode[]): TreeNode[] {
    const all: TreeNode[] = [];
    const visit = (items: TreeNode[]) => {
      items.forEach(node => {
        all.push(node);
        if (node.children?.length) visit(node.children);
      });
    };
    visit(nodes);
    return all;
  }

  addFile(name: string, pageId: string, parentId: string = ROOT_FOLDER_ID): TreeNode {
    const nodes = this.cloneNodes();
    const parent = this.getNodeFrom(parentId, nodes) || this.ensureRoot(nodes);
    parent.children = parent.children || [];
    const node = createFileNode(name, pageId, parent.id, parent.children.length, parent.level + 1);
    parent.children.push(node);
    parent.expanded = true;
    this.updateExpandedFromNodes(nodes);
    this.normalizeTree(nodes);
    this.nodes.set(nodes);
    this.selectNode(node.id);
    this.saveToStorage();
    return node;
  }

  addFolder(name: string, parentId: string = ROOT_FOLDER_ID): TreeNode {
    const nodes = this.cloneNodes();
    const parent = this.getNodeFrom(parentId, nodes) || this.ensureRoot(nodes);
    parent.children = parent.children || [];
    const folder = createFolderNode(name, parent.id, parent.children.length, parent.level + 1);
    parent.children.push(folder);
    parent.expanded = true;
    this.updateExpandedFromNodes(nodes);
    this.normalizeTree(nodes);
    this.nodes.set(nodes);
    this.selectNode(folder.id);
    this.saveToStorage();
    return folder;
  }

  renameNode(id: string, newName: string): void {
    const cleanName = newName.trim();
    if (!cleanName) {
      this.cancelRename();
      return;
    }

    const nodes = this.cloneNodes();
    const node = this.getNodeFrom(id, nodes);
    if (node) {
      node.name = cleanName;
      node.lastModified = new Date();
      this.nodes.set(nodes);
      this.saveToStorage();
    }
    this.renamingId.set(null);
  }

  deleteNode(id: string): void {
    if (id === ROOT_FOLDER_ID) return;
    const nodes = this.cloneNodes();
    const removed = this.removeNodeFrom(id, nodes);
    if (!removed) return;
    if (this.selectedId() === id) this.selectedId.set(null);
    if (this.focusedId() === id) this.focusedId.set(null);
    this.expandedIds.update(set => {
      const next = new Set(set);
      next.delete(id);
      return next;
    });
    this.normalizeTree(nodes);
    this.nodes.set(nodes);
    this.saveToStorage();
  }

  deleteNodeByPageId(pageId: string): void {
    const node = this.getAllNodes(this.nodes()).find(item => item.pageId === pageId);
    if (node) this.deleteNode(node.id);
  }

  renameNodeByPageId(pageId: string, name: string): void {
    const node = this.getAllNodes(this.nodes()).find(item => item.pageId === pageId);
    if (node) this.renameNode(node.id, name);
  }

  updatePageStatus(pageId: string, updates: Partial<Pick<TreeNode, 'pageSlug' | 'published' | 'lastModified' | 'name'>>): void {
    const nodes = this.cloneNodes();
    const node = this.getAllNodes(nodes).find(item => item.pageId === pageId);
    if (!node) return;
    Object.assign(node, updates, { lastModified: updates.lastModified || new Date() });
    this.nodes.set(nodes);
    this.saveToStorage();
  }

  moveNode(nodeId: string, newParentId: string, newOrder: number): void {
    if (nodeId === ROOT_FOLDER_ID || nodeId === newParentId || this.isDescendant(newParentId, nodeId)) return;
    const nodes = this.cloneNodes();
    const moving = this.removeNodeFrom(nodeId, nodes);
    if (!moving) return;

    const parent = this.getNodeFrom(newParentId, nodes) || this.ensureRoot(nodes);
    if (parent.type !== 'folder') return;
    parent.children = parent.children || [];
    const insertAt = Math.max(0, Math.min(newOrder, parent.children.length));
    parent.children.splice(insertAt, 0, moving);
    parent.expanded = true;
    this.updateNodeLevels(moving, parent.level + 1, parent.id);
    this.normalizeTree(nodes);
    this.updateExpandedFromNodes(nodes);
    this.nodes.set(nodes);
    this.saveToStorage();
  }

  toggleExpand(id: string): void {
    const nodes = this.cloneNodes();
    const node = this.getNodeFrom(id, nodes);
    if (!node || node.type !== 'folder') return;
    node.expanded = !this.expandedIds().has(id);
    this.nodes.set(nodes);
    this.expandedIds.update(set => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    this.saveToStorage();
  }

  expandAll(): void {
    const ids = this.getAllNodes(this.nodes())
      .filter(node => node.type === 'folder')
      .map(node => node.id);
    this.expandedIds.set(new Set(ids));
    this.patchExpandedFlags(new Set(ids));
  }

  collapseAll(): void {
    this.expandedIds.set(new Set([ROOT_FOLDER_ID]));
    this.patchExpandedFlags(new Set([ROOT_FOLDER_ID]));
  }

  selectNode(id: string): void {
    this.selectedId.set(id);
    this.focusedId.set(id);
  }

  selectNodeByPageId(pageId: string): void {
    const node = this.getAllNodes(this.nodes()).find(item => item.pageId === pageId);
    if (!node) return;
    this.expandAncestors(node.id);
    this.selectNode(node.id);
  }

  startRename(id: string): void {
    this.renamingId.set(id);
    this.selectNode(id);
  }

  cancelRename(): void {
    this.renamingId.set(null);
  }

  flattenTree(nodes: TreeNode[], expandedIds: Set<string>, search: string): TreeNode[] {
    const q = search.trim().toLowerCase();
    const flat: TreeNode[] = [];

    const visit = (items: TreeNode[]) => {
      items
        .slice()
        .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
        .forEach(node => {
          const matches = !q || node.name.toLowerCase().includes(q);
          if (matches) flat.push(node);
          if (node.type === 'folder' && node.children?.length && (expandedIds.has(node.id) || q)) {
            visit(node.children);
          }
          
          // If page is expanded and is the active page, show its blocks
          if (node.type === 'file' && expandedIds.has(node.id) && node.pageId && node.pageId === this.builderStore.activePageId()) {
            const blocks = this.getPageBlocks(node.pageId);
            blocks.forEach(b => flat.push(b));
          }
        });
    };

    visit(nodes);
    return flat;
  }

  currentPageId(): string | null {
    return this.builderStore.activePageId();
  }

  getBlockName(block: CanvasBlock): string {
    return this.getBlockDisplayName(block);
  }

  getPageBlocks(pageId: string): TreeNode[] {
    if (pageId !== this.builderStore.activePageId()) return [];
    const blocks = this.builderStore.blocks();
    
    return blocks.map((block, index) => ({
      id: 'block-' + block.id,
      name: this.getBlockName(block),
      type: 'block' as any,
      blockId: block.id,
      blockType: block.type,
      level: 2, // deeper than page level
      order: index,
      parentId: pageId,
      icon: this.getBlockIcon(block.type)
    }));
  }

  getBlockDisplayName(block: CanvasBlock): string {
    switch(block.type) {
      case 'heading': 
        return '# ' + (block.props?.content?.substring(0,20) || 'Heading')
      case 'text':
        return '¶ ' + (block.props?.content?.substring(0,20) || 'Text')
      case 'button':
        return '⬜ ' + (block.props?.label || 'Button')
      case 'image':
        return '🖼 Image'
      case 'section':
        return '▭ Section'
      case 'divider':
        return '— Divider'
      case 'video':
        return '▶ Video'
      default:
        return block.type
    }
  }

  getBlockIcon(type: string): string {
    const icons: Record<string,string> = {
      heading: 'Heading',
      text: 'AlignLeft',
      button: 'MousePointerClick',
      image: 'Image',
      section: 'Layout',
      divider: 'Minus',
      video: 'Play',
      form: 'FormInput',
      card: 'CreditCard',
      columns: 'Columns',
    }
    return icons[type] || 'Box'
  }

  duplicateNode(id: string): void {
    const node = this.getNode(id);
    const parent = node?.parentId ? this.getNode(node.parentId) : null;
    if (!node || !parent?.id || id === ROOT_FOLDER_ID) return;

    const clone = this.cloneWithNewIds(node, `${node.name} Copy`);
    this.moveClonedNode(clone, parent.id, node.order + 1);
  }

  copyNode(id: string): void {
    if (id !== ROOT_FOLDER_ID) {
      this.copiedNodeId.set(id);
      this.cutNodeId.set(null);
    }
  }

  cutNode(id: string): void {
    if (id !== ROOT_FOLDER_ID) {
      this.cutNodeId.set(id);
      this.copiedNodeId.set(null);
    }
  }

  pasteNode(targetParentId?: string): void {
    const focused = targetParentId ? this.getNode(targetParentId) : this.getNode(this.selectedId() || ROOT_FOLDER_ID);
    const parentId = focused?.type === 'folder' ? focused.id : focused?.parentId || ROOT_FOLDER_ID;
    const cutId = this.cutNodeId();
    const copyId = this.copiedNodeId();

    if (cutId) {
      const parent = this.getNode(parentId);
      this.moveNode(cutId, parentId, parent?.children?.length || 0);
      this.cutNodeId.set(null);
      return;
    }

    if (copyId) {
      const node = this.getNode(copyId);
      if (!node) return;
      const clone = this.cloneWithNewIds(node, `${node.name} Copy`);
      this.moveClonedNode(clone, parentId, this.getNode(parentId)?.children?.length || 0);
    }
  }

  navigateUp(): void {
    const flat = this.flatNodes();
    const current = this.focusedId();
    const index = Math.max(0, flat.findIndex(node => node.id === current));
    const next = flat[Math.max(0, index - 1)];
    if (next) this.focusedId.set(next.id);
  }

  navigateDown(): void {
    const flat = this.flatNodes();
    const current = this.focusedId();
    const index = flat.findIndex(node => node.id === current);
    const next = flat[Math.min(flat.length - 1, index + 1)];
    if (next) this.focusedId.set(next.id);
  }

  navigateLeft(): void {
    const focused = this.getNode(this.focusedId() || '');
    if (!focused) return;
    if (focused.type === 'folder' && this.expandedIds().has(focused.id)) {
      this.toggleExpand(focused.id);
      return;
    }
    if (focused.parentId) this.focusedId.set(focused.parentId);
  }

  navigateRight(): void {
    const focused = this.getNode(this.focusedId() || '');
    if (!focused || focused.type !== 'folder') return;
    if (!this.expandedIds().has(focused.id)) {
      this.toggleExpand(focused.id);
      return;
    }
    const firstChild = focused.children?.slice().sort((a, b) => a.order - b.order)[0];
    if (firstChild) this.focusedId.set(firstChild.id);
  }

  syncWithPages(pages: Page[]): void {
    const nodes = this.cloneNodes();
    const root = this.ensureRoot(nodes);
    root.children = root.children || [];
    const pageIds = new Set(pages.map(page => page._id));

    this.removeMissingPageNodes(nodes, pageIds);

    pages.forEach(page => {
      let node = this.getAllNodes(nodes).find(item => item.pageId === page._id);
      if (!node) {
        node = createFileNode(page.title || 'Untitled Page', page._id, ROOT_FOLDER_ID, root.children!.length, root.level + 1);
        root.children!.push(node);
      }
      node.name = page.title || 'Untitled Page';
      node.pageSlug = page.slug;
      node.published = page.published;
      node.lastModified = page.updatedAt ? new Date(page.updatedAt) : new Date();
    });

    this.normalizeTree(nodes);
    this.nodes.set(nodes);
    this.saveToStorage();
  }

  getSelectedPageId(): string | null {
    const selected = this.selectedId();
    const node = selected ? this.getNode(selected) : null;
    return node?.pageId || null;
  }

  private setTree(nodes: TreeNode[]): void {
    const tree = nodes.length ? nodes : [this.createRoot()];
    this.normalizeTree(tree);
    this.nodes.set(tree);
    this.updateExpandedFromNodes(tree);
  }

  private setDefaultTree(): void {
    this.setTree([this.createRoot()]);
  }

  private createRoot(): TreeNode {
    return {
      id: ROOT_FOLDER_ID,
      name: 'My Website',
      type: 'folder',
      level: 0,
      order: 0,
      expanded: true,
      children: []
    };
  }

  private ensureRoot(nodes: TreeNode[]): TreeNode {
    let root = nodes.find(node => node.id === ROOT_FOLDER_ID);
    if (!root) {
      root = this.createRoot();
      nodes.unshift(root);
    }
    root.type = 'folder';
    root.children = root.children || [];
    root.level = 0;
    root.parentId = undefined;
    return root;
  }

  private cloneNodes(): TreeNode[] {
    return this.hydrateNodes(JSON.parse(JSON.stringify(this.nodes())));
  }

  private hydrateNodes(nodes: TreeNode[]): TreeNode[] {
    const hydrate = (items: TreeNode[]): TreeNode[] => items.map(node => ({
      ...node,
      lastModified: node.lastModified ? new Date(node.lastModified) : undefined,
      children: node.children ? hydrate(node.children) : undefined
    }));
    return hydrate(nodes || []);
  }

  private getNodeFrom(id: string, nodes: TreeNode[]): TreeNode | null {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children?.length) {
        const found = this.getNodeFrom(id, node.children);
        if (found) return found;
      }
    }
    return null;
  }

  private removeNodeFrom(id: string, nodes: TreeNode[]): TreeNode | null {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === id) return nodes.splice(i, 1)[0];
      if (nodes[i].children?.length) {
        const found = this.removeNodeFrom(id, nodes[i].children!);
        if (found) return found;
      }
    }
    return null;
  }

  private updateNodeLevels(node: TreeNode, level: number, parentId?: string): void {
    node.level = level;
    node.parentId = parentId;
    node.children?.forEach((child, index) => {
      child.order = index;
      this.updateNodeLevels(child, level + 1, node.id);
    });
  }

  private normalizeTree(nodes: TreeNode[]): void {
    const root = this.ensureRoot(nodes);
    const visit = (items: TreeNode[], parentId: string | undefined, level: number) => {
      items.forEach((node, index) => {
        node.parentId = parentId;
        node.level = level;
        node.order = index;
        if (node.type === 'folder') {
          node.children = node.children || [];
          node.children.sort((a, b) => a.order - b.order);
          visit(node.children, node.id, level + 1);
        } else {
          node.children = undefined;
        }
      });
    };
    root.order = 0;
    visit(nodes, undefined, 0);
  }

  private updateExpandedFromNodes(nodes: TreeNode[]): void {
    const expanded = new Set<string>();
    this.getAllNodes(nodes).forEach(node => {
      if (node.type === 'folder' && (node.expanded || node.id === ROOT_FOLDER_ID)) {
        expanded.add(node.id);
      }
    });
    this.expandedIds.set(expanded);
  }

  private patchExpandedFlags(expanded: Set<string>): void {
    const nodes = this.cloneNodes();
    this.getAllNodes(nodes).forEach(node => {
      if (node.type === 'folder') node.expanded = expanded.has(node.id);
    });
    this.nodes.set(nodes);
    this.saveToStorage();
  }

  private expandAncestors(id: string): void {
    const expanded = new Set(this.expandedIds());
    let node = this.getNode(id);
    while (node?.parentId) {
      expanded.add(node.parentId);
      node = this.getNode(node.parentId);
    }
    this.expandedIds.set(expanded);
    this.patchExpandedFlags(expanded);
  }

  private cloneWithNewIds(node: TreeNode, name = node.name): TreeNode {
    const clone = JSON.parse(JSON.stringify(node)) as TreeNode;
    const refresh = (item: TreeNode, parentId?: string, level = item.level) => {
      item.id = `${item.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      item.parentId = parentId;
      item.level = level;
      item.name = item === clone ? name : item.name;
      item.pageId = item.type === 'file' ? `local-copy-${item.id}` : item.pageId;
      item.children?.forEach((child, index) => {
        child.order = index;
        refresh(child, item.id, level + 1);
      });
    };
    refresh(clone, clone.parentId, clone.level);
    return clone;
  }

  private moveClonedNode(node: TreeNode, parentId: string, order: number): void {
    const nodes = this.cloneNodes();
    const parent = this.getNodeFrom(parentId, nodes) || this.ensureRoot(nodes);
    parent.children = parent.children || [];
    parent.children.splice(Math.max(0, Math.min(order, parent.children.length)), 0, node);
    this.updateNodeLevels(node, parent.level + 1, parent.id);
    this.normalizeTree(nodes);
    this.nodes.set(nodes);
    this.selectNode(node.id);
    this.saveToStorage();
  }

  private isDescendant(maybeChildId: string, parentId: string): boolean {
    const parent = this.getNode(parentId);
    if (!parent?.children?.length) return false;
    return this.getAllNodes(parent.children).some(node => node.id === maybeChildId);
  }

  private removeMissingPageNodes(nodes: TreeNode[], validPageIds: Set<string>): void {
    const visit = (items: TreeNode[]) => {
      for (let i = items.length - 1; i >= 0; i--) {
        const node = items[i];
        if (node.type === 'file' && node.pageId && !node.pageId.startsWith('local-copy-') && node.pageId !== 'temp-id' && !validPageIds.has(node.pageId)) {
          items.splice(i, 1);
        } else if (node.children?.length) {
          visit(node.children);
        }
      }
    };
    visit(nodes);
  }

  private saveLocalOnly(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.nodes()));
  }

  private scheduleBackendSave(): void {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.http.put<{ success: boolean }>(this.apiUrl, { tree: this.nodes() }).pipe(
        catchError(() => EMPTY)
      ).subscribe();
    }, 2000);
  }
}
