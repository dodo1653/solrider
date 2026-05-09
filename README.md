# VOID - Premium Cyberpunk Notes Application

A futuristic, minimalist notes application with a cyberpunk aesthetic inspired by crypto trading terminals and high-end productivity software.

## Features

- 🎨 Ultra-minimal dark aesthetic with glowing cyan accents
- 📝 Rich markdown editor with live preview
- 🔍 Command palette (Cmd/Ctrl + K)
- 📁 Folders and tags organization
- ⭐ Favorites and pinning
- ⚡ Instant search
- 🎬 Smooth animations and microinteractions
- 🔐 Offline-first with IndexedDB storage

## Tech Stack

- **Frontend:** React + Vite + TypeScript
- **Styling:** TailwindCSS
- **Animations:** Framer Motion
- **Database:** IndexedDB (Dexie.js)
- **Desktop:** Electron (frameless window)

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Run as Desktop App (Electron)

```bash
npm run electron:dev
```

### Build Electron App

```bash
npm run electron:build
```

## Keyboard Shortcuts

- `Cmd/Ctrl + K` - Open command palette
- `Cmd/Ctrl + N` - Create new note
- `Escape` - Close command palette

## Project Structure

```
src/
├── components/     # UI components
├── hooks/          # Custom React hooks
├── lib/            # Database and utilities
├── store/          # Zustand state management
├── types/          # TypeScript types
├── App.tsx         # Main application
└── main.tsx        # Entry point

electron/
├── main.js         # Electron main process
└── preload.js      # Preload script
```

## License

MIT