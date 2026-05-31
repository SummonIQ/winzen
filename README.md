# Winzen

A powerful desktop management tool for macOS that helps you organize and switch between multiple desktops (Spaces) effortlessly.

## Features

- 🚀 **Lightning Fast Switching** - Navigate between desktops instantly with keyboard shortcuts
- 👁️ **Visual Space Overview** - See all your desktops at a glance with beautiful previews
- ⌨️ **Keyboard-First Design** - Press ⌘+D to bring up Winzen from anywhere
- 📸 **Smart Screenshots** - Automatically capture previews of your spaces
- 📦 **Window Containers** - Group windows together and move them as one
- ✨ **Beautiful Interface** - Native macOS experience with smooth animations

## Project Structure

This is a Turborepo monorepo managed with Bun:

```
.claude/               # Claude settings
app/                   # Shared Winzen React UI and assets
desktop-app-electrobun/ # Winzen desktop app (Electrobun + React + TypeScript)
marketing-site/        # Marketing site (Next.js 15 + Tailwind v4)
scripts/               # Build and dev scripts
docs/                  # Documentation
turbo.json             # Turborepo configuration
package.json           # Workspace configuration
```

### Apps

#### 🖥️ Desktop App (`desktop-app-electrobun/`)

- Built with Electrobun, React, and TypeScript
- Uses Tailwind CSS for styling
- Shared UI lives in `app/renderer`
- Manages spaces, windows, and containers
- Native macOS integration lives in `macos-bridge`

#### 🌐 Marketing Site (`marketing-site/`)

- Built with Next.js 15 (App Router)
- Tailwind CSS v4 with oklch colors
- Modern, elegant purple-themed design
- Fully responsive with dark mode support
- See [marketing-site/README.md](marketing-site/README.md) for details

## Prerequisites

- Bun (recommended)
- Node.js 20+
- ffmpeg (for video thumbnail generation)

Install ffmpeg on macOS:

```bash
brew install ffmpeg
```

## Installation

Install all workspace dependencies:

```bash
bun install
```

## Development

### Run all apps simultaneously:

The main `dev` command will:

1. 🧹 Kill any existing dev processes
2. 🚀 Start both the desktop app and marketing site in parallel
3. 🌐 Automatically open the marketing site in your browser

```bash
bun run dev
```

This uses Turborepo to run both apps in parallel:

- Desktop app: Winzen launches automatically
- Marketing site: Opens at http://localhost:30231

### Run specific app:

```bash
# Desktop app only
bun run dev:desktop-app

# Marketing site only
bun run dev:marketing-site
```

### Other commands:

```bash
# Type check all apps
bun run type-check

# Build all apps (using Turborepo)
bun run build

# Lint all apps (using Turborepo)
bun run lint

# Clean up dev processes manually
bun run dev:cleanup
```

### Turborepo Benefits

- **Parallel execution** - Both apps start simultaneously
- **Smart caching** - Faster builds with intelligent caching
- **Task orchestration** - Coordinated build and dev workflows
- **Automatic cleanup** - Kills old processes before starting new ones

## Technologies

### Monorepo

- **Turborepo** - High-performance build system
- **Bun** - Fast JavaScript runtime and package manager

### Desktop App

- **Electrobun** - Desktop shell runtime
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **Heroicons** - Icon library
- **AppleScript** - macOS automation

### Marketing Site

- **Next.js 15** - React framework with App Router
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Modern CSS with oklch colors
- **Lucide React** - Icon library

## Documentation

📚 **Comprehensive guides available**:

- **[CLAUDE.md](CLAUDE.md)** - Complete architecture, features, and coding patterns
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Developer guide with common tasks and patterns
- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - Current state, recent changes, known issues
- **[QUICKSTART.md](QUICKSTART.md)** - Quick setup and usage guide

## Recent Updates

### Performance Improvements

- ✅ **5-minute thumbnail caching** - 95% faster repeated views
- ✅ **Smart dropdown positioning** - Opens upward when near screen edge
- ✅ **Event bubbling fixes** - Improved click handling in nested elements
- ✅ **Video thumbnail reliability** - Better FFmpeg error handling with timeout

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for detailed changelog.

## License

MIT
