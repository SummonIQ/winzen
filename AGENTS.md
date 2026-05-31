# AGENTS.md

## Incident Learnings

### Renderer safety after layout edits
- Do not treat a renderer layout tweak as "safe" without verifying it compiles.
- After editing `app/renderer/src/App.tsx` or other shared renderer files, validate against the active Electrobun desktop app, not any retired shell.
- A previous failure came from referencing `headerHeight` before declaration in `App.tsx`, which blanked the desktop window at runtime. Do not reorder or reference layout constants casually.

### Header adjustments
- When the user asks for a visible header spacing change, modify the actual visible gap they describe, not an internal proxy value that may be visually swallowed by other layout rules.
- Do not make repeated 1-3px "guess" changes in the header area if the user says there is no visible difference. Inspect the actual rendered spacing path first.
- If the user says "do not touch the header again," do not touch `App.tsx` header layout/styling unless they explicitly reverse that instruction.
- Current locked header geometry in `app/renderer/src/App.tsx`:
  - `headerHeight = 67`
  - `headerPaddingY = 8`
  - `windowTopPadding = 17` in expanded mode
  - `headerTopInset = 2`
- Do not change those values unless the user explicitly asks to change header/window top spacing again.

### Collapsed view changes
- Do not hide or restructure major layout containers in collapsed mode unless the full collapsed render path is verified. A prior change used `display: none` on the content wrapper and contributed to a broken/blank result.
- For collapsed vertical centering, prefer adjusting the actual container geometry directly and verify both collapsed and expanded states after the change.

### Trust user-visible results
- Treat the user's report of what they see as ground truth. Do not argue that a pixel change is "too small to notice" if the user says they can see it.
- If the visible result differs from the intended code change, inspect the live layout path instead of assuming the code change must have shown up.

### Visual validation preconditions
- Do not attempt screenshot-based or visual validation on hope or assumption.
- Before any visual validation, explicitly confirm all three:
  - which exact app instance is being validated (`dev` app vs bundled app)
  - that the target window is actually open and is the foreground validation target
  - that the artifact being inspected is produced by the current code, not stale output
- If those preconditions are not proven, do not describe the result as validated.
- For Electrobun specifically, first confirm the running app path or dev process, then the frontend artifact path, then the live window state, and only then attempt visual inspection or capture.

### Commit discipline
- Commit working checkpoints more often during volatile UI iteration so regressions are easy to isolate and revert.
- When asked to commit changes, do it promptly instead of letting renderer, Electrobun shell, and styling edits accumulate together.
### Desktop runtime tracing order
- Before debugging desktop runtime behavior, verify the execution target in this order:
  1. what exact app binary / UI artifact is being run
  2. what exact frontend bundle the desktop shell is packaging or serving
  3. whether the runtime behavior is coming from current code or stale output
  4. only then debug the switch logic or other runtime behavior itself
- Do not use a bundled desktop app as proof of current UI behavior until the bundle input has been verified.
- Do not debug shell/runtime logic first if the running app may still be serving stale frontend assets.

### Build vs runtime validation
- Do not claim a fix is "validated" when only compilation/build/package checks have passed.
- Distinguish explicitly between:
  - build validation: TypeScript/Swift/Rust/desktop build passes
  - runtime validation: behavior matches the user's actual macOS state
- For macOS Spaces work, build success is not proof that numbering, current-space detection, or switching behavior is correct.
- When a fix depends on live macOS state, verify the raw runtime outputs first before describing it as fixed.

### Spaces and Mission Control
- Do not guess the user's Spaces model from a simplifying assumption like "only one active display means only Main monitor spaces matter."
- The source of truth is the user's current Mission Control / `com.apple.spaces` state.
- For Spaces bugs, inspect and compare these before patching behavior:
  - raw `defaults read com.apple.spaces`
  - native bridge `spaces.list`
  - native bridge `spaces.current`
- Do not hardcode or talk in terms like "restore 9 spaces." The correct target is always the current live desktop count and ordering shown by Mission Control.
- Fix the mapping bug directly. Do not collapse, flatten, or discard monitor groups unless the raw macOS data proves that is correct.
- Before changing space-numbering logic, prove how the current space id maps into the ordered list returned by the bridge.

### Debugging discipline
- Do not patch the wrong layer before proving the cause.
- If the bug is in native bridge runtime data, do not start by changing renderer state or UX copy.
- If the bug is in renderer selection/highlighting, do not change native bridge logic until the renderer mapping is verified.
- State clearly what was actually verified. Do not imply end-to-end correctness from partial checks.

### User trust
- Do not use soft excuses like "iteration pressure." That is not a real explanation.
- If a mistake came from an unjustified assumption, say that directly.
- When the user says a fix did not work, treat that as more important than what the code was intended to do.


## CLI Tools Over MCP

- When CLI-based tools (e.g., playwright-cli skills) are available in the project, prefer using them over MCP-based equivalents. CLI tools run locally, are faster, more reliable, and do not depend on external MCP server availability.

## Screenshot Strategy — NEVER cycle through spaces

- **Do NOT capture screenshots by switching to each space in sequence.** This is terrible UX: the user's desktop flickers through every space, the Winzen window disappears for seconds, and it looks completely broken.
- This rule is permanent and non-negotiable. Do not re-introduce cycling under any name (`captureAllDesktopScreenshots`, `captureAllSpaceScreenshots`, `scheduleAutoCapture`, or any equivalent).
- The only valid screenshot capture approaches are:
  1. Capture the **current space** when the Winzen window is already hidden (e.g., after the user switches spaces and before Winzen shows again) — one screenshot per switch, naturally accumulated.
  2. Use a native macOS API that can read WindowServer thumbnails without switching spaces.
- Spaces must always be shown in the list even if they have no screenshot (show a placeholder/gradient).

## Port Assignment for Winzen Dev

- Vite renderer dev server: **port 30234** (hardcoded in `desktop-app-electrobun/vite.config.ts`).
- Electrobun internal WebSocket RPC server: starts at **50000** (hardcoded in electrobun package, not configurable).
- Do NOT kill processes by port number — you will kill unrelated apps. If a port conflict arises, identify the Winzen-specific PID first.

404: Not Found