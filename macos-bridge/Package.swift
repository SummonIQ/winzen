// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "WinzenBridge",
    platforms: [
        .macOS(.v13)
    ],
    products: [
        .library(name: "WinzenBridgeCore", targets: ["WinzenBridgeCore"]),
        .executable(name: "WinzenBridgeCLI", targets: ["WinzenBridgeCLI"])
    ],
    targets: [
        .target(
            name: "WinzenBridgeCore",
            path: "Sources/WinzenBridgeCore"
        ),
        .executableTarget(
            name: "WinzenBridgeCLI",
            dependencies: ["WinzenBridgeCore"],
            path: "Sources/WinzenBridgeCLI"
        )
    ]
)
