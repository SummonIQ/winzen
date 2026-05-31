import Foundation
import AppKit
import CoreGraphics

enum ScreenshotCommands {
    static func captureCurrent() throws -> BridgeScreenshot? {
        guard let image = captureMainDisplayImage() else {
            throw BridgeError.captureFailed("Unable to capture main display image")
        }

        let fileURL = try writeImageToTemporaryPNG(
            image,
            prefix: "winzen-bridge-current"
        )

        return BridgeScreenshot(
            path: fileURL.path,
            mimeType: "image/png",
            width: Int(image.width),
            height: Int(image.height)
        )
    }

    static func captureAllSpaces() throws -> [BridgeSpaceScreenshot] {
        let spaces = SpacesCommands.list()
        guard !spaces.isEmpty else { return [] }

        // Get all windows from all spaces using Accessibility APIs + CGWindowList.
        // This does NOT require switching spaces — the Accessibility API queries
        // each app process directly, returning windows from any space.
        let allWindowMetadata = listWindowMetadataAcrossAllSpaces()
        let allWindowIds = Array(allWindowMetadata.keys)

        // Map each window to the space(s) it lives on via CGSCopySpacesForWindows.
        // This private CGS API works from any thread without switching spaces.
        let windowsBySpace = mapWindowsToSpaces(windowIds: allWindowIds)

        let displayID = CGMainDisplayID()
        let displayWidth = CGDisplayPixelsWide(displayID)
        let displayHeight = CGDisplayPixelsHigh(displayID)

        var screenshots: [BridgeSpaceScreenshot] = []

        for space in spaces {
            let windowIds = windowsBySpace[space.id] ?? []

            // compositeSpace renders a wallpaper + per-window captures.
            // CGWindowListCreateImage(optionIncludingWindow) reads each window's
            // backing buffer in the WindowServer — these buffers persist for
            // all spaces, so this works without switching to the space.
            guard let image = compositeSpace(
                monitorIndex: space.monitorIndex,
                windowIds: windowIds,
                windowMetadata: allWindowMetadata,
                canvasWidth: displayWidth,
                canvasHeight: displayHeight
            ) else { continue }

            let fileURL = try writeImageToTemporaryPNG(
                image,
                prefix: "winzen-bridge-space-\(space.id)"
            )
            screenshots.append(BridgeSpaceScreenshot(
                spaceId: space.id,
                path: fileURL.path,
                mimeType: "image/png",
                width: displayWidth,
                height: displayHeight
            ))
        }

        if screenshots.isEmpty {
            throw BridgeError.captureFailed("Unable to composite any space screenshots")
        }

        return screenshots
    }
}

private extension ScreenshotCommands {
    struct WindowMetadata {
        let bounds: CGRect
        let owner: String
    }

    static let skippedOwners: Set<String> = [
        "WindowManager",
        "Window Server",
        "Dock",
        "SystemUIServer",
        "Control Center",
        "CursorUIViewService",
        "AutoFill",
        "Open and Save Panel Service",
        "Spotlight",
        "Winzen",
        "Notification Center",
        "Screenshot"
    ]

    typealias CGSMainConnectionIDFunction = @convention(c) () -> UInt32
    typealias CGSCopySpacesForWindowsFunction = @convention(c) (
        UInt32,
        UInt32,
        CFArray
    ) -> Unmanaged<CFArray>?

    static func captureMainDisplayImage() -> CGImage? {
        CGDisplayCreateImage(CGMainDisplayID())
    }

    static func writeImageToTemporaryPNG(
        _ image: CGImage,
        prefix: String
    ) throws -> URL {
        let bitmap = NSBitmapImageRep(cgImage: image)
        guard let pngData = bitmap.representation(using: .png, properties: [:]) else {
            throw BridgeError.captureFailed("Unable to encode screenshot as PNG")
        }

        let fileName = "\(prefix)-\(UUID().uuidString).png"
        let fileURL = FileManager.default.temporaryDirectory.appendingPathComponent(fileName)

        do {
            try pngData.write(to: fileURL, options: .atomic)
            return fileURL
        } catch {
            throw BridgeError.captureFailed(error.localizedDescription)
        }
    }

    static func listWindowMetadata() -> [CGWindowID: WindowMetadata] {
        guard let windowList = CGWindowListCopyWindowInfo([.optionAll], kCGNullWindowID)
                as? [[String: Any]]
        else {
            return [:]
        }

        var metadata: [CGWindowID: WindowMetadata] = [:]

        for window in windowList {
            let layer = intValue(window[kCGWindowLayer as String])
            let owner = (window[kCGWindowOwnerName as String] as? String) ?? ""
            let windowId = CGWindowID(intValue(window[kCGWindowNumber as String]))
            let bounds = rectValue(window[kCGWindowBounds as String])

            guard layer == 0,
                  windowId != 0,
                  bounds.width >= 50,
                  bounds.height >= 50,
                  !skippedOwners.contains(owner)
            else {
                continue
            }

            metadata[windowId] = WindowMetadata(bounds: bounds, owner: owner)
        }

        return metadata
    }

    // CGWindowListCopyWindowInfo([.optionAll]) only returns windows from the
    // current and recently-active spaces on modern macOS — inactive space windows
    // are not exposed through that API. This method augments the result by querying
    // each running application via Accessibility APIs, which return windows from
    // ALL spaces since they query the process directly rather than the compositor.
    static func listWindowMetadataAcrossAllSpaces() -> [CGWindowID: WindowMetadata] {
        var metadata = listWindowMetadata()

        guard AXIsProcessTrusted() else {
            return metadata
        }

        for app in NSWorkspace.shared.runningApplications {
            guard app.activationPolicy == .regular else { continue }
            let appName = app.localizedName ?? ""
            guard !skippedOwners.contains(appName) else { continue }

            let axApp = AXUIElementCreateApplication(app.processIdentifier)
            var windowsRef: CFTypeRef?
            guard AXUIElementCopyAttributeValue(axApp, kAXWindowsAttribute as CFString, &windowsRef) == .success,
                  let axWindows = windowsRef as? [AXUIElement]
            else { continue }

            for axWindow in axWindows {
                // _AXWindowID is the CGWindowID — private but stable across macOS versions
                var windowIDRef: CFTypeRef?
                guard AXUIElementCopyAttributeValue(axWindow, "_AXWindowID" as CFString, &windowIDRef) == .success,
                      let windowIDNum = windowIDRef as? NSNumber
                else { continue }

                let windowID = CGWindowID(windowIDNum.uint32Value)
                guard metadata[windowID] == nil else { continue }

                var posRef: CFTypeRef?
                var sizeRef: CFTypeRef?
                AXUIElementCopyAttributeValue(axWindow, kAXPositionAttribute as CFString, &posRef)
                AXUIElementCopyAttributeValue(axWindow, kAXSizeAttribute as CFString, &sizeRef)

                var position = CGPoint.zero
                var size = CGSize.zero

                if let posVal = posRef, CFGetTypeID(posVal) == AXValueGetTypeID() {
                    AXValueGetValue(posVal as! AXValue, .cgPoint, &position)
                }
                if let sizeVal = sizeRef, CFGetTypeID(sizeVal) == AXValueGetTypeID() {
                    AXValueGetValue(sizeVal as! AXValue, .cgSize, &size)
                }

                guard size.width >= 50, size.height >= 50 else { continue }

                metadata[windowID] = WindowMetadata(
                    bounds: CGRect(origin: position, size: size),
                    owner: appName
                )
            }
        }

        return metadata
    }

    static func mapWindowsToSpaces(windowIds: [CGWindowID]) -> [String: [CGWindowID]] {
        guard let handle = dlopen(
            "/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics",
            RTLD_LAZY
        ) else {
            return [:]
        }
        defer { dlclose(handle) }

        guard let mainConnectionSymbol = dlsym(handle, "CGSMainConnectionID"),
              let copySpacesSymbol = dlsym(handle, "CGSCopySpacesForWindows")
        else {
            return [:]
        }

        let mainConnection = unsafeBitCast(
            mainConnectionSymbol,
            to: CGSMainConnectionIDFunction.self
        )
        let copySpaces = unsafeBitCast(
            copySpacesSymbol,
            to: CGSCopySpacesForWindowsFunction.self
        )

        let connectionId = mainConnection()
        var result: [String: [CGWindowID]] = [:]

        for windowId in windowIds {
            let cfWindowIds: CFArray = [NSNumber(value: windowId)] as CFArray
            guard let spacesRef = copySpaces(connectionId, 0x7, cfWindowIds) else {
                continue
            }

            let spaceIds = spacesRef.takeRetainedValue() as NSArray
            for rawSpaceId in spaceIds {
                let spaceId = stringValue(rawSpaceId)
                guard !spaceId.isEmpty else {
                    continue
                }

                result[spaceId, default: []].append(windowId)
            }
        }

        return result
    }

    static func compositeSpace(
        monitorIndex: Int,
        windowIds: [CGWindowID],
        windowMetadata: [CGWindowID: WindowMetadata],
        canvasWidth: Int,
        canvasHeight: Int
    ) -> CGImage? {
        guard let colorSpace = CGColorSpace(name: CGColorSpace.sRGB),
              let context = CGContext(
                data: nil,
                width: canvasWidth,
                height: canvasHeight,
                bitsPerComponent: 8,
                bytesPerRow: canvasWidth * 4,
                space: colorSpace,
                bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue
              )
        else {
            return nil
        }

        let canvasRect = CGRect(x: 0, y: 0, width: canvasWidth, height: canvasHeight)
        if let wallpaper = wallpaperImage(
            monitorIndex: monitorIndex,
            canvasWidth: canvasWidth,
            canvasHeight: canvasHeight
        ) {
            context.draw(wallpaper, in: canvasRect)
        } else {
            context.setFillColor(red: 0.1, green: 0.1, blue: 0.12, alpha: 1)
            context.fill(canvasRect)
        }

        for windowId in windowIds.reversed() {
            guard let metadata = windowMetadata[windowId],
                  let image = CGWindowListCreateImage(
                    .null,
                    .optionIncludingWindow,
                    windowId,
                    [.boundsIgnoreFraming, .nominalResolution]
                  )
            else {
                continue
            }

            let drawRect = CGRect(
                x: metadata.bounds.origin.x,
                y: CGFloat(canvasHeight) - metadata.bounds.origin.y - metadata.bounds.height,
                width: metadata.bounds.width > 0 ? metadata.bounds.width : CGFloat(image.width),
                height: metadata.bounds.height > 0 ? metadata.bounds.height : CGFloat(image.height)
            )

            context.draw(image, in: drawRect)
        }

        return context.makeImage()
    }

    static func wallpaperImage(
        monitorIndex: Int,
        canvasWidth: Int,
        canvasHeight: Int
    ) -> CGImage? {
        let screens = NSScreen.screens
            .sorted { lhs, rhs in
                let lhsFrame = lhs.frame
                let rhsFrame = rhs.frame

                if lhsFrame.minX == rhsFrame.minX {
                    return lhsFrame.minY < rhsFrame.minY
                }

                return lhsFrame.minX < rhsFrame.minX
            }

        guard monitorIndex >= 0, monitorIndex < screens.count else {
            return nil
        }

        let screen = screens[monitorIndex]
        let workspace = NSWorkspace.shared
        let desktopOptions = workspace.desktopImageOptions(for: screen) ?? [:]
        let fillColor =
            (desktopOptions[NSWorkspace.DesktopImageOptionKey.fillColor] as? NSColor)
            ?? NSColor.black
        let imageURL = workspace.desktopImageURL(for: screen)
        let useFillOnly = shouldPreferFillColor(fillColor: fillColor, imageURL: imageURL)
        let image = useFillOnly ? nil : imageURL.flatMap { NSImage(contentsOf: $0) }

        let targetSize = NSSize(width: canvasWidth, height: canvasHeight)
        let rendered = NSImage(size: targetSize)

        rendered.lockFocus()
        fillColor.setFill()
        NSBezierPath(rect: NSRect(origin: .zero, size: targetSize)).fill()
        image?.draw(
            in: NSRect(origin: .zero, size: targetSize),
            from: .zero,
            operation: .copy,
            fraction: 1.0
        )
        rendered.unlockFocus()

        return rendered.cgImage(
            forProposedRect: nil,
            context: nil,
            hints: nil
        )
    }

    static func shouldPreferFillColor(fillColor: NSColor, imageURL: URL?) -> Bool {
        if let path = imageURL?.path, path.contains("/Desktop Pictures/Solid Colors/") {
            return false
        }

        guard let rgbColor = fillColor.usingColorSpace(.deviceRGB) else {
            return false
        }

        let brightness = (rgbColor.redComponent + rgbColor.greenComponent + rgbColor.blueComponent) / 3.0
        return brightness <= 0.05
    }

    static func rectValue(_ raw: Any?) -> CGRect {
        guard let dictionary = raw as? [String: Any] else {
            return .zero
        }

        return CGRect(
            x: doubleValue(dictionary["X"]),
            y: doubleValue(dictionary["Y"]),
            width: doubleValue(dictionary["Width"]),
            height: doubleValue(dictionary["Height"])
        )
    }

    static func intValue(_ raw: Any?) -> Int {
        if let value = raw as? Int {
            return value
        }

        if let value = raw as? NSNumber {
            return value.intValue
        }

        if let value = raw as? String, let parsed = Int(value) {
            return parsed
        }

        if let value = raw as? NSString {
            return value.integerValue
        }

        return 0
    }

    static func doubleValue(_ raw: Any?) -> Double {
        if let value = raw as? Double {
            return value
        }

        if let value = raw as? NSNumber {
            return value.doubleValue
        }

        if let value = raw as? String, let parsed = Double(value) {
            return parsed
        }

        if let value = raw as? NSString {
            return value.doubleValue
        }

        return 0
    }

    static func stringValue(_ raw: Any?) -> String {
        if let value = raw as? String {
            return value
        }

        if let value = raw as? NSNumber {
            return value.stringValue
        }

        return ""
    }
}
