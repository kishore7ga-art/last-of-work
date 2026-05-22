export type TreeNodeType = 'file' | 'folder' | 'block';

export interface TreeNode {
  id: string;
  name: string;
  type: TreeNodeType;
  pageId?: string;
  pageSlug?: string;
  published?: boolean;
  lastModified?: Date;
  children?: TreeNode[];
  expanded?: boolean;
  level: number;
  parentId?: string;
  order: number;
  selected?: boolean;
  focused?: boolean;
  renaming?: boolean;
  // Block-specific fields
  blockId?: string;
  blockType?: string;
  icon?: string;
}

export interface FileTreeState {
  nodes: TreeNode[];
  selectedId: string | null;
  focusedId: string | null;
  expandedIds: Set<string>;
  renamingId: string | null;
  searchQuery: string;
  cutNodeId: string | null;
  copiedNodeId: string | null;
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  divider?: boolean;
  danger?: boolean;
  disabled?: boolean;
}

export const ROOT_FOLDER_ID = 'root';

function createTreeId(prefix: TreeNodeType): string {
  const cryptoId = globalThis.crypto?.randomUUID?.();
  return cryptoId ? `${prefix}-${cryptoId}` : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createFileNode(
  name: string,
  pageId: string,
  parentId: string,
  order: number,
  level: number
): TreeNode {
  return {
    id: createTreeId('file'),
    name,
    type: 'file',
    pageId,
    level,
    parentId,
    order,
    published: false,
    lastModified: new Date()
  };
}

export function createFolderNode(
  name: string,
  parentId: string,
  order: number,
  level: number
): TreeNode {
  return {
    id: createTreeId('folder'),
    name,
    type: 'folder',
    children: [],
    expanded: true,
    level,
    parentId,
    order
  };
}

export function createBlockNode(
  name: string,
  blockId: string,
  blockType: string,
  parentId: string,
  order: number,
  level: number,
  icon?: string
): TreeNode {
  return {
    id: createTreeId('block'),
    name,
    type: 'block',
    blockId,
    blockType,
    parentId,
    order,
    level,
    icon: icon ?? 'box',
    expanded: false
  };
}
