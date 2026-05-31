import { dlopen, FFIType, JSCallback } from "bun:ffi";

// ── ObjC runtime — thread-safe window hide/show ───────────────────────────
// Direct calls to [NSWindow orderOut:] / [NSWindow makeKeyAndOrderFront:] from
// a bun:ffi worker thread crash the WindowManagement framework (SIGTRAP).
// Using performSelectorOnMainThread:withObject:waitUntilDone: dispatches the
// actual visibility change to the NSApp main thread, which is safe from any thread.

const objc3 = dlopen("/usr/lib/libobjc.A.dylib", {
  sel_registerName: { args: [FFIType.cstring], returns: FFIType.ptr },
  objc_getClass: { args: [FFIType.cstring], returns: FFIType.ptr },
  objc_msgSend: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.ptr],
    returns: FFIType.void,
  },
});

// 2-arg variant of objc_msgSend that returns a pointer (for class method calls
// like +[NSApplication sharedApplication]).
const objc2ret = dlopen("/usr/lib/libobjc.A.dylib", {
  objc_msgSend: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.ptr,
  },
});

// Second dlopen for the 5-arg variant of objc_msgSend (same library, different call wrapper).
const objc5 = dlopen("/usr/lib/libobjc.A.dylib", {
  objc_msgSend: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.ptr, FFIType.ptr, FFIType.bool],
    returns: FFIType.void,
  },
});

const sel = (name: string) =>
  objc3.symbols.sel_registerName(Buffer.from(name + "\0"));

const performOnMainSel = sel("performSelectorOnMainThread:withObject:waitUntilDone:");
const orderOutSel = sel("orderOut:");
const makeKeyFrontSel = sel("makeKeyAndOrderFront:");
const activateSel = sel("activate"); // macOS 14+ NSApp.activate() — no args

// Pre-resolve NSApp singleton once at module load.
const nsAppClass = objc3.symbols.objc_getClass(Buffer.from("NSApplication\0"));
const nsApp = objc2ret.symbols.objc_msgSend(
  nsAppClass as any,
  sel("sharedApplication") as any
);

export function hideNSWindow(winPtr: any) {
  if (!winPtr) return;
  // [win performSelectorOnMainThread:@selector(orderOut:) withObject:nil waitUntilDone:NO]
  objc5.symbols.objc_msgSend(
    winPtr,
    performOnMainSel as any,
    orderOutSel as any,
    null as any,
    false
  );
}

export function showNSWindow(winPtr: any) {
  if (!winPtr) return;
  // Activate NSApp first so Winzen actually steals keyboard focus from whatever
  // was previously the key window.  [NSApp activate] (macOS 14+) is dispatched
  // asynchronously on the main thread, followed by makeKeyAndOrderFront:.
  objc5.symbols.objc_msgSend(
    nsApp as any,
    performOnMainSel as any,
    activateSel as any,
    null as any,
    false
  );
  // [win performSelectorOnMainThread:@selector(makeKeyAndOrderFront:) withObject:nil waitUntilDone:NO]
  objc5.symbols.objc_msgSend(
    winPtr,
    performOnMainSel as any,
    makeKeyFrontSel as any,
    null as any,
    false
  );
}

// ── Carbon hotkey — intercepts and CONSUMES Cmd+D so other apps never see it
// NSEvent global monitors observe but do NOT consume key events — Terminal still
// gets Cmd+D and opens a split view.  Carbon's RegisterEventHotKey intercepts
// at a lower level and prevents the keystroke from reaching any other app.
//
// The handler JSCallback uses threadsafe:true (same pattern as Electrobun's own
// globalShortcutCallback) so it can be safely called from Carbon's main-thread
// run loop and will schedule execution back on Bun's event-loop thread.

const carbon = dlopen(
  "/System/Library/Frameworks/Carbon.framework/Carbon",
  {
    GetApplicationEventTarget: { args: [], returns: FFIType.ptr },
    InstallEventHandler: {
      args: [
        FFIType.ptr, // EventTargetRef  target
        FFIType.ptr, // EventHandlerUPP handler
        FFIType.u32, // ItemCount        numTypes
        FFIType.ptr, // EventTypeSpec*   list
        FFIType.ptr, // void*            userData
        FFIType.ptr, // EventHandlerRef* outRef
      ],
      returns: FFIType.i32, // OSStatus
    },
    RegisterEventHotKey: {
      args: [
        FFIType.u32, // UInt32         inHotKeyCode
        FFIType.u32, // UInt32         inHotKeyModifiers
        FFIType.u64, // EventHotKeyID  inHotKeyID (8-byte struct in one register)
        FFIType.ptr, // EventTargetRef inTarget
        FFIType.u32, // OptionBits     inOptions
        FFIType.ptr, // EventHotKeyRef* outRef
      ],
      returns: FFIType.i32, // OSStatus
    },
    UnregisterEventHotKey: {
      args: [FFIType.ptr], // EventHotKeyRef
      returns: FFIType.i32,
    },
  }
);

// kEventClassKeyboard = 'keyb', kEventHotKeyPressed = 5
const kEventClassKeyboard = 0x6b657962;
const kEventHotKeyPressed = 5;
// kVK_ANSI_D = 2, cmdKey = 0x0100
const kVK_ANSI_D = 2;
const carbonCmdKey = 0x0100;

// These must stay alive for the lifetime of the app — GC-anchored at module scope.
let _carbonHotkeyCallback: JSCallback | null = null;
let _carbonHotkeyRef: ArrayBuffer | null = null;

export function registerCmdDHotkey(onFire: () => void): void {
  if (_carbonHotkeyRef) return; // already registered

  const target = carbon.symbols.GetApplicationEventTarget();

  // EventTypeSpec[] = [{ eventClass: kEventClassKeyboard, eventKind: kEventHotKeyPressed }]
  const eventTypeSpec = new Uint32Array([kEventClassKeyboard, kEventHotKeyPressed]);

  _carbonHotkeyCallback = new JSCallback(
    (_nextHandler: any, _event: any, _userData: any): number => {
      onFire();
      return 0; // noErr
    },
    {
      args: [FFIType.ptr, FFIType.ptr, FFIType.ptr],
      returns: FFIType.i32,
      threadsafe: true, // carbon calls this from the main-thread run loop
    }
  );

  const handlerRefBuf = new ArrayBuffer(8);
  carbon.symbols.InstallEventHandler(
    target as any,
    _carbonHotkeyCallback.ptr as any,
    1,
    eventTypeSpec as any,
    null as any,
    handlerRefBuf as any
  );

  // EventHotKeyID: OSType signature 'wznD' (4 bytes) | UInt32 id=1 (4 bytes) → u64
  const hotKeyId = (BigInt(0x777a6e44) << 32n) | 1n;
  _carbonHotkeyRef = new ArrayBuffer(8);

  const status = carbon.symbols.RegisterEventHotKey(
    kVK_ANSI_D,
    carbonCmdKey,
    hotKeyId,
    target as any,
    0,
    _carbonHotkeyRef as any
  );

  if (status !== 0) {
    console.error("[winzen] Carbon RegisterEventHotKey failed, OSStatus:", status);
    _carbonHotkeyRef = null;
  } else {
    console.log("[winzen] Carbon Cmd+D hotkey registered — event will be consumed");
  }
}

export function unregisterCmdDHotkey(): void {
  if (!_carbonHotkeyRef) return;
  carbon.symbols.UnregisterEventHotKey(_carbonHotkeyRef as any);
  _carbonHotkeyRef = null;
}

const cg = dlopen(
  "/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics",
  {
    CGEventCreateKeyboardEvent: {
      args: [FFIType.ptr, FFIType.u16, FFIType.bool],
      returns: FFIType.ptr,
    },
    CGEventSetFlags: {
      args: [FFIType.ptr, FFIType.u64],
      returns: FFIType.void,
    },
    CGEventPost: { args: [FFIType.i32, FFIType.ptr], returns: FFIType.void },
    CGEventSourceCreate: { args: [FFIType.i32], returns: FFIType.ptr },
  }
);

const CGEventHIDEventTap = 0;
const CGEventFlagMaskControl = 0x40000;

// Space number → key code map (matching original Rust code)
const spaceKeyCode: Record<number, number> = {
  1: 18,
  2: 19,
  3: 20,
  4: 21,
  5: 23,
  6: 22,
  7: 26,
  8: 28,
  9: 25,
  10: 29,
};

export async function switchToSpaceViaKeyboard(
  spaceNumber: number
): Promise<void> {
  const keyCode = spaceKeyCode[spaceNumber];
  if (!keyCode) throw new Error(`No key code for space ${spaceNumber}`);

  const source = cg.symbols.CGEventSourceCreate(1 /* HIDSystemState */);

  const keyDown = cg.symbols.CGEventCreateKeyboardEvent(
    source as any,
    keyCode,
    true
  );
  cg.symbols.CGEventSetFlags(keyDown as any, BigInt(CGEventFlagMaskControl));
  cg.symbols.CGEventPost(CGEventHIDEventTap, keyDown as any);

  await Bun.sleep(18);

  const keyUp = cg.symbols.CGEventCreateKeyboardEvent(
    source as any,
    keyCode,
    false
  );
  cg.symbols.CGEventSetFlags(keyUp as any, BigInt(CGEventFlagMaskControl));
  cg.symbols.CGEventPost(CGEventHIDEventTap, keyUp as any);
}

