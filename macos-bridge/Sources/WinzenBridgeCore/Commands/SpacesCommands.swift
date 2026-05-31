import Foundation
import CoreGraphics

enum SpacesCommands {
    static func list() -> [BridgeSpace] {
        guard let root = loadSpacesRoot(),
              let monitors = loadMonitors(from: root)
        else {
            return []
        }

        let spaceOrder = loadSpaceOrder(from: root)

        let activeDisplayCount = activeDisplayCount()

        let monitorsWithSpaces = monitors
            .filter { monitor in
                guard let spaces = monitor["Spaces"] as? [[String: Any]] else {
                    return false
                }
                return !spaces.isEmpty
            }
            .sorted { lhs, rhs in
                let lhsId = stringValue(in: lhs, keys: ["Display Identifier", "DisplayIdentifier"]) ?? ""
                let rhsId = stringValue(in: rhs, keys: ["Display Identifier", "DisplayIdentifier"]) ?? ""

                if lhsId == "Main" && rhsId != "Main" {
                    return true
                }

                if rhsId == "Main" && lhsId != "Main" {
                    return false
                }

                return lhsId.localizedCompare(rhsId) == .orderedAscending
            }

        if monitorsWithSpaces.isEmpty, let firstMonitor = monitors.first {
            return buildSpaces(from: [firstMonitor], spaceOrder: spaceOrder)
        }

        if activeDisplayCount <= 1 {
            return buildFlattenedSingleDisplaySpaces(
                from: monitorsWithSpaces,
                spaceOrder: spaceOrder
            )
        }

        return buildSpaces(from: monitorsWithSpaces, spaceOrder: spaceOrder)
    }
}

extension SpacesCommands {
    static func buildFlattenedSingleDisplaySpaces(
        from monitors: [[String: Any]],
        spaceOrder: [String: Int]
    ) -> [BridgeSpace] {
        var seen = Set<String>()

        return monitors
            .flatMap { orderedSpaces(($0["Spaces"] as? [[String: Any]]) ?? [], spaceOrder: spaceOrder) }
            .compactMap { space in
            guard let id = identifierValue(
                in: space,
                keys: ["ManagedSpaceID", "managedSpaceID", "id64", "id"]
            ) else {
                return nil
            }

            if seen.contains(id) {
                return nil
            }

            seen.insert(id)
            let number = seen.count

            return BridgeSpace(
                id: id,
                number: number,
                monitorId: "Main",
                monitorName: "Main Display",
                monitorIndex: 0,
                monitorSpaceNumber: number
            )
        }
    }

    static func buildSpaces(
        from monitors: [[String: Any]],
        spaceOrder: [String: Int]
    ) -> [BridgeSpace] {
        var seen = Set<String>()
        var result: [BridgeSpace] = []
        var globalNumber = 1

        for (monitorIndex, monitor) in monitors.enumerated() {
            guard let monitorSpaces = monitor["Spaces"] as? [[String: Any]] else {
                continue
            }
            let rawSpaces = orderedSpaces(monitorSpaces, spaceOrder: spaceOrder)

            let rawMonitorId =
                stringValue(in: monitor, keys: ["Display Identifier", "DisplayIdentifier"])
                ?? "display-\(monitorIndex + 1)"
            let monitorName = rawMonitorId == "Main"
                ? "Main Display"
                : "Display \(monitorIndex + 1)"

            var monitorSpaceNumber = 1

            for space in rawSpaces {
                guard let id = identifierValue(
                    in: space,
                    keys: ["ManagedSpaceID", "managedSpaceID", "id64", "id"]
                ) else {
                    continue
                }

                if seen.contains(id) {
                    continue
                }

                seen.insert(id)
                result.append(
                    BridgeSpace(
                        id: id,
                        number: globalNumber,
                        monitorId: rawMonitorId,
                        monitorName: monitorName,
                        monitorIndex: monitorIndex,
                        monitorSpaceNumber: monitorSpaceNumber
                    )
                )
                globalNumber += 1
                monitorSpaceNumber += 1
            }
        }

        return result
    }

    static func current() -> String? {
        guard let monitors = loadMonitors() else {
            return currentVisibleSpaceId()
        }

        if activeDisplayCount() <= 1 {
            for monitor in monitors {
                guard let currentSpace = dictionaryValue(
                    in: monitor,
                    keys: ["Current Space", "CurrentSpace"]
                ) else {
                    continue
                }

                if let id = identifierValue(
                    in: currentSpace,
                    keys: ["ManagedSpaceID", "managedSpaceID", "id64", "id"]
                ) {
                    return id
                }
            }
        }

        for monitor in monitors {
            let displayId = stringValue(in: monitor, keys: ["Display Identifier", "DisplayIdentifier"]) ?? ""
            if displayId == "Main" || monitors.count == 1 {
                guard let currentSpace = dictionaryValue(
                    in: monitor,
                    keys: ["Current Space", "CurrentSpace"]
                ) else {
                    continue
                }

                if let id = identifierValue(
                    in: currentSpace,
                    keys: ["ManagedSpaceID", "managedSpaceID", "id64", "id"]
                ) {
                    return id
                }
            }
        }

        return currentVisibleSpaceId()
    }

    static func `switch`(spaceId: String) throws -> Bool {
        let resolvedSpaceNumber = try shortcutNumber(for: spaceId)

        if let keyCode = numberKeyCodes[resolvedSpaceNumber] {
            try sendKeyboardShortcut(keyCode: keyCode, modifiers: 262_144)
            return true
        }

        if let shortcut = shortcutForSpace(resolvedSpaceNumber) {
            try sendKeyboardShortcut(keyCode: shortcut.keyCode, modifiers: shortcut.modifiers)
            return true
        }

        throw BridgeError.notImplemented("spaces.switch[\(resolvedSpaceNumber)]")
    }

    static func shortcutNumber(for spaceId: String) throws -> Int {
        for space in list() {
            if space.id == spaceId {
                return space.number
            }
        }

        throw BridgeError.invalidPayload("spaceId")
    }

    static func sendKeyboardShortcut(keyCode: Int, modifiers: Int) throws {
        let flags = cgEventFlags(for: modifiers)

        guard let keyDown = CGEvent(
            keyboardEventSource: nil,
            virtualKey: CGKeyCode(keyCode),
            keyDown: true
        ) else {
            throw BridgeError.appleScriptFailed("Failed to create key down event")
        }

        guard let keyUp = CGEvent(
            keyboardEventSource: nil,
            virtualKey: CGKeyCode(keyCode),
            keyDown: false
        ) else {
            throw BridgeError.appleScriptFailed("Failed to create key up event")
        }

        keyDown.flags = flags
        keyUp.flags = flags

        keyDown.post(tap: .cghidEventTap)
        usleep(12_000)
        keyUp.post(tap: .cghidEventTap)
    }
    static let numberKeyCodes: [Int: Int] = [
        1: 18,
        2: 19,
        3: 20,
        4: 21,
        5: 23,
        6: 22,
        7: 26,
        8: 28,
        9: 25,
        10: 29
    ]

    static func loadMonitors() -> [[String: Any]]? {
        if let liveMonitors = loadLiveManagedDisplaySpaces(), !liveMonitors.isEmpty {
            return liveMonitors
        }

        guard let root = loadSpacesRoot() else {
            return nil
        }

        return loadMonitors(from: root)
    }

    static func loadMonitors(from root: [String: Any]) -> [[String: Any]]? {
        let spacesConfig = dictionaryValue(in: root, keys: ["SpacesDisplayConfiguration"])

        let managementData = spacesConfig.flatMap { config in
            dictionaryValue(in: config, keys: ["Management Data", "ManagementData"])
        }

        return managementData?["Monitors"] as? [[String: Any]]
    }

    static func loadLiveManagedDisplaySpaces() -> [[String: Any]]? {
        guard let handle = dlopen(
            "/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics",
            RTLD_LAZY
        ) else {
            return nil
        }
        defer { dlclose(handle) }

        guard let mainConnectionSymbol = dlsym(handle, "CGSMainConnectionID"),
              let copyManagedSpacesSymbol = dlsym(handle, "CGSCopyManagedDisplaySpaces")
        else {
            return nil
        }

        typealias CGSCopyManagedDisplaySpacesFunction = @convention(c) (UInt32) -> Unmanaged<CFArray>?

        let mainConnection = unsafeBitCast(
            mainConnectionSymbol,
            to: CGSMainConnectionIDFunction.self
        )
        let copyManagedDisplaySpaces = unsafeBitCast(
            copyManagedSpacesSymbol,
            to: CGSCopyManagedDisplaySpacesFunction.self
        )

        let connectionId = mainConnection()
        guard let managedSpaces = copyManagedDisplaySpaces(connectionId)?
            .takeRetainedValue() as? [[String: Any]]
        else {
            return nil
        }

        return managedSpaces
    }

    static func loadSpaceOrder(from root: [String: Any]) -> [String: Int] {
        let spacesConfig = dictionaryValue(in: root, keys: ["SpacesDisplayConfiguration"])
        guard let properties = spacesConfig?["Space Properties"] as? [[String: Any]] else {
            return [:]
        }

        var order: [String: Int] = [:]

        for (index, property) in properties.enumerated() {
            if let uuid = stringValue(in: property, keys: ["name"]), !uuid.isEmpty {
                order[uuid.uppercased()] = index
            }
        }

        return order
    }

    static func orderedSpaces(
        _ spaces: [[String: Any]],
        spaceOrder: [String: Int]
    ) -> [[String: Any]] {
        spaces.sorted { lhs, rhs in
            let lhsOrder = sortOrder(for: lhs, spaceOrder: spaceOrder)
            let rhsOrder = sortOrder(for: rhs, spaceOrder: spaceOrder)

            if lhsOrder == rhsOrder {
                let lhsId = identifierValue(
                    in: lhs,
                    keys: ["ManagedSpaceID", "managedSpaceID", "id64", "id"]
                ) ?? ""
                let rhsId = identifierValue(
                    in: rhs,
                    keys: ["ManagedSpaceID", "managedSpaceID", "id64", "id"]
                ) ?? ""
                return lhsId.localizedCompare(rhsId) == .orderedAscending
            }

            return lhsOrder < rhsOrder
        }
    }

    static func sortOrder(for space: [String: Any], spaceOrder: [String: Int]) -> Int {
        if let uuid = stringValue(in: space, keys: ["uuid"]),
           let order = spaceOrder[uuid.uppercased()] {
            return order
        }

        return Int.max
    }

    static func loadSpacesRoot() -> [String: Any]? {
        guard let data = exportSpacesPreferences(),
              let plist = try? PropertyListSerialization.propertyList(
                from: data,
                options: [],
                format: nil
              ),
              let root = plist as? [String: Any]
        else {
            return nil
        }

        return root
    }

    static func activeDisplayCount() -> Int {
        var displayCount: UInt32 = 0
        guard CGGetActiveDisplayList(0, nil, &displayCount) == .success else {
            return 0
        }
        return Int(displayCount)
    }

    static func exportSpacesPreferences() -> Data? {
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/usr/bin/defaults")
        process.arguments = ["export", "com.apple.spaces", "-"]

        let stdout = Pipe()
        let stderr = Pipe()
        process.standardOutput = stdout
        process.standardError = stderr

        do {
            try process.run()
            process.waitUntilExit()

            guard process.terminationStatus == 0 else {
                return nil
            }

            return stdout.fileHandleForReading.readDataToEndOfFile()
        } catch {
            return nil
        }
    }

    typealias CGSMainConnectionIDFunction = @convention(c) () -> UInt32
    typealias CGSCopySpacesForWindowsFunction = @convention(c) (
        UInt32,
        UInt32,
        CFArray
    ) -> Unmanaged<CFArray>?

    static func currentVisibleSpaceId() -> String? {
        guard let windowList = CGWindowListCopyWindowInfo([.optionOnScreenOnly], kCGNullWindowID)
                as? [[String: Any]]
        else {
            return nil
        }

        let windowIds: [CGWindowID] = windowList.compactMap { window in
            let layer = intValue(window[kCGWindowLayer as String])
            let windowId = cgWindowIdValue(window[kCGWindowNumber as String])
            let bounds = rectValue(window[kCGWindowBounds as String])
            let owner = stringValue(window[kCGWindowOwnerName as String])

            guard layer == 0,
                  windowId != 0,
                  bounds.width >= 50,
                  bounds.height >= 50,
                  !owner.isEmpty
            else {
                return nil
            }

            return windowId
        }

        guard !windowIds.isEmpty else {
            return nil
        }

        let spaceWindowMap = mapWindowsToSpaces(windowIds: windowIds)
        return spaceWindowMap.max { lhs, rhs in
            lhs.value.count < rhs.value.count
        }?.key
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

    static func cgWindowIdValue(_ raw: Any?) -> CGWindowID {
        if let value = raw as? CGWindowID {
            return value
        }

        if let value = raw as? NSNumber {
            return CGWindowID(value.uint32Value)
        }

        if let value = raw as? UInt32 {
            return CGWindowID(value)
        }

        if let value = raw as? Int {
            return CGWindowID(value)
        }

        return 0
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

        return 0
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

        return 0
    }

    static func stringValue(_ raw: Any?) -> String {
        if let value = raw as? String {
            return value
        }

        if let value = raw as? NSString {
            return value as String
        }

        if let value = raw as? NSNumber {
            return value.stringValue
        }

        return ""
    }

    static func runAppleScript(_ script: String) throws {
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/usr/bin/osascript")
        process.arguments = ["-e", script]

        let stderr = Pipe()
        process.standardError = stderr

        do {
            try process.run()
            process.waitUntilExit()

            guard process.terminationStatus == 0 else {
                let message = String(
                    data: stderr.fileHandleForReading.readDataToEndOfFile(),
                    encoding: .utf8
                )?.trimmingCharacters(in: .whitespacesAndNewlines)
                throw BridgeError.appleScriptFailed(message ?? "osascript failed")
            }
        } catch let error as BridgeError {
            throw error
        } catch {
            throw BridgeError.appleScriptFailed(error.localizedDescription)
        }
    }

    static func shortcutForSpace(_ spaceNumber: Int) -> (keyCode: Int, modifiers: Int)? {
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/usr/bin/defaults")
        process.arguments = ["read", "com.apple.symbolichotkeys.plist", "AppleSymbolicHotKeys"]

        let stdout = Pipe()
        process.standardOutput = stdout

        do {
            try process.run()
            process.waitUntilExit()

            guard process.terminationStatus == 0,
                  let output = String(
                    data: stdout.fileHandleForReading.readDataToEndOfFile(),
                    encoding: .utf8
                  )
            else {
                return nil
            }

            let plistKey = 117 + spaceNumber
            let pattern =
                "\(plistKey)\\s*=\\s*\\{[^}]*parameters\\s*=\\s*\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\s*\\)"
            let regex = try NSRegularExpression(
                pattern: pattern,
                options: [.dotMatchesLineSeparators]
            )
            let range = NSRange(output.startIndex..<output.endIndex, in: output)

            guard let match = regex.firstMatch(in: output, options: [], range: range),
                  let keyCodeRange = Range(match.range(at: 2), in: output),
                  let modifiersRange = Range(match.range(at: 3), in: output),
                  let keyCode = Int(output[keyCodeRange]),
                  let modifiers = Int(output[modifiersRange])
            else {
                return nil
            }

            return (keyCode: keyCode, modifiers: modifiers)
        } catch {
            return nil
        }
    }

    static func cgEventFlags(for flags: Int) -> CGEventFlags {
        var eventFlags: CGEventFlags = []

        if flags & 262_144 != 0 {
            eventFlags.insert(.maskControl)
        }

        if flags & 524_288 != 0 {
            eventFlags.insert(.maskAlternate)
        }

        if flags & 131_072 != 0 {
            eventFlags.insert(.maskShift)
        }

        if flags & 1_048_576 != 0 {
            eventFlags.insert(.maskCommand)
        }

        return eventFlags
    }

    static func stringValue(
        in dictionary: [String: Any],
        keys: [String]
    ) -> String? {
        for key in keys {
            if let value = dictionary[key] as? String, !value.isEmpty {
                return value
            }
        }

        return nil
    }

    static func dictionaryValue(
        in dictionary: [String: Any],
        keys: [String]
    ) -> [String: Any]? {
        for key in keys {
            if let value = dictionary[key] as? [String: Any] {
                return value
            }
        }

        return nil
    }

    static func identifierValue(
        in dictionary: [String: Any],
        keys: [String]
    ) -> String? {
        for key in keys {
            guard let value = dictionary[key] else {
                continue
            }

            if let string = value as? String, !string.isEmpty {
                return string
            }

            if let number = value as? NSNumber {
                return number.stringValue
            }

            if let integer = value as? Int {
                return String(integer)
            }
        }

        return nil
    }
}
