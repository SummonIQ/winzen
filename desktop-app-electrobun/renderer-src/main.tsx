import React from "react";
import ReactDOM from "react-dom/client";
import App from "../../app/renderer/src/App";
import "../../app/renderer/src/index.css";

// window.electronAPI is injected by the Electrobun preload script (preload.ts).
// No shim needed here.

document.documentElement.classList.add("electrobun-shell");
document.body.classList.add("electrobun-shell");

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
