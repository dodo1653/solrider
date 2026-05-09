import { create } from 'zustand';
import { Note, Folder, Tag } from '../types';
import { db, initializeDatabase } from '../lib/db';
import { v4 as uuid } from 'uuid';

interface AppStore {
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
  selectedNoteId: string | null;
  selectedFolderId: string | null;
  searchQuery: string;
  isCommandPaletteOpen: boolean;
  isSidebarCollapsed: boolean;
  isBooting: boolean;
  isLoading: boolean;
  
  initialize: () => Promise<void>;
  setSelectedNote: (id: string | null) => void;
  setSelectedFolder: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  toggleCommandPalette: () => void;
  toggleSidebar: () => void;
  setBooting: (booting: boolean) => void;
  
  createNote: (title?: string, content?: string) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  archiveNote: (id: string) => Promise<void>;
  
  createFolder: (name: string) => Promise<Folder>;
  deleteFolder: (id: string) => Promise<void>;
  
  createTag: (name: string, color: string) => Promise<Tag>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  notes: [],
  folders: [],
  tags: [],
  selectedNoteId: null,
  selectedFolderId: null,
  searchQuery: '',
  isCommandPaletteOpen: false,
  isSidebarCollapsed: false,
  isBooting: true,
  isLoading: true,

  initialize: async () => {
    await initializeDatabase();
    const notes = await db.notes.toArray();
    const folders = await db.folders.toArray();
    const tags = await db.tags.toArray();
    
    const pinnedNotes = notes.filter(n => n.isPinned);
    const otherNotes = notes.filter(n => !n.isPinned);
    const sortedNotes = [...pinnedNotes, ...otherNotes].sort((a, b) => b.updatedAt - a.updatedAt);
    
    set({ 
      notes: sortedNotes, 
      folders, 
      tags, 
      isLoading: false,
      selectedNoteId: sortedNotes[0]?.id || null
    });
  },

  setSelectedNote: (id) => set({ selectedNoteId: id }),
  setSelectedFolder: (id) => set({ selectedFolderId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setBooting: (booting) => set({ isBooting: booting }),

  createNote: async (title = '', content = '') => {
    const note: Note = {
      id: uuid(),
      title: title || 'untitled',
      content,
      folderId: get().selectedFolderId,
      tags: [],
      isFavorite: false,
      isPinned: false,
      isArchived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await db.notes.add(note);
    set((state) => ({ 
      notes: [note, ...state.notes],
      selectedNoteId: note.id
    }));
    
    return note;
  },

  updateNote: async (id, updates) => {
    const updatedAt = Date.now();
    await db.notes.update(id, { ...updates, updatedAt });
    
    set((state) => ({
      notes: state.notes.map(n => n.id === id ? { ...n, ...updates, updatedAt } : n)
    }));
  },

  deleteNote: async (id) => {
    await db.notes.delete(id);
    set((state) => ({
      notes: state.notes.filter(n => n.id !== id),
      selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId
    }));
  },

  toggleFavorite: async (id) => {
    const note = get().notes.find(n => n.id === id);
    if (note) {
      await get().updateNote(id, { isFavorite: !note.isFavorite });
    }
  },

  togglePin: async (id) => {
    const note = get().notes.find(n => n.id === id);
    if (note) {
      await get().updateNote(id, { isPinned: !note.isPinned });
    }
  },

  archiveNote: async (id) => {
    await get().updateNote(id, { isArchived: true });
  },

  createFolder: async (name) => {
    const folder: Folder = {
      id: uuid(),
      name: name.toLowerCase(),
      icon: 'folder',
      color: '#00FFFF',
      parentId: null,
      createdAt: Date.now(),
    };
    
    await db.folders.add(folder);
    set((state) => ({ folders: [...state.folders, folder] }));
    
    return folder;
  },

  deleteFolder: async (id) => {
    await db.folders.delete(id);
    set((state) => ({
      folders: state.folders.filter(f => f.id !== id),
      selectedFolderId: state.selectedFolderId === id ? null : state.selectedFolderId
    }));
  },

  createTag: async (name, color) => {
    const tag: Tag = {
      id: uuid(),
      name: name.toLowerCase(),
      color,
    };
    
    await db.tags.add(tag);
    set((state) => ({ tags: [...state.tags, tag] }));
    
    return tag;
  },
}));