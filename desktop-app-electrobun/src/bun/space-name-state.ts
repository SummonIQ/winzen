import path from "path";
import { Utils } from "electrobun/bun";

export type PersistedSpaceNames = Record<string, string>;

let cachedSpaceNames: PersistedSpaceNames | null = null;

function stateFilePath(): string {
  return path.join(Utils.paths.userData, "space-names.json");
}

export async function loadSpaceNames(): Promise<PersistedSpaceNames> {
  if (cachedSpaceNames) {
    return { ...cachedSpaceNames };
  }

  try {
    const file = Bun.file(stateFilePath());
    if (await file.exists()) {
      const data = await file.json();
      if (data && typeof data === "object") {
        cachedSpaceNames = Object.fromEntries(
          Object.entries(data as Record<string, unknown>).filter(
            ([key, value]) => key.length > 0 && typeof value === "string"
          )
        );
        return { ...cachedSpaceNames };
      }
    }
  } catch (error) {
    console.error("[winzen] Failed to load space names:", error);
  }

  cachedSpaceNames = {};
  return {};
}

export async function saveSpaceNames(
  names: PersistedSpaceNames
): Promise<void> {
  cachedSpaceNames = { ...names };

  try {
    await Bun.write(
      stateFilePath(),
      JSON.stringify(cachedSpaceNames, null, 2)
    );
  } catch (error) {
    console.error("[winzen] Failed to save space names:", error);
  }
}
