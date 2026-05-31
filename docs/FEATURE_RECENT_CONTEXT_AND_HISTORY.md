# Recent Context And History

## Why This Feature Matters

Winzen currently helps users navigate Spaces. A history layer makes that navigation feel intelligent and reduces friction for repeated context switching.

This feature is useful because users often bounce between the same few contexts:

- current task
- previous task
- current meeting
- current communications Space

## Product Goals

- remember recently visited Spaces
- remember recently restored layouts
- provide fast "jump back" flows
- surface lightweight activity context without becoming spyware

## Key Concepts

### Recent Spaces

- last visited Spaces
- frequency
- recency

### Recent Layouts

- last restored layouts
- last saved layouts

### Context Stack

- previous Space
- previous layout
- previous workspace state

## User Stories

- Jump back to the last Space with one shortcut.
- Restore the last layout I used without opening the layout manager.
- See my most-used Spaces for this week.
- Use a recent-items list from the menu bar.

## UX Requirements

### Main App

- recent Spaces section above search results
- recent layouts section
- command: "Jump to previous Space"
- command: "Restore previous layout"

### Menu Bar

- recent Spaces submenu
- recent layouts submenu
- "Back to previous Space"

### Optional Insights Surface

- top 3 most-used Spaces
- most-restored layout
- time spent per workspace category

## Data Model

### SpaceVisit

- `id`
- `spaceId`
- `visitedAt`
- `source` enum:
  - keyboard
  - click
  - tray
  - automation

### LayoutUsage

- `id`
- `layoutId`
- `action` enum:
  - saved
  - restored
- `timestamp`

### SessionContext

- `previousSpaceId`
- `currentSpaceId`
- `previousLayoutId`
- `currentLayoutId`

## Privacy Requirements

This should stay clearly operational, not invasive.

Do not record:

- keystroke content
- document content
- app usage durations in a way that feels like surveillance by default

If analytics are added:

- keep them local by default
- make export explicit
- let users clear history

## Architecture

### Event Sources

- successful Space switches
- layout restore events
- menu bar actions
- automation executions

### Services

- `historyRepository`
- `recentsService`
- `contextStackService`

## Derived Features

- most used Spaces
- suggestions:
  - "Looks like you switch to Coding every morning"
- smart defaults in search ordering

## Monetization

### Free

- recent Spaces
- previous Space shortcut

### Pro

- recent layouts
- pinned/favorite recents
- recent context in menu bar

### Plus

- synced recents across devices
- context suggestions

## Risks

- stale recents if Space IDs change
- history noise from automation
- privacy concerns if presented poorly

## Safeguards

- separate automated vs manual activity
- clear history button
- disable history preference

## Testing

- previous Space accuracy
- recent ordering
- automation does not pollute manual history unexpectedly
- history survives restart

## Rollout Plan

### Phase 1

- event logging
- recent Spaces UI
- previous Space shortcut

### Phase 2

- recent layouts
- menu bar surfacing

### Phase 3

- suggestions
- sync
