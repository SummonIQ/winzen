import Foundation

public enum BridgeError: Error {
    case invalidPayload(String)
    case notImplemented(String)
    case appleScriptFailed(String)
    case captureFailed(String)
}

extension BridgeError: LocalizedError {
    public var errorDescription: String? {
        switch self {
        case .invalidPayload(let field):
            return "Invalid or missing payload field: \(field)"
        case .notImplemented(let command):
            return "\(command) is not implemented yet"
        case .appleScriptFailed(let message):
            return "AppleScript execution failed: \(message)"
        case .captureFailed(let message):
            return "Capture failed: \(message)"
        }
    }
}

enum BridgeCommandRouter {
    static func handle(request: BridgeRequest, startedAt: Date) -> BridgeResponse {
        do {
            switch request.command {
            case "bridge.health":
                return .success(
                    id: request.id,
                    payload: [
                        "status": .string("ok"),
                        "version": .string("0.0.1")
                    ],
                    startedAt: startedAt
                )

            case "spaces.list":
                let spaces = try JSONEncoder().encode(SpacesCommands.list())
                let decoded = try JSONDecoder().decode([JSONValue].self, from: spaces)
                return .success(
                    id: request.id,
                    payload: ["spaces": .array(decoded)],
                    startedAt: startedAt
                )

            case "spaces.current":
                let current = SpacesCommands.current()
                return .success(
                    id: request.id,
                    payload: ["spaceId": current.map(JSONValue.string) ?? .null],
                    startedAt: startedAt
                )

            case "spaces.switch":
                let spaceId = try stringValue("spaceId", from: request.payload)
                let switched = try SpacesCommands.switch(spaceId: spaceId)
                return .success(
                    id: request.id,
                    payload: ["switched": .bool(switched)],
                    startedAt: startedAt
                )

            case "spaces.shortcut_number":
                let spaceId = try stringValue("spaceId", from: request.payload)
                let shortcutNumber = try SpacesCommands.shortcutNumber(for: spaceId)
                return .success(
                    id: request.id,
                    payload: ["shortcutNumber": .number(Double(shortcutNumber))],
                    startedAt: startedAt
                )

            case "windows.list":
                let windows = try JSONEncoder().encode(WindowCommands.list())
                let decoded = try JSONDecoder().decode([JSONValue].self, from: windows)
                return .success(
                    id: request.id,
                    payload: ["windows": .array(decoded)],
                    startedAt: startedAt
                )

            case "windows.move_to_space":
                let windowId = try stringValue("windowId", from: request.payload)
                let spaceId = try stringValue("spaceId", from: request.payload)
                let moved = try WindowCommands.moveToSpace(windowId: windowId, spaceId: spaceId)
                return .success(
                    id: request.id,
                    payload: ["moved": .bool(moved)],
                    startedAt: startedAt
                )

            case "windows.set_bounds":
                let windowId = try stringValue("windowId", from: request.payload)
                let x = try numberValue("x", from: request.payload)
                let y = try numberValue("y", from: request.payload)
                let width = try numberValue("width", from: request.payload)
                let height = try numberValue("height", from: request.payload)
                let updated = try WindowCommands.setBounds(
                    windowId: windowId,
                    x: x,
                    y: y,
                    width: width,
                    height: height
                )
                return .success(
                    id: request.id,
                    payload: ["updated": .bool(updated)],
                    startedAt: startedAt
                )

            case "screens.capture_current":
                let screenshot = try ScreenshotCommands.captureCurrent()
                if let screenshot {
                    let encoded = try JSONEncoder().encode(screenshot)
                    let decoded = try JSONDecoder().decode([String: JSONValue].self, from: encoded)
                    return .success(
                        id: request.id,
                        payload: ["screenshot": .object(decoded)],
                        startedAt: startedAt
                    )
                }
                return .success(
                    id: request.id,
                    payload: ["screenshot": .null],
                    startedAt: startedAt
                )

            case "screens.capture_all_spaces":
                let screenshots = try ScreenshotCommands.captureAllSpaces()
                let encoded = try JSONEncoder().encode(screenshots)
                let decoded = try JSONDecoder().decode([JSONValue].self, from: encoded)
                return .success(
                    id: request.id,
                    payload: ["screenshots": .array(decoded)],
                    startedAt: startedAt
                )

            case "permissions.check_accessibility":
                return .success(
                    id: request.id,
                    payload: ["granted": .bool(PermissionCommands.accessibilityStatus().granted)],
                    startedAt: startedAt
                )

            case "permissions.check_screen_recording":
                return .success(
                    id: request.id,
                    payload: ["granted": .bool(PermissionCommands.screenRecordingStatus().granted)],
                    startedAt: startedAt
                )

            default:
                throw BridgeError.notImplemented(request.command)
            }
        } catch {
            let bridgeError = error as? BridgeError
            return .failure(
                id: request.id,
                code: code(for: bridgeError),
                message: error.localizedDescription,
                startedAt: startedAt
            )
        }
    }

    private static func stringValue(
        _ key: String,
        from payload: [String: JSONValue]
    ) throws -> String {
        guard let value = payload[key], case .string(let string) = value else {
            throw BridgeError.invalidPayload(key)
        }
        return string
    }

    private static func numberValue(
        _ key: String,
        from payload: [String: JSONValue]
    ) throws -> Double {
        guard let value = payload[key], case .number(let number) = value else {
            throw BridgeError.invalidPayload(key)
        }
        return number
    }

    private static func code(for error: BridgeError?) -> String {
        switch error {
        case .invalidPayload:
            return "INVALID_PAYLOAD"
        case .notImplemented:
            return "NOT_IMPLEMENTED"
        case .appleScriptFailed:
            return "APPLESCRIPT_FAILED"
        case .captureFailed:
            return "CAPTURE_FAILED"
        case nil:
            return "UNKNOWN_ERROR"
        }
    }
}
