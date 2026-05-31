# Saved Layouts And Workspace Restore

## Why This Feature Matters

Saved layouts are the clearest upgrade from "Space switcher" to "workspace operating system." Users do not just want to jump between Spaces; they want to restore a known-good setup for coding, writing, meetings, or design work with one action.

This is also one of the strongest Pro features because it delivers repeated daily value and is easy to explain on a pricing page:

- Save your current workspace
- Restore it later
- Rebuild your setup after a reboot, app relaunch, or context switch

## Product Goals

- Let users save named workspace layouts
- Restore window size, position, Space placement, and grouping
- Support both full workspace restore and partial restore
- Make layout restore reliable enough to become a daily workflow
- Gate advanced layout variants and automation hooks behind paid plans

## User Stories

- As a developer, I want a "Coding" layout that places editor, terminal, browser, and docs on specific Spaces.
- As a designer, I want a "Review" layout that opens Figma, Slack, notes, and browser windows in predictable positions.
- As a manager, I want to restore a "Daily Standup" layout before a meeting.
- As a power user, I want to restore only one monitor or one subset of apps instead of the entire workspace.

## Scope

### MVP

- Save current window state as a named layout
- Save:
  - app name
  - window title pattern
  - position
  - size
  - Space ID / Space number
  - display identifier if available
- Restore layout on demand
- Show restore progress and failures
- Support overwrite and duplicate layout
- Allow deleting layouts

### Phase 2

- Partial restore by app or monitor
- "Open missing apps" option during restore
- Layout templates
- Layout version history
- Per-layout keyboard shortcuts

### Phase 3

- Conditional restore
- Time-based layout suggestions
- Team-shared layouts
- Cloud-synced layouts

## UX Requirements

### Core Entry Points

- Main app:
  - "Layouts" button in primary navigation
  - command palette action: "Save current layout"
  - command palette action: "Restore layout"
- Menu bar:
  - quick restore recent layouts
  - save current workspace
- Keyboard:
  - optional shortcuts for favorite layouts

### Save Flow

1. User selects "Save current layout"
2. App captures current window snapshot
3. User enters:
   - layout name
   - optional description
   - scope: current Space / all Spaces / current monitor / all monitors
4. App previews windows that will be included
5. User confirms save

### Restore Flow

1. User selects a saved layout
2. App shows summary:
   - apps affected
   - Spaces affected
   - windows that may need manual attention
3. User chooses:
   - restore positions only
   - restore Spaces only
   - full restore
4. App performs restore in ordered steps
5. App shows success/failure per window

## Data Model

Add new persisted entities.

### Layout

- `id`
- `name`
- `description`
- `createdAt`
- `updatedAt`
- `scopeType`
- `isFavorite`
- `lastRestoredAt`
- `ownerUserId` nullable for local-only mode
- `source` enum: `local`, `cloud`, `template`

### LayoutWindow

- `id`
- `layoutId`
- `appName`
- `bundleId` if detectable
- `windowTitle`
- `windowTitlePattern`
- `spaceId`
- `spaceNumber`
- `displayId`
- `x`
- `y`
- `width`
- `height`
- `zOrder` optional
- `isRequired`

### LayoutRestoreRun

- `id`
- `layoutId`
- `startedAt`
- `completedAt`
- `status`
- `resultSummary`
- `failuresJson`

## Storage Strategy

### Initial

- Local persistence in Electron app storage
- Use a real local store instead of overloading `localStorage`
- Preferred:
  - SQLite
  - or JSON store if speed matters for first version

### Later

- Sync layout metadata and payloads to backend for authenticated Pro/Plus users
- Keep local cache for offline restore

## Architecture Requirements

### Desktop App

Add a layout service in the Electron main process:

- `captureCurrentLayout()`
- `saveLayout(input)`
- `listLayouts()`
- `getLayout(id)`
- `deleteLayout(id)`
- `restoreLayout(id, options)`

Add IPC channels:

- `layout:list`
- `layout:get`
- `layout:create`
- `layout:update`
- `layout:delete`
- `layout:restore`
- `layout:capture-preview`

### Renderer

Add screens/components:

- `LayoutManager`
- `LayoutCard`
- `LayoutRestoreDialog`
- `LayoutSaveDialog`
- `LayoutRestoreProgress`

### Required System Capabilities

- reliable window enumeration
- reliable window movement
- reliable Space switching
- best-effort display detection

## Restore Algorithm

Restore should not be "move everything blindly." It needs predictable sequencing.

### Proposed Order

1. Resolve target layout payload
2. Scan current windows
3. Match saved windows to live windows using:
   - bundle/app name
   - title exact match
   - title fuzzy match fallback
4. Group actions by target Space
5. Switch to target Space if needed
6. Activate app/window
7. Move to Space if needed
8. Set bounds
9. Verify result
10. Record success/failure

### Matching Heuristics

- Strong:
  - bundle ID + title
- Medium:
  - app name + normalized title
- Weak:
  - app name only

When multiple candidate windows match, mark ambiguous and let the user choose in advanced mode.

## Technical Constraints

Winzen already uses AppleScript and System Events. This means restore reliability will be limited by:

- apps that do not expose windows properly
- full-screen windows
- windows created asynchronously after app launch
- Space switching delays
- multiple monitors with independent Spaces enabled

This is why the restore engine needs retries, verification, and a clear failure surface.

## Monetization

### Free

- Save up to 2 layouts
- Manual restore only
- Current monitor / current Space scope only

### Pro

- Unlimited layouts
- Full workspace restore
- All Spaces and monitors
- Favorite layouts
- Restore preview
- Keyboard shortcut triggers

### Plus

- Cloud sync
- Version history
- Team-shared layouts
- Suggested layouts

## Dependencies On Other Projects

- Better window detection
- More stable Space identification
- Subscription entitlements
- Optional auth for sync

## Testing Requirements

- Save and restore single-monitor layout
- Save and restore multi-Space layout
- Restore with missing apps
- Restore with renamed Space
- Restore after reboot/login
- Restore with one failed window
- Restore with ambiguous title matching

## Rollout Plan

### Phase 1

- local data model
- save layout
- restore layout
- basic UI

### Phase 2

- verification UI
- retry logic
- partial restore

### Phase 3

- sync and cloud features
- keyboard triggers
- smarter matching

## Success Metrics

- layout save success rate
- layout restore success rate
- average restore duration
- % of paid users with at least one saved layout
- repeat restores per week

## Recommended Implementation Order

1. local data model
2. capture current windows and Spaces into layout payload
3. manual restore with progress UI
4. verification pass and retry logic
5. shortcut and menu bar hooks
6. cloud sync
