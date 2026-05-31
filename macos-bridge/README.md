# Winzen macOS Bridge

This package is the native macOS helper used by the Electrobun desktop shell.

## Purpose

The helper owns macOS-native operations such as:

- Spaces enumeration and switching
- window enumeration and manipulation
- screenshot capture
- permission checks

The desktop shells should treat this helper as a shell-agnostic command service.

## Transport

The current scaffold uses newline-delimited JSON over stdio.

Example request:

```json
{
  "id": "req_1",
  "command": "bridge.health",
  "payload": {}
}
```

Example response:

```json
{
  "id": "req_1",
  "success": true,
  "data": {
    "status": "ok",
    "version": "0.0.1"
  },
  "timing_ms": 1
}
```

## Current status

Implemented:

- request parsing
- response formatting
- `bridge.health`
- native Accessibility permission check
- native Screen Recording permission check

Stubbed:

- Spaces commands
- window commands
- screenshot commands

## Local build

Expected binary path after local debug build:

```text
macos-bridge/.build/debug/WinzenBridgeCLI
```

The desktop app can also use an explicit path via environment variable:

```text
WINZEN_BRIDGE_PATH=/absolute/path/to/WinzenBridgeCLI
```

## Next implementation targets

1. `spaces.list`
2. `spaces.current`
3. `screens.capture_current`
4. `windows.list`
