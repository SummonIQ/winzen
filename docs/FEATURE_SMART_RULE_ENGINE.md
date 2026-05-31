# Smart Rule Engine

## Why This Feature Matters

Rules are where Winzen becomes proactive instead of reactive. The current product direction already includes app-to-Space assignment and follow-another-app behavior, but the real monetizable jump is a rule engine that can continuously shape a user's workspace.

This feature is central to:

- differentiated power-user value
- retention
- subscription upsell
- perceived "automation" intelligence

## Product Goals

- Automatically place windows based on deterministic rules
- Support more than one rule type
- Resolve conflicts clearly
- Show why a rule fired
- Allow safe automation without surprising users

## Rule Types

### MVP Rule Types

- Assign app to Space
- Assign app to monitor
- Follow another app's Space
- Restore saved layout when app launches
- Reposition window to fixed bounds

### Advanced Rule Types

- Time-based
- Day-of-week based
- Focus mode / work mode based
- Network / VPN aware
- External display connected/disconnected
- Window title contains / regex
- Frontmost app changed
- Login / wake / unlock triggers

## User Stories

- Open Slack on Space 2 whenever it launches.
- Keep Figma on the external monitor when connected.
- Put meeting apps on a dedicated Space during work hours.
- When VS Code opens, restore my "Coding" layout.
- Keep Notion on the same Space as the browser during research sessions.

## UX Requirements

### Rule Builder

Users need a visual rule builder with:

- trigger
- conditions
- action
- priority
- enabled/disabled state

### Required Screens

- Rules list
- Create rule dialog
- Edit rule dialog
- Rule test/simulate dialog
- Rule run history

### UX Principles

- simple defaults first
- advanced logic available but not required
- every rule should be human-readable
- every execution should be explainable

Example human-readable rule:

`When Slack launches, move it to Space "Comms" on Display 2.`

## Data Model

### Rule

- `id`
- `name`
- `enabled`
- `priority`
- `triggerType`
- `actionType`
- `createdAt`
- `updatedAt`
- `ownerUserId` nullable

### RuleCondition

- `id`
- `ruleId`
- `field`
- `operator`
- `value`
- `groupId` optional

### RuleAction

- `id`
- `ruleId`
- `type`
- `payloadJson`

### RuleExecution

- `id`
- `ruleId`
- `timestamp`
- `status`
- `matchedWindowId`
- `detailsJson`

## Architecture

### Main Process Rule Engine

The evaluator belongs in the main process, not React.

Services:

- `ruleRepository`
- `ruleMatcher`
- `ruleExecutor`
- `ruleScheduler`
- `ruleLogger`

### Triggers

The engine needs event sources:

- polling window scanner
- app launch events if detectable
- display change events
- login/wake events
- manual trigger from UI

### IPC

- `rules:list`
- `rules:get`
- `rules:create`
- `rules:update`
- `rules:delete`
- `rules:test`
- `rules:history`
- `rules:toggle`

## Rule Evaluation Model

### Trigger

What causes evaluation:

- app launched
- window detected
- schedule
- display changed
- login/startup
- manual

### Conditions

Examples:

- app name equals Slack
- bundle ID equals com.tinyspeck.slackmacgap
- title contains "Meeting"
- time between 9am and 5pm
- display count greater than 1
- active network equals work VPN

### Actions

- move to Space
- move to display
- resize/reposition
- restore layout
- add to container/group
- show notification

## Conflict Resolution

Conflicts are inevitable. The engine needs deterministic handling.

### Strategy

1. disabled rules ignored
2. higher priority runs first
3. exact app+title rules beat app-only rules
4. user-defined explicit overrides beat defaults
5. mutually exclusive actions produce a warning

### Conflict UI

When two rules both want to move a window:

- log the conflict
- show "Rule A won because priority 100 > 50"
- offer a quick fix link in rule editor

## Observability

This feature will be frustrating if users cannot tell what happened.

Required:

- rule execution log
- recent runs list
- last matched window
- result state
- failure reason

Nice to have:

- "Why did this happen?" inspector
- "Test this rule against current windows"

## Performance Requirements

- rules must not block UI interactions
- debounce or batch repeated scans
- separate detection from execution
- avoid repeated Space switches for the same batch

## Monetization

### Free

- up to 3 active rules
- basic app-to-Space rules only

### Pro

- unlimited rules
- monitor-based rules
- layout restore rules
- rule priorities
- run history

### Plus

- schedules
- context-aware rules
- cloud sync
- shared team rules

## Technical Risks

- no fully reliable public macOS Spaces API
- app/window detection quality varies by app
- polling too frequently may hurt performance
- action loops if rules respond to changes they cause

## Safeguards

- cooldown per rule
- max executions per minute
- rule dry-run mode
- loop detection
- global "pause automation" toggle

## Testing

- one rule, one window
- multiple matching rules
- conflicting actions
- app relaunch
- monitor unplug/replug
- sleep/wake
- rule disabled state
- batch execution on startup

## Rollout Plan

### Phase 1

- persisted rule model
- rule builder for simple app-to-Space rules
- manual trigger and execution log

### Phase 2

- priorities
- multiple action types
- monitor rules
- startup/app-launch triggers

### Phase 3

- schedules
- context-aware inputs
- sync and sharing
