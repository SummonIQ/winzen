import { existsSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { dlopen, FFIType } from "bun:ffi";
import type { ElectronSpaceInfo } from "../shared/rpc-types";
import { readEnvValue } from "./env";

const objc = dlopen("/usr/lib/libobjc.A.dylib", {
  sel_registerName: { args: [FFIType.cstring], returns: FFIType.ptr },
  objc_getClass: { args: [FFIType.cstring], returns: FFIType.ptr },
});

const objc2u64 = dlopen("/usr/lib/libobjc.A.dylib", {
  objc_msgSend: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.u64,
  },
});

const sel = (name: string) =>
  objc.symbols.sel_registerName(Buffer.from(name + "\0"));

const nsEventClass = objc.symbols.objc_getClass(Buffer.from("NSEvent\0"));
const modifierFlagsSel = sel("modifierFlags");

const nseventModifierFlags = () =>
  Number(objc2u64.symbols.objc_msgSend(nsEventClass as any, modifierFlagsSel as any));

export type VoiceOverlayState =
  | { visible: false }
  | { visible: true; title: string; detail: string };

interface VoiceOverlayCallbacks {
  onOverlayStateChange?: (state: VoiceOverlayState) => void;
}

const FUNCTION_KEY_MASK = 0x00800000;

const overlayIdleState: VoiceOverlayState = { visible: false };

function setOverlayState(
  callbacks: VoiceOverlayCallbacks | undefined,
  state: VoiceOverlayState
) {
  callbacks?.onOverlayStateChange?.(state);
}

const FUNCTION_KEY_HOLD_DELAY_MS = 180;
const MIN_RECORDING_MS = 250;
const FUNCTION_KEY_POLL_MS = 50;

interface VoiceCommandDeps {
  getSpaces: () => Promise<ElectronSpaceInfo[]>;
  switchToSpace: (spaceId: string) => Promise<void>;
  hideWindow: () => void | Promise<void>;
  showWindow: () => void | Promise<void>;
  runAppleScript: (script: string) => Promise<string>;
}

type ParsedCommand =
  | { kind: "switch-space"; spaceId: string; spaceName: string }
  | { kind: "show-winzen" }
  | { kind: "hide-winzen" }
  | { kind: "open-mission-control" }
  | { kind: "open-application"; appName: string }
  | { kind: "unknown" };

type RecordingHandle = {
  proc: ReturnType<typeof Bun.spawn>;
  outputPath: string;
  startedAt: number;
  stderrPromise: Promise<string>;
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTrailingFiller(value: string): string {
  return value
    .replace(/\b(?:please|now|quickly|thanks|thank you)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeAppleScript(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function transcribeWithOpenAI(audioBytes: Uint8Array): Promise<string> {
  const apiKey = readEnvValue("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const formData = new FormData();
  const audioBuffer = audioBytes.buffer.slice(
    audioBytes.byteOffset,
    audioBytes.byteOffset + audioBytes.byteLength
  ) as ArrayBuffer;
  formData.append(
    "file",
    new File([audioBuffer], "voice-command.wav", { type: "audio/wav" })
  );
  formData.append("model", "whisper-1");
  formData.append("language", "en");
  formData.append("response_format", "text");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`OpenAI transcription failed (${response.status}): ${text}`);
  }

  return text.trim();
}

async function transcribeWithAssemblyAI(audioBytes: Uint8Array): Promise<string> {
  const apiKey =
    readEnvValue("ASSEMBLYAI_API_KEY") ?? readEnvValue("VITE_ASSEMBLYAI_API_KEY");

  if (!apiKey) {
    return transcribeWithOpenAI(audioBytes);
  }

  const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/octet-stream",
    },
    body: audioBytes.buffer.slice(
      audioBytes.byteOffset,
      audioBytes.byteOffset + audioBytes.byteLength
    ) as ArrayBuffer,
  });

  const uploadJson = (await uploadResponse.json().catch(() => ({}))) as {
    upload_url?: string;
    error?: string;
  };

  if (!uploadResponse.ok || !uploadJson.upload_url) {
    throw new Error(
      uploadJson.error || `AssemblyAI upload failed (${uploadResponse.status})`
    );
  }

  const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      audio_url: uploadJson.upload_url,
      speech_models: ["universal-2"],
      punctuate: true,
      format_text: true,
    }),
  });

  const transcriptJson = (await transcriptResponse.json().catch(() => ({}))) as {
    id?: string;
    error?: string;
  };

  if (!transcriptResponse.ok || !transcriptJson.id) {
    throw new Error(
      transcriptJson.error ||
        `AssemblyAI transcript create failed (${transcriptResponse.status})`
    );
  }

  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    const pollResponse = await fetch(
      `https://api.assemblyai.com/v2/transcript/${transcriptJson.id}`,
      {
        headers: { Authorization: apiKey },
      }
    );

    const pollJson = (await pollResponse.json().catch(() => ({}))) as {
      status?: string;
      text?: string;
      error?: string;
    };

    if (!pollResponse.ok) {
      throw new Error(
        pollJson.error || `AssemblyAI poll failed (${pollResponse.status})`
      );
    }

    if (pollJson.status === "completed") {
      return pollJson.text?.trim() ?? "";
    }

    if (pollJson.status === "error") {
      throw new Error(pollJson.error || "AssemblyAI transcription failed");
    }

    await Bun.sleep(1200);
  }

  throw new Error("AssemblyAI transcription timed out");
}

function resolveNamedSpace(
  spaces: ElectronSpaceInfo[],
  rawTarget: string
): ElectronSpaceInfo | null {
  const target = stripTrailingFiller(normalizeText(rawTarget));
  if (!target) return null;

  const exactName = spaces.find((space) => normalizeText(space.name) === target);
  if (exactName) return exactName;

  const directNumberMatch = target.match(/^(?:space|desktop)\s+(\d{1,2})$/);
  if (directNumberMatch) {
    const number = Number(directNumberMatch[1]);
    return spaces.find((space) => space.number === number) ?? null;
  }

  const prefixedNumberMatch = target.match(/^(\d{1,2})$/);
  if (prefixedNumberMatch) {
    const number = Number(prefixedNumberMatch[1]);
    return spaces.find((space) => space.number === number) ?? null;
  }

  const containsName = spaces.find((space) => {
    const normalizedName = normalizeText(space.name);
    return normalizedName.includes(target) || target.includes(normalizedName);
  });
  if (containsName) return containsName;

  return null;
}

function parseCommand(
  transcript: string,
  spaces: ElectronSpaceInfo[]
): ParsedCommand {
  const normalized = stripTrailingFiller(normalizeText(transcript));

  if (!normalized) return { kind: "unknown" };
  if (normalized.includes("hide winzen")) return { kind: "hide-winzen" };
  if (
    normalized.includes("show winzen") ||
    normalized.includes("open winzen")
  ) {
    return { kind: "show-winzen" };
  }
  if (
    normalized.includes("mission control") &&
    /(?:open|show|launch)/.test(normalized)
  ) {
    return { kind: "open-mission-control" };
  }

  const switchMatch = normalized.match(
    /^(?:switch|go|move|take me|jump|open|show)(?:\s+to)?\s+(.+)$/
  );
  if (switchMatch) {
    const space = resolveNamedSpace(spaces, switchMatch[1]);
    if (space) {
      return {
        kind: "switch-space",
        spaceId: space.id,
        spaceName: space.name,
      };
    }
  }

  const bareSpace = resolveNamedSpace(spaces, normalized);
  if (bareSpace) {
    return {
      kind: "switch-space",
      spaceId: bareSpace.id,
      spaceName: bareSpace.name,
    };
  }

  const appMatch =
    normalized.match(/^(?:open|launch)\s+(.+?)\s+app$/) ??
    normalized.match(/^(?:open|launch)\s+(.+)$/);
  if (appMatch) {
    return {
      kind: "open-application",
      appName: appMatch[1]
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
    };
  }

  return { kind: "unknown" };
}

export class VoiceCommandController {
  private readonly deps: VoiceCommandDeps;
  private readonly callbacks?: VoiceOverlayCallbacks;
  private pollingTimer: Timer | null = null;
  private holdTimer: Timer | null = null;
  private functionKeyDown = false;
  private recording: RecordingHandle | null = null;
  private processing = false;

  constructor(deps: VoiceCommandDeps, callbacks?: VoiceOverlayCallbacks) {
    this.deps = deps;
    this.callbacks = callbacks;
  }

  start() {
    if (this.pollingTimer) return;

    this.pollingTimer = setInterval(() => {
      this.pollFunctionKey();
    }, FUNCTION_KEY_POLL_MS);
  }

  private pollFunctionKey() {
    try {
      const flags = nseventModifierFlags();
      const isPressed = (flags & FUNCTION_KEY_MASK) !== 0;

      if (isPressed === this.functionKeyDown) return;
      this.functionKeyDown = isPressed;

      if (isPressed) {
        this.handleFunctionKeyDown();
      } else {
        this.handleFunctionKeyUp();
      }
    } catch (error) {
      console.error("[voice] Failed to poll function key:", error);
    }
  }

  private handleFunctionKeyDown() {
    if (this.processing || this.recording || this.holdTimer) return;

    this.holdTimer = setTimeout(() => {
      this.holdTimer = null;
      void this.startRecording();
    }, FUNCTION_KEY_HOLD_DELAY_MS);
  }

  private handleFunctionKeyUp() {
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }

    if (this.recording) {
      void this.stopRecordingAndExecute();
    }
  }

  private async startRecording() {
    if (this.recording || this.processing) return;

    const ffmpegPath = "/opt/homebrew/bin/ffmpeg";
    if (!existsSync(ffmpegPath)) {
      console.error("[voice] ffmpeg is required at /opt/homebrew/bin/ffmpeg");
      return;
    }

    const audioDevice = readEnvValue("WINZEN_VOICE_AUDIO_DEVICE") ?? "0";
    const outputPath = path.join(
      tmpdir(),
      `winzen-voice-command-${Date.now()}.wav`
    );

    const proc = Bun.spawn(
      [
        ffmpegPath,
        "-hide_banner",
        "-loglevel",
        "error",
        "-f",
        "avfoundation",
        "-i",
        `:${audioDevice}`,
        "-ac",
        "1",
        "-ar",
        "16000",
        "-c:a",
        "pcm_s16le",
        "-y",
        outputPath,
      ],
      {
        stdin: "ignore",
        stdout: "pipe",
        stderr: "pipe",
      }
    );

    this.recording = {
      proc,
      outputPath,
      startedAt: Date.now(),
      stderrPromise: new Response(proc.stderr).text(),
    };

    setOverlayState(this.callbacks, {
      visible: true,
      title: "Listening…",
      detail: "Release fn when you're done speaking",
    });
    console.log("[voice] Recording voice command...");
  }

  private async stopRecordingAndExecute() {
    const activeRecording = this.recording;
    if (!activeRecording) return;

    this.recording = null;
    this.processing = true;

    try {
      activeRecording.proc.kill("SIGINT");
      await activeRecording.proc.exited;
      const stderr = await activeRecording.stderrPromise;
      const durationMs = Date.now() - activeRecording.startedAt;

      if (durationMs < MIN_RECORDING_MS) {
        setOverlayState(this.callbacks, overlayIdleState);
        console.log("[voice] Ignored short fn hold");
        return;
      }

      const file = Bun.file(activeRecording.outputPath);
      if (!(await file.exists())) {
        throw new Error(stderr.trim() || "No audio file was recorded");
      }

      const audioBytes = new Uint8Array(await file.arrayBuffer());
      try {
        Bun.spawnSync(["rm", "-f", activeRecording.outputPath]);
      } catch {}

      if (audioBytes.byteLength === 0) {
        throw new Error("Recorded audio file is empty");
      }

      setOverlayState(this.callbacks, {
        visible: true,
        title: "Transcribing…",
        detail: "Turning your voice into a command",
      });
      const transcript = await transcribeWithAssemblyAI(audioBytes);

      if (!transcript) {
        setOverlayState(this.callbacks, overlayIdleState);
        console.warn("[voice] Transcript was empty");
        return;
      }

      console.log(`[voice] Transcript: ${transcript}`);
      setOverlayState(this.callbacks, {
        visible: true,
        title: "Running command…",
        detail: transcript,
      });
      await this.executeTranscript(transcript);
    } catch (error) {
      setOverlayState(this.callbacks, {
        visible: true,
        title: "Voice command failed",
        detail: error instanceof Error ? error.message : String(error),
      });
      setTimeout(() => setOverlayState(this.callbacks, overlayIdleState), 1800);
      console.error("[voice] Failed to process voice command:", error);
    } finally {
      if (!this.processing) {
        setOverlayState(this.callbacks, overlayIdleState);
      } else {
        setOverlayState(this.callbacks, overlayIdleState);
      }
      this.processing = false;
    }
  }

  private async executeTranscript(transcript: string) {
    const spaces = await this.deps.getSpaces();
    const command = parseCommand(transcript, spaces);

    switch (command.kind) {
      case "switch-space":
        console.log(`[voice] Switching to space: ${command.spaceName}`);
        await this.deps.hideWindow();
        await this.deps.switchToSpace(command.spaceId);
        return;

      case "show-winzen":
        await this.deps.showWindow();
        return;

      case "hide-winzen":
        await this.deps.hideWindow();
        return;

      case "open-mission-control":
        await this.deps.runAppleScript('tell application "Mission Control" to activate');
        return;

      case "open-application":
        await this.deps.runAppleScript(
          `tell application "${escapeAppleScript(command.appName)}" to activate`
        );
        return;

      case "unknown":
        console.warn(`[voice] No action matched transcript: "${transcript}"`);
        return;
    }
  }
}
