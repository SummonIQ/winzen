import path from "path";
import { Utils } from "electrobun/bun";

export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  collapsed: boolean;
  expandedHeight: number;
}

const DEFAULT_STATE: WindowState = {
  x: 120,
  y: 120,
  width: 920,
  height: 620,
  collapsed: false,
  expandedHeight: 620,
};

function stateFilePath(): string {
  return path.join(Utils.paths.userData, "window-state.json");
}

export async function loadWindowState(): Promise<WindowState> {
  try {
    const file = Bun.file(stateFilePath());
    if (await file.exists()) {
      const data = await file.json();
      return { ...DEFAULT_STATE, ...data };
    }
  } catch {}
  return { ...DEFAULT_STATE };
}

export async function saveWindowState(state: WindowState): Promise<void> {
  try {
    await Bun.write(stateFilePath(), JSON.stringify(state, null, 2));
  } catch (e) {
    console.error("[winzen] Failed to save window state:", e);
  }
}
