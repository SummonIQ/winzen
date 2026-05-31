# Session Restore On Login

## Why This Feature Matters

One of the highest-value promises Winzen can make is: "When you start your day, your workspace comes back." This is distinct from saved layouts because it captures the user's last real session, not just a manually curated preset.

## Product Goals

- remember the last working workspace state
- restore it after login, reboot, or relaunch
- make restore opt-in and predictable

## User Stories

- Restore my last workspace every morning after I log in.
- Reopen only communication and coding windows after reboot.
- Skip apps that are no longer installed.
- Restore my last session only when connected to my external monitor setup.

## Scope

### MVP

- capture session snapshot on app quit / periodic intervals
- detect login/startup
- prompt to restore last session
- restore windows, Spaces, and bounds best-effort

### Phase 2

- silent restore option
- restore subsets
- docked/undocked variants

### Phase 3

- multiple session restore points
- scheduled startup scenes

## UX Requirements

### Settings

- Enable session restore on login
- Ask before restoring
- Restore automatically
- Restore only favorite apps
- Restore only when displays match

### Startup Flow

Recommended:

1. App launches at login
2. Session snapshot found
3. User sees:
   - restore last session
   - dismiss
   - view details

For Pro users, allow "restore automatically without prompt."

## Data Model

### SessionSnapshot

- `id`
- `createdAt`
- `trigger`
- `windowsJson`
- `spacesJson`
- `displaySnapshotJson`
- `restoreEligible`

## Capture Strategy

### When To Save

- app quit
- periodic debounce during use
- before sleep if detectable
- before restart/install update

### What To Save

- current windows
- positions and sizes
- Space assignments
- display mapping
- current layout ID if applicable

## Implementation Requirements

### Desktop App

Add:

- `sessionCaptureService`
- `sessionRestoreService`
- `startupCoordinator`

Integrate with:

- launch at login
- layout engine
- rules engine
- monitor detection

### Restore Logic

Prefer reusing the layout restore engine rather than building a completely separate path.

## Monetization

### Free

- manual restore prompt after restart

### Pro

- automatic restore
- filtered restore
- docked/undocked logic

### Plus

- synced session continuation across devices is possible later, but only after cloud-backed state exists

## Risks

- session snapshot may contain transient windows the user does not want back
- restore may fail if apps launch slowly
- restoring too aggressively at login could feel invasive

## Safeguards

- opt-in default
- preview before restore
- app exclusions
- delayed restore sequence
- per-app retry windows

## Testing

- clean restart
- OS login item launch
- restore with one missing app
- restore with disconnected display
- restore after app crash

## Rollout Plan

### Phase 1

- snapshot capture
- manual restore prompt

### Phase 2

- automatic restore
- app exclusions
- monitor-aware restore checks
