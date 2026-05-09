export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Folder {
  id: string;
  name: string;
  icon: string;
  color: string;
  parentId: string | null;
  createdAt: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface AppState {
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
  selectedNoteId: string | null;
  selectedFolderId: string | null;
  searchQuery: string;
  isCommandPaletteOpen: boolean;
  isSidebarCollapsed: boolean;
  isBooting: boolean;
}