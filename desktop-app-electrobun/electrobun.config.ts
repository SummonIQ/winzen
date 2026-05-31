import type { ElectrobunConfig } from "electrobun";

export default {
  app: { name: "Winzen", identifier: "com.winzen.desktop", version: "0.0.1" },
  build: {
    views: {
      mainview: { entrypoint: "src/mainview/preload.ts" },
    },
    copy: {
      "src/mainview/index.html": "views/mainview/index.html",
      "views/assets/trayTemplate.png": "views/assets/trayTemplate.png",
      "views/assets/trayTemplate@2x.png": "views/assets/trayTemplate@2x.png",
      "resources/WinzenBridgeCLI": "resources/WinzenBridgeCLI",
    },
  },
  runtime: {
    // Don't quit when the window is hidden (we hide on focus loss intentionally)
    exitOnLastWindowClosed: false,
  },
} satisfies ElectrobunConfig;
