import Foundation
import ApplicationServices
import CoreGraphics

enum PermissionCommands {
    static func accessibilityStatus() -> BridgePermissionStatus {
        BridgePermissionStatus(granted: AXIsProcessTrusted())
    }

    static func screenRecordingStatus() -> BridgePermissionStatus {
        if #available(macOS 10.15, *) {
            return BridgePermissionStatus(granted: CGPreflightScreenCaptureAccess())
        }

        return BridgePermissionStatus(granted: true)
    }
}
