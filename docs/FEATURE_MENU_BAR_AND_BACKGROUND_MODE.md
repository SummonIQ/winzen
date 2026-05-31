# Menu Bar And Background Mode

## Current State

Winzen already has a tray / menu bar presence in the Electron main process. Today it is minimal:

- tray icon
- tooltip
- click toggles main window
- context menu with:
  - Toggle Winzen
  - Quit Winzen

This exists in the current Electron main process and is a good foundation, but it is not yet a complete background-mode product.

### Current Reference File

- `desktop-app/src/main/main.ts`

## Why This Matters

For a utility app on macOS, menu bar quality is product quality. Users expect the app to feel available everywhere without taking over the Dock or requiring the main window to stay open.

This area also helps monetization because:

- it increases daily usage
- it reinforces perceived polish
- it creates room for quick paid workflows from the menu bar

## Product Goals

- Make Winzen useful even when the main window is closed
- Turn the menu bar item into a control center
- Support background automation safely
- Reduce reliance on opening the full UI for common actions

## What Is Missing Today

### Functional Gaps

- no recent Spaces list
- no recent layouts list
- no quick rule toggle
- no "pause automation" control
- no account state
- no subscription status visibility
- no backup/sync status
- no update status
- no launch at login toggle
- no direct access to setup/permissions state

### Platform Gaps

- no differentiated behavior between background mode and full quit
- no onboarding around menu bar behavior
- no health/status indicator for automation failures

## UX Requirements

### Primary Menu Structure

- Open Winzen
- Search Spaces
- Recent Spaces
- Favorite layouts
- Recent layouts
- Pause automations
- Capture screenshots now
- Setup and permissions
- Account
- Subscription
- Check for updates
- Launch at login
- Quit

### Tray Click Behavior

Recommended:

- single click: open quick panel
- option-click: open full app
- right click: context menu

If technical constraints make that too complex in Electron, keep:

- click toggles window
- right click shows advanced menu

### Status Indicators

Tray/menu bar should be able to signal:

- setup incomplete
- automation paused
- sync pending
- restore in progress
- update available

This can be done via:

- alternate tray icons
- submenu badges
- small textual status row

## Background Mode Requirements

### App Lifecycle

Closing the window should not quit the app by default on macOS.

Required modes:

- close window, keep background services alive
- explicit quit ends services
- optional preference: "Quit when main window closes"

### Services That Must Work In Background

- entitlement refresh
- menu bar interactions
- screenshot capture
- rule evaluation
- startup restore
- sync queue

## Implementation Requirements

### Main Process

Add a dedicated menu bar controller:

- `createTray()`
- `refreshTrayMenu(state)`
- `setTrayState(status)`
- `handleTrayAction(actionId)`

Add background state controller:

- `appMode`: `foreground`, `background`, `paused`
- `automationPaused`
- `syncStatus`
- `authStatus`
- `subscriptionStatus`

### Renderer / UI

Preferences UI:

- launch at login
- hide Dock icon if appropriate
- background mode behavior
- tray click behavior
- notifications toggle

### Native / Platform Features

- `app.setLoginItemSettings` for launch at login
- optional Dock hiding behavior if desired
- notification support for important background results

## Menu Bar Actions To Add

- switch to Space directly
- restore layout directly
- rename current Space
- refresh screenshots
- start/pause rule engine
- open setup wizard
- sign in / sign out
- manage subscription
- open changelog

## Authentication And Subscription Hooks

Menu bar is the best surface for lightweight account visibility.

Recommended account section:

- signed in as email
- current plan
- sync enabled/disabled
- manage billing
- sign out

## Monetization

### Free

- basic tray access
- open/toggle app
- recent Spaces

### Pro

- restore layouts from tray
- rule toggles from tray
- quick automation controls
- background screenshot capture controls

### Plus

- sync status
- team/shared layouts access
- multi-device management

## Risks

- menu sprawl
- stale state in tray menus
- background automation increasing CPU usage
- confusion between close and quit

## Testing

- app close vs quit behavior
- launch at login
- tray action reliability
- tray icon packaging in dev and production
- background services continue after window hide
- account state refresh updates menu correctly

## Rollout Plan

### Phase 1

- richer context menu
- launch at login
- automation pause
- recent Spaces

### Phase 2

- favorite/recent layouts
- account and subscription section
- sync and update indicators

### Phase 3

- advanced click behaviors
- quick panel from tray
- per-state tray icon variants
