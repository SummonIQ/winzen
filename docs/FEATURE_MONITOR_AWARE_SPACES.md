# Monitor-Aware Spaces

## Why This Feature Matters

Multi-monitor support is one of the clearest divides between a useful toy and a serious desktop utility. Users with external displays have more complex workflows, and they are the users most likely to pay for workspace automation.

## Product Goals

- Detect connected displays
- Understand Space/display relationships as well as macOS allows
- Let users move windows with display awareness
- Support monitor-aware layouts and rules

## User Stories

- Keep communication apps on a vertical side monitor.
- Restore design tools to the external display when docked.
- Fall back gracefully when a monitor is disconnected.
- Save one workspace for laptop-only mode and another for docked mode.

## Product Scope

### MVP

- detect connected displays
- show display names and geometry
- associate windows with displays
- allow move window to display
- allow save/restore layout with display target metadata

### Phase 2

- monitor-aware rule conditions/actions
- monitor profiles
- monitor disconnect/reconnect recovery

### Phase 3

- support "Displays have separate Spaces" behavior explicitly
- better display identity persistence across reconnects
- docked/undocked automatic profile switching

## UX Requirements

### Main UI

- add display badges in window cards
- add display grouping in layout preview
- add monitor selector in rule builder

### Settings

- show whether "Displays have separate Spaces" is enabled
- show detected displays with:
  - name
  - resolution
  - arrangement role
  - main display status

### Failure UX

When a saved monitor is missing:

- show fallback target
- let user choose:
  - remap to current main display
  - skip affected windows
  - remember new mapping

## Data Model

### DisplaySnapshot

- `id`
- `displayId`
- `name`
- `isPrimary`
- `width`
- `height`
- `originX`
- `originY`
- `scaleFactor`

### Layout / Rule Additions

- `displayId`
- `displayName`
- `displayRole` like `primary`, `secondary`, `portable`

## Technical Requirements

### Electron / Native

Use Electron screen APIs to collect:

- display IDs
- bounds
- scale factor
- work area

Potential source:

- `screen.getAllDisplays()`

### Window Mapping

For each window:

- derive owning display from bounds
- detect if window spans displays
- choose primary display based on center point

### Space Mapping

This is the hard part. macOS does not expose a clean public API for Space/display topology. The implementation should:

- detect displays independently
- store display context with windows/layouts
- treat Space/display coupling as best-effort
- verify result after restore

## Interaction With Other Features

- layouts must store display metadata
- rules need display triggers/actions
- session restore must remap missing displays
- backup/sync should preserve display preferences

## Monetization

### Free

- display visibility only

### Pro

- move windows between displays
- monitor-aware layouts
- monitor-aware rules

### Plus

- docked/undocked profile switching
- synced monitor presets

## Risks

- external display IDs may change
- Spaces behave differently depending on system settings
- mirrored displays complicate window targeting
- not all apps move cleanly across displays

## Testing

- single external display
- two external displays
- disconnect during restore
- clamshell mode
- mirrored display mode
- separate Spaces enabled/disabled

## Rollout Plan

### Phase 1

- display detection
- display badges in UI
- window-to-display mapping

### Phase 2

- monitor-aware layout save/restore
- monitor-aware rules

### Phase 3

- dynamic monitor profile switching
- improved display identity reconciliation
