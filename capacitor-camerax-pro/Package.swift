// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "FilmiqueCapacitorCameraxPro",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "FilmiqueCapacitorCameraxPro",
            targets: ["CameraXProPluginPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0")
    ],
    targets: [
        .target(
            name: "CameraXProPluginPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/CameraXProPluginPlugin"),
        .testTarget(
            name: "CameraXProPluginPluginTests",
            dependencies: ["CameraXProPluginPlugin"],
            path: "ios/Tests/CameraXProPluginPluginTests")
    ]
)