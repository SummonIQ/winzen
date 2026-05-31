import Foundation

public struct BridgeErrorResponse: Codable {
    public let code: String
    public let message: String
}

public struct BridgeSpace: Codable {
    public let id: String
    public let number: Int
    public let monitorId: String
    public let monitorName: String
    public let monitorIndex: Int
    public let monitorSpaceNumber: Int
}

public struct BridgeWindow: Codable {
    public let id: String
    public let app: String
    public let bundleId: String?
    public let title: String
    public let x: Double
    public let y: Double
    public let width: Double
    public let height: Double
}

public struct BridgeScreenshot: Codable {
    public let path: String
    public let mimeType: String
    public let width: Int?
    public let height: Int?
}

public struct BridgeSpaceScreenshot: Codable {
    public let spaceId: String
    public let path: String
    public let mimeType: String
    public let width: Int?
    public let height: Int?
}

public struct BridgePermissionStatus: Codable {
    public let granted: Bool
}

public struct BridgeHealthPayload: Codable {
    public let status: String
    public let version: String
}

public struct BridgeResponse: Codable {
    public let id: String
    public let success: Bool
    public let data: [String: JSONValue]?
    public let error: BridgeErrorResponse?
    public let timing_ms: Int

    public static func success(
        id: String,
        payload: [String: JSONValue],
        startedAt: Date
    ) -> BridgeResponse {
        BridgeResponse(
            id: id,
            success: true,
            data: payload,
            error: nil,
            timing_ms: Int(Date().timeIntervalSince(startedAt) * 1000)
        )
    }

    public static func failure(
        id: String,
        code: String,
        message: String,
        startedAt: Date
    ) -> BridgeResponse {
        BridgeResponse(
            id: id,
            success: false,
            data: nil,
            error: BridgeErrorResponse(code: code, message: message),
            timing_ms: Int(Date().timeIntervalSince(startedAt) * 1000)
        )
    }
}
