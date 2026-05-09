import { useEffect, useCallback } from 'react';
import { useAppStore } from '../store';

export function useKeyboardShortcuts() {
  const { 
    toggleCommandPalette, 
    createNote,
    selectedNoteId,
    notes,
    updateNote,
    isCommandPaletteOpen
  } = useAppStore();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdKey = isMac ? e.metaKey : e.ctrlKey;

    if (cmdKey && e.key === 'k') {
      e.preventDefault();
      toggleCommandPalette();
    }

    if (cmdKey && e.key === 'n') {
      e.preventDefault();
      createNote();
    }

    if (e.key === 'Escape' && isCommandPaletteOpen) {
      toggleCommandPalette();
    }

    if (selectedNoteId && cmdKey && e.key === 's') {
      e.preventDefault();
    }
  }, [toggleCommandPalette, createNote, selectedNoteId, isCommandPaletteOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}