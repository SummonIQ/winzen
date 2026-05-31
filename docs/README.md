# Winzen Planning Docs

This directory contains implementation planning documents for the next stage of Winzen.

## Feature Documents

- `FEATURE_SAVED_LAYOUTS_AND_WORKSPACE_RESTORE.md`
- `FEATURE_SMART_RULE_ENGINE.md`
- `FEATURE_MENU_BAR_AND_BACKGROUND_MODE.md`
- `FEATURE_MONITOR_AWARE_SPACES.md`
- `FEATURE_RECENT_CONTEXT_AND_HISTORY.md`
- `FEATURE_BACKUP_IMPORT_EXPORT_AND_CLOUD_BACKUP.md`
- `FEATURE_SESSION_RESTORE_ON_LOGIN.md`
- `FEATURE_AUTOMATION_AND_INTEGRATIONS.md`

## Platform / Monetization Documents

- `IMPLEMENTATION_AUTHENTICATION.md`
- `IMPLEMENTATION_SUBSCRIPTIONS_AND_STRIPE.md`
- `IMPLEMENTATION_MARKETING_SITE_PATTERN.md`
- `IMPLEMENTATION_TAURI_PORT_DECISION.md`
- `IMPLEMENTATION_NATIVE_BRIDGE_AND_TAURI_MIGRATION.md`

## Suggested Build Order

1. Authentication
2. Subscriptions and entitlements
3. Marketing site pattern updates
4. Saved layouts and workspace restore
5. Smart rule engine
6. Session restore on login
7. Backup, import/export, and cloud backup
8. Monitor-aware Spaces
9. Recent context and history
10. Menu bar and background mode upgrades
11. Automation and integrations

## Notes

- Authentication is intentionally separated from subscription management.
- Subscription entitlements depend on authenticated users.
- The desktop app should be able to sign users in and fetch entitlements without embedding billing logic directly in Electron.
- The implementation patterns described in the platform documents are based on the structure used in `~/Projects/maczen`, adapted for Winzen's architecture and product direction.
