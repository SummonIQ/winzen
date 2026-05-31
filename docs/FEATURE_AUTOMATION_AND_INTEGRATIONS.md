# Automation And Integrations

## Why This Feature Matters

Automation turns Winzen into infrastructure for power users. It also creates a durable monetization story because technical users will pay for control surfaces that fit into their workflows.

## Product Goals

- expose Winzen functionality outside the main UI
- support scripted workflows
- support macOS-native automation tools
- keep the first version simple and reliable

## Integration Surface Areas

### Command Line Interface

Commands like:

- `winzen spaces list`
- `winzen spaces switch <id>`
- `winzen layouts list`
- `winzen layouts restore <id>`
- `winzen rules pause`
- `winzen backup export`

### URL Scheme

- `winzen://space/2`
- `winzen://layout/coding/restore`
- `winzen://rules/pause`

### macOS Shortcuts

Expose actions like:

- switch Space
- restore layout
- export config
- pause automations

### Optional Local HTTP API

Only for advanced users and likely behind a paid tier:

- localhost-only
- disabled by default
- token-auth protected

## UX Requirements

- integrations settings page
- enable/disable each integration
- regenerate tokens
- audit recent automation calls

## Implementation Requirements

### CLI

Add a bundled CLI entrypoint or helper binary that can communicate with the running Electron app.

Approaches:

- IPC to existing app instance
- localhost bridge
- shelling into app helper

Recommended first pass:

- simple IPC bridge through main process

### Shortcuts

May require a helper app, URL scheme, or AppleScript-accessible actions.

### URL Scheme

Register custom protocol in Electron packaging config.

## Security Requirements

- localhost APIs must require token auth
- disable remote network access by default
- log automation calls
- allow full kill switch for integrations

## Monetization

### Free

- basic URL scheme or simple CLI

### Pro

- full CLI
- Shortcuts actions
- layout/rule commands

### Plus

- localhost API
- webhooks
- advanced integration audit logs

## Testing

- CLI with running app
- CLI when app is not running
- URL scheme invocation
- token auth on localhost endpoints
- duplicate automation calls

## Rollout Plan

### Phase 1

- CLI for Spaces and layouts
- URL scheme

### Phase 2

- Shortcuts actions
- backup/export actions

### Phase 3

- localhost API
- webhook/event integrations
