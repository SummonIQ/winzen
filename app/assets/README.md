# Winzen App Icons

This directory contains the app icons for Winzen.

## Files

- **icon.svg** - Source SVG file for the app icon
- **icon.icns** - Generated macOS icon file (auto-generated, do not edit)

## Icon Design

The current icon is a temporary design featuring:

- Modern gradient background (indigo to purple)
- Three overlapping macOS-style windows representing window management
- "⌘ D" shortcut indicator at the bottom
- Clean, modern aesthetic matching macOS design language

## Regenerating Icons

If you modify `icon.svg`, regenerate the `.icns` file by running:

```bash
bun run generate-icons
```

This will:

1. Convert the SVG to PNG files at multiple sizes (16x16 to 1024x1024)
2. Generate @2x Retina versions
3. Create the `.icns` file using macOS `iconutil`
4. Clean up temporary files

## Customizing the Icon

To create a custom icon:

1. Edit `icon.svg` with your design
2. Run `bun run generate-icons` to regenerate the `.icns` file
3. Rebuild the app with `bun run package` or `bun run make`

The icon will appear in:

- macOS menu bar
- macOS dock
- App switcher (Cmd+Tab)
- Finder

## Requirements

- macOS (for `iconutil` command)
- sharp npm package (installed as dev dependency)
