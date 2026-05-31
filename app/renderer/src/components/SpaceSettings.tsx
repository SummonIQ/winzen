import React, { useState, useCallback, useEffect } from 'react';
import { useStore } from '../store';
import {
  Cog6ToothIcon,
  XMarkIcon,
  QuestionMarkCircleIcon,
  PlusCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { Tabs } from './ui/Tabs';

interface SpaceSettingsProps {
  onClose: () => void;
  onShowSetup?: () => void;
}

const TABS = [
  { id: 'spaces', label: 'Spaces' },
  { id: 'general', label: 'General' },
  { id: 'permissions', label: 'Permissions' },
];

// -- Spaces Tab --
const SpacesTab: React.FC<{ onShowSetup?: () => void; onClose: () => void }> = ({ onShowSetup, onClose }) => {
  const spaces = useStore((state) => state.spaces);
  const updateSpaceName = useStore((state) => state.updateSpaceName);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showCreateHelp, setShowCreateHelp] = useState(false);
  const [aiNamesEnabled, setAiNamesEnabled] = useState(() => {
    return localStorage.getItem('ai_workspace_names') === 'true';
  });

  const handleStartEdit = useCallback((spaceId: string, currentName: string) => {
    setEditingId(spaceId);
    setEditValue(currentName);
  }, []);

  const handleSave = useCallback((spaceId: string) => {
    if (editValue.trim()) {
      updateSpaceName(spaceId, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  }, [editValue, updateSpaceName]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, spaceId: string) => {
    if (e.key === 'Enter') {
      handleSave(spaceId);
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditValue('');
    }
  }, [handleSave]);

  const openMissionControl = useCallback(async () => {
    const script = 'tell application "Mission Control" to activate';
    try {
      await window.electronAPI.runAppleScript(script);
      onClose();
    } catch (error) {
      console.error('Failed to open Mission Control:', error);
    }
  }, [onClose]);

  const toggleAiNames = useCallback(() => {
    const newValue = !aiNamesEnabled;
    setAiNamesEnabled(newValue);
    localStorage.setItem('ai_workspace_names', String(newValue));
  }, [aiNamesEnabled]);

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Click a name to rename it</span>
          <button
            onClick={() => setShowCreateHelp(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
          >
            <PlusCircleIcon className="w-4 h-4" />
            <span>New Space</span>
          </button>
        </div>
        {spaces.map((space) => (
          <div
            key={space.id}
            className="flex items-center space-x-3 bg-white/5 border border-gray-600/20 rounded-lg p-2.5"
          >
            <div className="text-sm text-gray-400 w-16">Space {space.number}</div>
            {editingId === space.id ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, space.id)}
                onBlur={() => handleSave(space.id)}
                className="flex-1 bg-white/10 border border-blue-500/50 rounded px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                autoFocus
              />
            ) : (
              <div
                onClick={() => handleStartEdit(space.id, space.name)}
                className="flex-1 px-3 py-1.5 text-white cursor-pointer hover:bg-white/5 rounded transition-colors"
              >
                {space.name}
              </div>
            )}
          </div>
        ))}
      </div>

      {showCreateHelp && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-semibold text-green-400">How to Create a New Space</h3>
            <button
              onClick={() => setShowCreateHelp(false)}
              className="p-0.5 hover:bg-white/10 rounded"
            >
              <XMarkIcon className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <ol className="text-xs text-green-300 space-y-1 mb-3 ml-4 list-decimal">
            <li>Open Mission Control (swipe up with 3-4 fingers or press F3)</li>
            <li>Move cursor to top of screen until "+" button appears</li>
            <li>Click "+" to create a new desktop/space</li>
            <li>Close this app and reopen to see the new space</li>
          </ol>
          <button
            onClick={openMissionControl}
            className="w-full px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 text-sm font-medium transition-colors"
          >
            Open Mission Control
          </button>
        </div>
      )}

      {/* AI Workspace Names */}
      <div className="mt-4 p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-white">AI Workspace Names</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full">
                PREMIUM
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Automatically generate descriptive names based on open apps and windows
            </p>
          </div>
          <button
            onClick={toggleAiNames}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              aiNamesEnabled ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                aiNamesEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {aiNamesEnabled && (
          <div className="mt-2 text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded p-2">
            AI will suggest names when you switch spaces. You can still edit them manually.
          </div>
        )}
      </div>

      {onShowSetup && (
        <div className="mt-4">
          <button
            onClick={() => {
              onClose();
              onShowSetup();
            }}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm font-medium transition-colors"
          >
            <QuestionMarkCircleIcon className="w-4 h-4" />
            <span>Show Setup Guide</span>
          </button>
        </div>
      )}
    </>
  );
};

// -- General Tab --
const GeneralTab: React.FC = () => {
  const clearScreenshotCache = useStore((state) => state.clearScreenshotCache);
  const displayProfiles = useStore((state) => state.displayProfiles);
  const saveCurrentDisplayProfile = useStore((state) => state.saveCurrentDisplayProfile);
  const applyDisplayProfile = useStore((state) => state.applyDisplayProfile);
  const deleteDisplayProfile = useStore((state) => state.deleteDisplayProfile);
  const [screenshotsCaptureOnSwitch, setScreenshotsCaptureOnSwitch] = useState(() => {
    return localStorage.getItem('screenshots_capture_on_switch') !== 'false';
  });
  const [profileName, setProfileName] = useState('');

  const toggleCaptureOnSwitch = useCallback(() => {
    const newValue = !screenshotsCaptureOnSwitch;
    setScreenshotsCaptureOnSwitch(newValue);
    localStorage.setItem('screenshots_capture_on_switch', String(newValue));
  }, [screenshotsCaptureOnSwitch]);

  const handleSaveDisplayProfile = useCallback(() => {
    if (!profileName.trim()) {
      return;
    }

    saveCurrentDisplayProfile(profileName);
    setProfileName('');
  }, [profileName, saveCurrentDisplayProfile]);

  return (
    <div className="space-y-4">
      {/* Screenshot Settings */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Screenshots</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/5 border border-gray-600/20 rounded-lg">
            <div>
              <div className="text-sm text-white">Capture on space switch</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Automatically screenshot each space when you switch away
              </div>
            </div>
            <button
              onClick={toggleCaptureOnSwitch}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                screenshotsCaptureOnSwitch ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  screenshotsCaptureOnSwitch ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <button
            onClick={clearScreenshotCache}
            className="w-full px-3 py-2 text-sm text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors text-left"
          >
            Clear screenshot cache
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Display Layouts</h3>
        <div className="space-y-3">
          <div className="rounded-lg border border-gray-600/20 bg-white/5 p-3">
            <div className="mb-2 text-sm text-white">Save current monitor setup and space names</div>
            <div className="mb-3 text-xs text-gray-400">
              Winzen will automatically reuse these names when this exact display arrangement comes back.
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveDisplayProfile();
                  }
                }}
                placeholder="Laptop + 2 externals"
                className="flex-1 rounded-lg border border-gray-600/30 bg-white/10 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-500/40"
              />
              <button
                onClick={handleSaveDisplayProfile}
                className="rounded-lg border border-blue-500/30 bg-blue-500/15 px-3 py-2 text-sm text-blue-300 transition-colors hover:bg-blue-500/25"
              >
                Save
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {displayProfiles.length > 0 ? (
              [...displayProfiles]
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-600/20 bg-white/5 p-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm text-white">{profile.name}</div>
                      <div className="text-xs text-gray-400">
                        {profile.spaces.length} named spaces
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => applyDisplayProfile(profile.id)}
                        className="rounded-lg border border-white/10 bg-white/8 px-2.5 py-1.5 text-xs text-white transition-colors hover:bg-white/12"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteDisplayProfile(profile.id)}
                        className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
            ) : (
              <div className="rounded-lg border border-gray-600/20 bg-white/5 p-3 text-xs text-gray-400">
                No saved display layouts yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcut */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Keyboard</h3>
        <div className="p-3 bg-white/5 border border-gray-600/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white">Toggle Winzen</div>
              <div className="text-xs text-gray-400 mt-0.5">Show/hide the Winzen overlay</div>
            </div>
            <kbd className="px-2 py-1 text-xs text-gray-300 bg-gray-700/50 border border-gray-600/30 rounded font-mono">
              ⇧⌘D
            </kbd>
          </div>
        </div>
      </div>

      {/* Data */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Data</h3>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="w-full px-3 py-2 text-sm text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors text-left"
        >
          Reset all settings
        </button>
      </div>
    </div>
  );
};

// -- Permissions Tab --
interface PermissionStatus {
  accessibility: boolean | null;
  screenRecording: boolean | null;
  missionControl: { enabled: boolean; availableSpaces: number[] } | null;
}

const PermissionsTab: React.FC = () => {
  const [status, setStatus] = useState<PermissionStatus>({
    accessibility: null,
    screenRecording: null,
    missionControl: null,
  });
  const [checking, setChecking] = useState(true);

  const checkPermissions = useCallback(async () => {
    setChecking(true);
    try {
      const [accessibility, screenRecording, missionControl] = await Promise.all([
        window.electronAPI.checkAccessibilityPermissions().catch(() => false),
        window.electronAPI.checkScreenRecordingPermission().catch(() => null),
        window.electronAPI.checkMissionControlShortcuts().catch(() => null),
      ]);
      setStatus({ accessibility, screenRecording, missionControl });
    } catch (error) {
      console.error('Failed to check permissions:', error);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const openAccessibilitySettings = useCallback(async () => {
    try {
      await window.electronAPI.runAppleScript(
        'do shell script "open x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"'
      );
    } catch {
      // fallback
    }
  }, []);

  const openScreenRecordingSettings = useCallback(async () => {
    try {
      await window.electronAPI.runAppleScript(
        'do shell script "open x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture"'
      );
    } catch {
      // fallback
    }
  }, []);

  const openKeyboardSettings = useCallback(async () => {
    try {
      await window.electronAPI.openSystemPreferences();
    } catch {
      // fallback
    }
  }, []);

  const PermissionRow: React.FC<{
    label: string;
    description: string;
    granted: boolean | null;
    instructions: string;
    onFix?: () => void;
  }> = ({ label, description, granted, instructions, onFix }) => (
    <div className="p-3 bg-white/5 border border-gray-600/20 rounded-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {granted === null ? (
              <div className="w-5 h-5 rounded-full border-2 border-gray-500 border-t-transparent animate-spin flex-shrink-0" />
            ) : granted ? (
              <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 flex-shrink-0" />
            )}
            <span className="text-sm font-medium text-white">{label}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 ml-7">{description}</p>
          {granted === false && (
            <div className="mt-2 ml-7">
              <p className="text-xs text-amber-300/80 mb-2">{instructions}</p>
              {onFix && (
                <button
                  onClick={onFix}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded transition-colors"
                >
                  <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                  Open Settings
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-gray-400">
          Winzen needs these permissions to manage your spaces and windows.
        </p>
        <button
          onClick={checkPermissions}
          disabled={checking}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
        >
          {checking ? 'Checking...' : 'Recheck'}
        </button>
      </div>

      <PermissionRow
        label="Accessibility"
        description="Required to detect windows, switch spaces, and move windows between spaces."
        granted={status.accessibility}
        instructions="Open System Settings > Privacy & Security > Accessibility, then enable Winzen (or Electron in dev mode). You may need to restart the app."
        onFix={openAccessibilitySettings}
      />

      <PermissionRow
        label="Screen Recording"
        description="Required to capture desktop screenshots for space previews."
        granted={status.screenRecording}
        instructions="Open System Settings > Privacy & Security > Screen Recording, then enable Winzen (or Electron in dev mode). You may need to restart the app."
        onFix={openScreenRecordingSettings}
      />

      <PermissionRow
        label="Mission Control Shortcuts"
        description={
          status.missionControl?.enabled
            ? `Keyboard shortcuts enabled for spaces: ${status.missionControl.availableSpaces.join(', ')}`
            : 'Keyboard shortcuts for switching spaces (Ctrl+1, Ctrl+2, etc.) must be enabled.'
        }
        granted={status.missionControl?.enabled ?? null}
        instructions="Open System Settings > Keyboard > Keyboard Shortcuts > Mission Control, then enable 'Switch to Desktop 1', 'Switch to Desktop 2', etc."
        onFix={openKeyboardSettings}
      />
    </div>
  );
};

// -- Main Settings Component --
const SpaceSettingsComponent: React.FC<SpaceSettingsProps> = ({ onClose, onShowSetup }) => {
  const [activeTab, setActiveTab] = useState('spaces');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-neutral-900/95 to-neutral-950/95 backdrop-blur-xl border border-gray-600/30 rounded-xl p-5 w-[min(560px,calc(100vw-2rem))] max-h-[600px] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Cog6ToothIcon className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <Tabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-4"
          stretch
        />

        <div className="overflow-y-auto flex-1 pr-1">
          {activeTab === 'spaces' && <SpacesTab onShowSetup={onShowSetup} onClose={onClose} />}
          {activeTab === 'general' && <GeneralTab />}
          {activeTab === 'permissions' && <PermissionsTab />}
        </div>
      </div>
    </div>
  );
};

export const SpaceSettings = React.memo(SpaceSettingsComponent);
SpaceSettings.displayName = 'SpaceSettings';
