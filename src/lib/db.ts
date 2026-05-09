import Dexie, { Table } from 'dexie';
import { Note, Folder, Tag } from '../types';

export class VoidDatabase extends Dexie {
  notes!: Table<Note>;
  folders!: Table<Folder>;
  tags!: Table<Tag>;

  constructor() {
    super('void-notes');
    this.version(1).stores({
      notes: 'id, folderId, isFavorite, isPinned, isArchived, createdAt, updatedAt, *tags',
      folders: 'id, parentId, createdAt',
      tags: 'id, name',
    });
  }
}

export const db = new VoidDatabase();

export async function initializeDatabase() {
  const folderCount = await db.folders.count();
  
  if (folderCount === 0) {
    const defaultFolders: Folder[] = [
      { id: 'personal', name: 'personal', icon: 'user', color: '#00FFFF', parentId: null, createdAt: Date.now() },
      { id: 'work', name: 'work', icon: 'briefcase', color: '#FF00FF', parentId: null, createdAt: Date.now() },
      { id: 'ideas', name: 'ideas', icon: 'lightbulb', color: '#00FF88', parentId: null, createdAt: Date.now() },
    ];

    const defaultTags: Tag[] = [
      { id: 'important', name: 'important', color: '#FF4444' },
      { id: 'todo', name: 'todo', color: '#FFAA00' },
      { id: 'done', name: 'done', color: '#00FF88' },
    ];

    await db.folders.bulkAdd(defaultFolders);
    await db.tags.bulkAdd(defaultTags);

    const demoNotes: Note[] = [
      {
        id: 'welcome',
        title: 'welcome to void',
        content: `# Welcome to VOID

This is your new **premium** notes experience.

## Features

- **Markdown** support with live preview
- *Beautiful* syntax highlighting
- Slash commands for quick actions
- Folders and tags organization

## Getting Started

1. Create a new note with \`CMD + N\`
2. Search with \`CMD + K\`
3. Organize with folders and tags

---

> "The void is not empty. It's full of possibilities."

\`\`\`javascript
const void = {
  infinite: true,
  possibilities: [],
  future: () => create()
};
\`\`\`
`,
        folderId: 'personal',
        tags: [],
        isFavorite: true,
        isPinned: true,
        isArchived: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'project-alpha',
        title: 'project alpha roadmap',
        content: `# Project Alpha Roadmap

## Q1 2024
- [x] Design system
- [ ] Core features
- [ ] Testing

## Q2 2024
- [ ] Launch beta
- [ ] Gather feedback
- [ ] Iterate

## Notes
- Need to hire 2 more developers
- Budget: $50k
- Timeline: 6 months
`,
        folderId: 'work',
        tags: ['todo', 'important'],
        isFavorite: false,
        isPinned: false,
        isArchived: false,
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 86400000,
      },
      {
        id: 'ai-thoughts',
        title: 'ai ideas',
        content: `# AI Ideas

## Potential Projects

1. **Code Assistant**
   - Context-aware completion
   - Natural language queries

2. **Creative Writing**
   - Story generation
   - Character development

3. **Data Analysis**
   - Pattern recognition
   - Visualization

\`\`\`python
# Neural network concept
class NeuralVoid:
    def __init__(self):
        self.layers = []
        self.weights = initialize()
    
    def think(self, input):
        return self.forward(input)
\`\`\`
`,
        folderId: 'ideas',
        tags: [],
        isFavorite: true,
        isPinned: false,
        isArchived: false,
        createdAt: Date.now() - 172800000,
        updatedAt: Date.now() - 172800000,
      },
    ];

    await db.notes.bulkAdd(demoNotes);
  }
}