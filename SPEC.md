# VOID - Notes Application Specification

## 1. Project Overview

**Project Name:** VOID
**Type:** Desktop Notes Application (Web-first, Electron wrapper)
**Core Functionality:** A premium, futuristic notes application with markdown support, smart organization, and cyberpunk-inspired UI
**Target Users:** Developers, designers, power users seeking a luxurious, cinematic note-taking experience

## 2. UI/UX Specification

### 2.1 Window Structure
- **Main Window:** Frameless Electron window with custom title bar
- **Custom Title Bar:** Drag region, window controls (minimize, maximize, close)
- **Layout:** Left collapsible sidebar + centered workspace

### 2.2 Visual Design

#### Color Palette
- **Background Primary:** #050505 (deep black)
- **Background Secondary:** #080808 (near-black)
- **Background Tertiary:** #0A0A0A (elevated surfaces)
- **Surface:** #0D0D0D (cards, panels)
- **Surface Hover:** #141414
- **Border Primary:** #1A1A1A (subtle borders)
- **Border Glow:** #2A2A2A (hover states)
- **Text Primary:** #FFFFFF (headings, important text)
- **Text Secondary:** #A0A0A0 (body text)
- **Text Muted:** #666666 (labels, hints)
- **Accent Primary:** #00FFFF (cyan glow)
- **Accent Secondary:** #FF00FF (magenta, subtle)
- **Success:** #00FF88
- **Warning:** #FFAA00
- **Error:** #FF4444

#### Typography
- **Font Family:** JetBrains Mono (globally)
- **Headings:**
  - H1: 32px, font-weight 700, letter-spacing -0.02em
  - H2: 24px, font-weight 600
  - H3: 18px, font-weight 600
- **Body:** 14px, font-weight 400, line-height 1.6
- **Small/Labels:** 12px, font-weight 500, letter-spacing 0.05em, lowercase

#### Spacing System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96
- Content padding: 24px
- Card padding: 16px
- Component gap: 12px

#### Visual Effects
- **Glow Effects:** 0 0 20px rgba(0, 255, 255, 0.15) on hover
- **Glass Effect:** backdrop-filter: blur(20px), background: rgba(13, 13, 13, 0.8)
- **Shadows:** 0 4px 24px rgba(0, 0, 0, 0.5)
- **Gradients:** Subtle radial gradients from center (#0A0A0A to #050505)
- **Borders:** 1px solid with subtle glow on hover

### 2.3 Components

#### Sidebar
- Width: 280px (expanded), 64px (collapsed)
- Sections: Logo, Navigation, Folders, Tags, Quick Actions
- Animated collapse/expand with smooth width transition
- Hover: Subtle glow effect on icons

#### Notes List
- Card-style items with hover glow
- Preview text truncation
- Metadata: date, tags, favorite icon
- Animated selection state

#### Editor
- Full-width markdown editor
- Floating toolbar on selection
- Live preview toggle
- Syntax highlighting for code blocks

#### Command Palette
- Centered modal with glass effect
- Search input with typing animation
- Animated result list with stagger
- Keyboard navigation

#### Title Bar
- Height: 40px
- Draggable region
- Custom window controls with hover states
- App title with subtle glow

### 2.4 Animations

#### Transitions
- All UI transitions: 200-300ms ease-out
- Page transitions: 400ms with fade and slide
- Modal open/close: 300ms with scale and fade

#### Microinteractions
- Button hover: Scale 1.02, glow effect
- Icon hover: Rotate or bounce subtly
- Input focus: Border glow animation
- Toggle: Smooth slide with color transition

#### Page Load
- Boot sequence animation (2 seconds)
- Staggered fade-in of elements
- Logo reveal with blur effect

#### Ambient
- Subtle floating particles in background
- Breathing animation on key elements
- Typing cursor blink
- Gradient movement on idle

## 3. Functionality Specification

### 3.1 Core Features

#### Notes Editor
- Markdown support with live preview
- Syntax highlighting for code blocks
- Slash commands for quick actions
- Auto-save every 2 seconds
- Keyboard shortcuts (bold, italic, etc.)

#### Notes Management
- Create, edit, delete notes
- Folders (nested support)
- Tags (multiple per note)
- Favorites (starred notes)
- Pinned notes (top of list)
- Archive system
- Recently opened (last 10)

#### Search & Filter
- Full-text search across all notes
- Filter by folder, tag, favorite
- Instant results with highlight
- Search history

#### Command Palette
- Trigger: CMD/CTRL + K
- Actions: Create note, Search, Change folder, Settings
- Quick navigation to any note

### 3.2 User Interactions
- Click to open note
- Double-click to create new note
- Drag to reorder
- Right-click context menu
- Keyboard-first navigation

### 3.3 Data Handling
- Local storage: IndexedDB (Dexie.js)
- Auto-save with debounce
- Export as Markdown
- Import from Markdown files

### 3.4 Edge Cases
- Empty state designs
- Long note titles (truncate)
- Offline functionality
- Large note content (virtualization)

## 4. Acceptance Criteria

### Visual Checkpoints
- [ ] Dark theme with pure black backgrounds
- [ ] JetBrains Mono font throughout
- [ ] Glowing cyan accent on interactive elements
- [ ] Smooth 60fps animations
- [ ] Glass/frosted glass effects on modals
- [ ] Custom frameless window with working controls

### Functional Checkpoints
- [ ] Create, edit, delete notes
- [ ] Markdown rendering
- [ ] Folder and tag organization
- [ ] Search returns relevant results
- [ ] Command palette opens with CMD+K
- [ ] Auto-save works
- [ ] Notes persist after reload

### Performance Checkpoints
- [ ] App loads in under 3 seconds
- [ ] Smooth scrolling in notes list
- [ ] No lag when typing in editor
- [ ] Memory usage under 200MB at idle