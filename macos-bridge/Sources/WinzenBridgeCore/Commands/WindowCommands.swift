import Foundation

enum WindowCommands {
    static func list() -> [BridgeWindow] {
        let script = """
        set AppleScript's text item delimiters to linefeed
        tell application "System Events"
          set outputLines to {}
          set appList to every application process whose visible is true
          repeat with appProc in appList
            try
              set appName to name of appProc
              set bundleId to ""
              try
                set bundleId to bundle identifier of appProc
              end try

              set appWindows to every window of appProc
              repeat with win in appWindows
                try
                  set windowTitle to ""
                  try
                    set windowTitle to name of win
                  end try

                  set windowPosition to {0, 0}
                  try
                    set windowPosition to position of win
                  end try

                  set windowSize to {0, 0}
                  try
                    set windowSize to size of win
                  end try

                  set cleanTitle to my replaceBreaks(windowTitle)
                  set cleanAppName to my replaceBreaks(appName)
                  set cleanBundleId to my replaceBreaks(bundleId)

                  set end of outputLines to cleanAppName & "||" & cleanBundleId & "||" & cleanTitle & "||" & (item 1 of windowPosition as text) & "||" & (item 2 of windowPosition as text) & "||" & (item 1 of windowSize as text) & "||" & (item 2 of windowSize as text)
                end try
              end repeat
            end try
          end repeat

          if (count of outputLines) is 0 then
            return ""
          end if

          return outputLines as text
        end tell

        on replaceBreaks(valueText)
          set AppleScript's text item delimiters to return
          set parts to text items of valueText
          set AppleScript's text item delimiters to " "
          set normalized to parts as text
          set AppleScript's text item delimiters to linefeed
          set parts to text items of normalized
          set AppleScript's text item delimiters to " "
          set normalized to parts as text
          set AppleScript's text item delimiters to linefeed
          return normalized
        end replaceBreaks
        """

        do {
            let output = try runAppleScript(script)

            if output.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                return []
            }

            return output
                .split(whereSeparator: \.isNewline)
                .compactMap { rawLine in
                    let line = String(rawLine)
                    let parts = line.components(separatedBy: "||")
                    guard parts.count >= 7 else {
                        return nil
                    }

                    let descriptor = WindowDescriptor(
                        app: parts[0],
                        bundleId: parts[1].isEmpty ? nil : parts[1],
                        title: parts[2],
                        x: doubleValue(parts[3]),
                        y: doubleValue(parts[4]),
                        width: doubleValue(parts[5]),
                        height: doubleValue(parts[6])
                    )

                    return BridgeWindow(
                        id: encodeWindowId(descriptor),
                        app: descriptor.app,
                        bundleId: descriptor.bundleId,
                        title: descriptor.title,
                        x: descriptor.x,
                        y: descriptor.y,
                        width: descriptor.width,
                        height: descriptor.height
                    )
                }
        } catch {
            return []
        }
    }

    static func moveToSpace(windowId: String, spaceId: String) throws -> Bool {
        let descriptor = try decodeWindowId(windowId)
        guard let spaceNumber = Int(spaceId) else {
            throw BridgeError.invalidPayload("spaceId")
        }

        guard let keyCode = moveWindowKeyCode(for: spaceNumber) else {
            throw BridgeError.notImplemented("windows.move_to_space[\(spaceNumber)]")
        }

        let script = """
        tell application "System Events"
          tell process "\(escapeAppleScript(descriptor.app))"
            set frontmost to true
            delay 0.2
            key code \(keyCode) using {control down, shift down}
          end tell
        end tell
        """

        try runAppleScript(script)
        return true
    }

    static func setBounds(
        windowId: String,
        x: Double,
        y: Double,
        width: Double,
        height: Double
    ) throws -> Bool {
        let descriptor = try decodeWindowId(windowId)
        let title = escapeAppleScript(descriptor.title)
        let app = escapeAppleScript(descriptor.app)

        let script = """
        tell application "System Events"
          tell process "\(app)"
            set frontmost to true
            tell window "\(title)"
              set position to {\(Int(x.rounded())), \(Int(y.rounded()))}
              set size to {\(Int(width.rounded())), \(Int(height.rounded()))}
            end tell
          end tell
        end tell
        """

        try runAppleScript(script)
        return true
    }
}

private extension WindowCommands {
    struct WindowDescriptor: Codable {
        let app: String
        let bundleId: String?
        let title: String
        let x: Double
        let y: Double
        let width: Double
        let height: Double
    }

    static func runAppleScript(_ script: String) throws -> String {
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/usr/bin/osascript")
        process.arguments = ["-e", script]

        let stdout = Pipe()
        let stderr = Pipe()
        process.standardOutput = stdout
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

            return String(
                data: stdout.fileHandleForReading.readDataToEndOfFile(),
                encoding: .utf8
            ) ?? ""
        } catch let error as BridgeError {
            throw error
        } catch {
            throw BridgeError.appleScriptFailed(error.localizedDescription)
        }
    }

    static func doubleValue(_ text: String) -> Double {
        Double(text.trimmingCharacters(in: .whitespacesAndNewlines)) ?? 0
    }

    static func encodeWindowId(_ descriptor: WindowDescriptor) -> String {
        guard let data = try? JSONEncoder().encode(descriptor) else {
            return UUID().uuidString
        }

        return data.base64EncodedString()
    }

    static func decodeWindowId(_ windowId: String) throws -> WindowDescriptor {
        guard let data = Data(base64Encoded: windowId),
              let descriptor = try? JSONDecoder().decode(WindowDescriptor.self, from: data)
        else {
            throw BridgeError.invalidPayload("windowId")
        }

        return descriptor
    }

    static func escapeAppleScript(_ text: String) -> String {
        text
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "\"", with: "\\\"")
    }

    static func moveWindowKeyCode(for spaceNumber: Int) -> Int? {
        switch spaceNumber {
        case 1: return 18
        case 2: return 19
        case 3: return 20
        case 4: return 21
        case 5: return 23
        case 6: return 22
        case 7: return 26
        case 8: return 28
        case 9: return 25
        default: return nil
        }
    }
}
