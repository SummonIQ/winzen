# Backup, Import/Export, And Cloud Backup

## Why This Feature Matters

As Winzen accumulates more user configuration, users need to trust that their setup is durable. Backups are also a strong monetization bridge because local export is expected, but cloud backup and cross-device restore are premium-value features.

This document covers:

- local backup
- local import/export
- cloud backup
- sync-adjacent restore flows

## Product Goals

- make user configuration portable
- protect users from data loss
- support migration to a new Mac
- prepare for authenticated cloud sync

## What Must Be Backed Up

- Space names
- screenshots metadata and preferences
- saved layouts
- rules
- containers/groups
- user settings
- keyboard customizations
- onboarding/setup state
- future monitor mappings

Do not back up large binary screenshots by default unless explicitly needed. Prefer metadata and references first.

## Backup Modes

### Local Export

- export all settings to a file
- import from that file
- manual user action

### Automatic Local Backup

- periodic backup to app data directory
- rolling backup retention

### Cloud Backup

- encrypted user config snapshot uploaded to backend
- restore after sign-in on another machine
- optional automatic backup after meaningful changes

## UX Requirements

### Settings Screen

- Export configuration
- Import configuration
- Create backup now
- Restore from backup
- Enable cloud backup
- Show last successful backup time

### Backup Preview

Before restore/import show:

- what is included
- backup date
- app version
- conflicts

### Conflict Strategy

Options:

- merge
- replace local
- replace cloud

## Data Model

### BackupManifest

- `version`
- `createdAt`
- `appVersion`
- `platform`
- `includedSections`
- `checksum`

### BackupPayload

- `settings`
- `spaceNames`
- `layouts`
- `rules`
- `containers`
- `shortcuts`
- `displayProfiles`

### CloudBackupRecord

- `id`
- `userId`
- `createdAt`
- `updatedAt`
- `payloadVersion`
- `encryptedBlobPath`
- `checksum`
- `sizeBytes`

## File Format

Recommended:

- JSON payload
- compressed archive if size grows
- versioned schema

Suggested extension:

- `.winzen-backup`

## Security Requirements

### Local Export

- clear user warning if export contains sensitive workspace metadata
- optional password-protected export later

### Cloud Backup

- authenticated users only
- encrypt at rest
- ideally client-side encryption for sensitive payloads
- signed API routes
- scoped restore to authenticated owner only

## Architecture

### Desktop App

Services:

- `backupSerializer`
- `backupImporter`
- `backupScheduler`
- `cloudBackupClient`

### Marketing Site / Backend

Add authenticated API routes:

- `GET /api/account/backups`
- `POST /api/account/backups`
- `GET /api/account/backups/:id`
- `POST /api/account/backups/restore`
- `DELETE /api/account/backups/:id`

These should follow the same account/auth pattern as the MacZen-style account routes:

- authenticated session lookup
- CORS for desktop client origin
- structured JSON payloads

## Import Strategy

### Replace Mode

- wipe local config sections and restore from backup

### Merge Mode

- keep existing settings where there is no collision
- rename colliding layouts/rules
- preserve local device-specific values like current display IDs where possible

## Cloud Backup Requirements

### Minimum Viable Cloud Backup

- one latest backup per user
- manual upload
- manual restore

### Better Version

- rolling backup history
- auto-upload after meaningful changes
- restore preview with diff summary

### Plus Tier Version

- multiple backup snapshots
- device-aware restore suggestions
- shared team backup templates

## Monetization

### Free

- local export/import
- one manual local backup

### Pro

- automatic local backups
- richer import/merge tools

### Plus

- cloud backup
- backup history
- restore to another Mac

## Technical Risks

- importing stale schemas
- overwriting working configs
- backing up machine-specific identifiers that do not transfer

## Safeguards

- versioned manifests
- restore preview
- pre-restore automatic safety backup
- migration steps between schema versions

## Testing

- export/import round trip
- restore after app reinstall
- restore to different machine
- merge conflict handling
- corrupted backup file
- auth failure for cloud backup

## Rollout Plan

### Phase 1

- local export/import
- versioned backup format

### Phase 2

- auto local backups
- restore preview

### Phase 3

- cloud backup routes
- authenticated upload/restore
- background backup scheduling
