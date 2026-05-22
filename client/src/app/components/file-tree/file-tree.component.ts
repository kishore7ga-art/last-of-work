import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ContextMenuItem, ROOT_FOLDER_ID, TreeNode } from '../../models/file-tree.models';
import { FileTreeService } from '../../services/file-tree.service';
import { PageApiService } from '../../services/page-api.service';
import { ToastService } from '../../services/toast.service';
import { BuilderStore } from '../../store/builder.store';

@Component({
  selector: 'app-file-tree',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LucideAngularModule, DragDropModule],
  templateUrl: './file-tree.component.html',
  styleUrls: ['./file-tree.component.scss']
})
export class FileTreeComponent implements OnInit, OnDestroy {
  treeService = inject(FileTreeService);
  readonly rootId = ROOT_FOLDER_ID;
  private pageApi = inject(PageApiService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private builderStore = inject(BuilderStore);
  private documentClickHandler = () => this.closeContextMenu();

  contextMenu = signal<{
    visible: boolean;
    x: number;
    y: number;
    nodeId: string | null;
  }>({ visible: false, x: 0, y: 0, nodeId: null });

  contextMenuItems = computed(() => {
    const nodeId = this.contextMenu().nodeId;
    if (!nodeId) return [];
    const node = this.treeService.getNode(nodeId);
    if (!node) return [];

    const isFolder = node.type === 'folder';
    const isFile = node.type === 'file';
    const items: ContextMenuItem[] = [];

    if (isFile) {
      items.push(
        { id: 'open', label: 'Open', icon: 'external-link' },
        { id: 'open-new', label: 'Open in New Tab', icon: 'external-link' },
        { id: 'divider1', label: '', icon: '', divider: true }
      );
    }

    if (isFolder) {
      items.push(
        { id: 'new-file', label: 'New Page', icon: 'file-plus', shortcut: 'Ctrl+N' },
        { id: 'new-folder', label: 'New Folder', icon: 'folder-plus' },
        { id: 'divider1', label: '', icon: '', divider: true }
      );
    }

    items.push(
      { id: 'rename', label: 'Rename', icon: 'pencil', shortcut: 'F2', disabled: node.id === ROOT_FOLDER_ID },
      { id: 'duplicate', label: 'Duplicate', icon: 'copy', shortcut: 'Ctrl+D', disabled: node.id === ROOT_FOLDER_ID },
      { id: 'divider2', label: '', icon: '', divider: true }
    );

    if (isFile) {
      items.push(
        { id: 'copy-link', label: 'Copy Link', icon: 'link', disabled: !node.pageSlug },
        { id: 'publish', label: node.published ? 'Unpublish' : 'Publish', icon: 'globe-2', disabled: !node.pageId || node.pageId === 'temp-id' },
        { id: 'divider3', label: '', icon: '', divider: true }
      );
    }

    items.push({ id: 'delete', label: 'Delete', icon: 'trash-2', danger: true, shortcut: 'Del', disabled: node.id === ROOT_FOLDER_ID });
    return items;
  });

  @ViewChild('renameInput') renameInputRef?: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    this.treeService.loadFromStorage();
    this.loadPages();
    document.addEventListener('click', this.documentClickHandler);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.documentClickHandler);
  }

  loadPages(): void {
    this.pageApi.getPages().subscribe({
      next: pages => this.treeService.syncWithPages(pages),
      error: () => this.toast.error('Could not sync file tree pages')
    });
  }

  onNodeClick(node: any, event: MouseEvent): void {
    event.stopPropagation();
    this.treeService.selectNode(node.id);
    
    if (node.type === 'folder') {
      this.treeService.toggleExpand(node.id);
    
    } else if (node.type === 'file') {
      // Toggle show/hide blocks under this page
      this.treeService.toggleExpand(node.id);
      if (node.pageId) {
        this.router.navigate(['/editor', node.pageId]);
      }
    
    } else if (node.type === 'block') {
      // SELECT THE BLOCK ON CANVAS
      this.builderStore.selectBlock(node.blockId);
      
      // Scroll to block on canvas
      const el = document.getElementById('block-' + node.blockId);
      if (el) {
        el.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        // Flash highlight
        el.style.outline = '2px solid #f59e0b';
        setTimeout(() => {
          el.style.outline = '';
        }, 1500);
      }
    }
  }

  onNodeDblClick(node: TreeNode): void {
    if (node.id !== ROOT_FOLDER_ID) {
      this.treeService.startRename(node.id);
      this.focusRenameInput();
    }
  }

  onContextMenu(node: TreeNode, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.treeService.selectNode(node.id);
    this.contextMenu.set({ visible: true, x: event.clientX, y: event.clientY, nodeId: node.id });
  }

  onMoreClick(node: TreeNode, event: MouseEvent): void {
    this.onContextMenu(node, event);
  }

  onMenuItemClick(item: ContextMenuItem): void {
    if (item.disabled || item.divider) return;
    const nodeId = this.contextMenu().nodeId;
    const node = nodeId ? this.treeService.getNode(nodeId) : null;
    if (!node) return;

    switch (item.id) {
      case 'open':
        if (node.pageId) this.router.navigate(['/editor', node.pageId]);
        break;
      case 'open-new':
        if (node.pageId) window.open(`/editor/${node.pageId}`, '_blank', 'noopener');
        break;
      case 'rename':
        this.treeService.startRename(node.id);
        this.focusRenameInput();
        break;
      case 'duplicate':
        this.duplicateNode(node);
        break;
      case 'new-file':
        this.newFileInFolder(node);
        break;
      case 'new-folder':
        this.newFolderInFolder(node);
        break;
      case 'delete':
        this.confirmDelete(node);
        break;
      case 'copy-link':
        this.copyPageLink(node);
        break;
      case 'publish':
        this.togglePublish(node);
        break;
    }

    this.closeContextMenu();
  }

  onRenameBlur(event: FocusEvent, node: TreeNode): void {
    this.commitRename((event.target as HTMLInputElement).value, node);
  }

  onRenameKeydown(event: KeyboardEvent, node: TreeNode): void {
    event.stopPropagation();
    if (event.key === 'Enter') {
      this.commitRename((event.target as HTMLInputElement).value, node);
    }
    if (event.key === 'Escape') {
      this.treeService.cancelRename();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT') return;

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
      event.preventDefault();
      this.newFile();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
      event.preventDefault();
      const selected = this.treeService.selectedId();
      if (selected) this.treeService.copyNode(selected);
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'x') {
      event.preventDefault();
      const selected = this.treeService.selectedId();
      if (selected) this.treeService.cutNode(selected);
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
      event.preventDefault();
      this.treeService.pasteNode();
      return;
    }

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.treeService.navigateUp();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.treeService.navigateDown();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.treeService.navigateLeft();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.treeService.navigateRight();
        break;
      case 'Enter': {
        const node = this.treeService.getNode(this.treeService.focusedId() || '');
        if (node) this.onNodeClick(node, new MouseEvent('click'));
        break;
      }
      case 'F2': {
        const selected = this.treeService.selectedId();
        if (selected && selected !== ROOT_FOLDER_ID) {
          this.treeService.startRename(selected);
          this.focusRenameInput();
        }
        break;
      }
      case 'Delete': {
        const selected = this.treeService.selectedId();
        const node = selected ? this.treeService.getNode(selected) : null;
        if (node) this.confirmDelete(node);
        break;
      }
    }
  }

  onDrop(event: CdkDragDrop<TreeNode[]>): void {
    const draggedNode = event.item.data as TreeNode;
    const flat = this.treeService.flatNodes();
    const targetNode = flat[event.currentIndex];
    if (!draggedNode || !targetNode || draggedNode.id === targetNode.id) return;

    if (targetNode.type === 'folder') {
      this.treeService.moveNode(draggedNode.id, targetNode.id, targetNode.children?.length || 0);
      this.toast.success(`Moved to ${targetNode.name}`);
      return;
    }

    const parentId = targetNode.parentId || ROOT_FOLDER_ID;
    this.treeService.moveNode(draggedNode.id, parentId, targetNode.order);
    this.toast.success('File tree updated');
  }

  newFile(): void {
    const selectedId = this.treeService.selectedId();
    const selected = selectedId ? this.treeService.getNode(selectedId) : null;
    const folderId = selected?.type === 'folder' ? selected.id : selected?.parentId || ROOT_FOLDER_ID;
    this.createPageInFolder(folderId);
  }

  newFolder(): void {
    const selectedId = this.treeService.selectedId();
    const selected = selectedId ? this.treeService.getNode(selectedId) : null;
    const folderId = selected?.type === 'folder' ? selected.id : selected?.parentId || ROOT_FOLDER_ID;
    this.newFolderInFolder(this.treeService.getNode(folderId) || undefined);
  }

  newFileInFolder(node: TreeNode, event?: MouseEvent): void {
    event?.stopPropagation();
    const folderId = node.type === 'folder' ? node.id : node.parentId || ROOT_FOLDER_ID;
    if (node.type === 'folder' && !this.isExpanded(node.id)) this.treeService.toggleExpand(node.id);
    this.createPageInFolder(folderId);
  }

  newFolderInFolder(node?: TreeNode, event?: MouseEvent): void {
    event?.stopPropagation();
    const parentId = node?.type === 'folder' ? node.id : node?.parentId || ROOT_FOLDER_ID;
    if (node?.type === 'folder' && !this.isExpanded(node.id)) this.treeService.toggleExpand(node.id);
    const folder = this.treeService.addFolder('New Folder', parentId);
    this.treeService.startRename(folder.id);
    this.focusRenameInput();
  }

  confirmDelete(node: TreeNode): void {
    if (node.id === ROOT_FOLDER_ID) return;
    const msg = node.type === 'folder' ? 'Delete folder and all pages inside?' : 'Delete this page?';
    if (!confirm(msg)) return;

    if (node.type === 'file' && node.pageId && node.pageId !== 'temp-id' && !node.pageId.startsWith('local-copy-')) {
      this.pageApi.deletePage(node.pageId).subscribe({
        next: () => {
          this.treeService.deleteNode(node.id);
          this.toast.success('Page deleted');
        },
        error: () => this.toast.error('Failed to delete page')
      });
      return;
    }

    this.treeService.deleteNode(node.id);
  }

  copyPageLink(node: TreeNode): void {
    if (!node.pageSlug) return;
    navigator.clipboard.writeText(`${window.location.origin}/site/${node.pageSlug}`).then(() => {
      this.toast.success('Link copied');
    });
  }

  togglePublish(node: TreeNode): void {
    if (!node.pageId || node.pageId === 'temp-id') return;
    this.pageApi.togglePublish(node.pageId).subscribe({
      next: ({ published, page }) => {
        this.treeService.updatePageStatus(page._id, {
          published,
          pageSlug: page.slug,
          lastModified: page.updatedAt ? new Date(page.updatedAt) : new Date()
        });
        this.toast.success(published ? 'Page published' : 'Page unpublished');
      },
      error: () => this.toast.error('Publish failed')
    });
  }

  onSearch(event: Event): void {
    this.treeService.searchQuery.set((event.target as HTMLInputElement).value);
  }

  clearSearch(): void {
    this.treeService.searchQuery.set('');
  }

  isExpanded(id: string): boolean {
    return this.treeService.expandedIds().has(id);
  }

  getIndentArray(level: number): number[] {
    return Array.from({ length: level }, (_, i) => i);
  }

  closeContextMenu(): void {
    this.contextMenu.update(menu => ({ ...menu, visible: false }));
  }

  onTreeClick(): void {
    this.closeContextMenu();
  }

  private createPageInFolder(folderId: string): void {
    this.pageApi.createPage({ title: 'Untitled Page' }).subscribe({
      next: page => {
        const node = this.treeService.addFile(page.title, page._id, folderId);
        this.treeService.updatePageStatus(page._id, {
          pageSlug: page.slug,
          published: page.published,
          lastModified: page.updatedAt ? new Date(page.updatedAt) : new Date()
        });
        this.treeService.startRename(node.id);
        this.focusRenameInput();
        this.router.navigate(['/editor', page._id]);
      },
      error: () => this.toast.error('Failed to create page')
    });
  }

  private duplicateNode(node: TreeNode): void {
    if (node.type === 'file' && node.pageId && node.pageId !== 'temp-id') {
      this.pageApi.duplicatePage(node.pageId).subscribe({
        next: page => {
          this.treeService.addFile(page.title, page._id, node.parentId || ROOT_FOLDER_ID);
          this.toast.success('Page duplicated');
        },
        error: () => this.toast.error('Duplicate failed')
      });
      return;
    }

    this.treeService.duplicateNode(node.id);
  }

  private commitRename(name: string, node: TreeNode): void {
    const newName = name.trim();
    if (!newName || newName === node.name) {
      this.treeService.cancelRename();
      return;
    }

    this.treeService.renameNode(node.id, newName);

    if (node.type === 'file' && node.pageId && node.pageId !== 'temp-id' && !node.pageId.startsWith('local-copy-')) {
      this.pageApi.updatePage(node.pageId, { title: newName }).subscribe({
        next: page => this.treeService.updatePageStatus(page._id, {
          name: page.title,
          pageSlug: page.slug,
          lastModified: page.updatedAt ? new Date(page.updatedAt) : new Date()
        }),
        error: () => this.toast.error('Rename saved locally, but page update failed')
      });
    }
  }

  private focusRenameInput(): void {
    setTimeout(() => {
      const input = this.renameInputRef?.nativeElement || document.querySelector<HTMLInputElement>('.rename-input');
      input?.focus();
      input?.select();
    }, 50);
  }
}
