import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store';
import { shallow } from 'zustand/shallow';
import { XMarkIcon, RectangleGroupIcon, PlusIcon, TrashIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface ContainerManagerProps {
  onClose: () => void;
}

const ContainerManagerComponent: React.FC<ContainerManagerProps> = ({ onClose }) => {
  const {
    windows,
    containers,
    spaces,
    loadWindows,
    createContainer,
    deleteContainer,
    moveContainer,
  } = useStore(
    (state) => ({
      windows: state.windows,
      containers: state.containers,
      spaces: state.spaces,
      loadWindows: state.loadWindows,
      createContainer: state.createContainer,
      deleteContainer: state.deleteContainer,
      moveContainer: state.moveContainer,
    }),
    shallow
  );
  const [selectedWindows, setSelectedWindows] = useState<string[]>([]);
  const [containerName, setContainerName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadWindows();
  }, [loadWindows]);

  const handleToggleWindow = useCallback((windowId: string) => {
    setSelectedWindows(prev =>
      prev.includes(windowId)
        ? prev.filter(id => id !== windowId)
        : [...prev, windowId]
    );
  }, []);

  const handleCreateContainer = useCallback(async () => {
    if (containerName.trim() && selectedWindows.length >= 2) {
      await createContainer(containerName.trim(), selectedWindows);
      setContainerName('');
      setSelectedWindows([]);
      setShowCreateForm(false);
    }
  }, [containerName, selectedWindows, createContainer]);

  const handleMoveContainer = useCallback(async (containerId: string, spaceId: string) => {
    await moveContainer(containerId, spaceId);
  }, [moveContainer]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-neutral-900/95 to-neutral-950/95 backdrop-blur-xl border border-gray-600/30 rounded-xl p-6 w-[700px] max-h-[700px] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <RectangleGroupIcon className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Window Containers</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Existing Containers */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Active Containers</h3>
          {containers.length === 0 ? (
            <div className="text-center py-8 bg-white/5 rounded-lg border border-gray-600/20">
              <p className="text-gray-400 text-sm">No containers yet. Create one below!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {containers.map((container) => (
                <div
                  key={container.id}
                  className="bg-white/5 border border-gray-600/20 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">{container.name}</h4>
                      <p className="text-xs text-gray-400">
                        {container.windows.length} windows
                        {container.spaceId && ` • Space ${container.spaceId}`}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteContainer(container.id)}
                      className="p-2 hover:bg-red-500/20 rounded transition-colors"
                      title="Delete container"
                    >
                      <TrashIcon className="w-4 h-4 text-red-400" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      onChange={(e) => handleMoveContainer(container.id, e.target.value)}
                      className="flex-1 bg-neutral-800/60 border border-neutral-700/40 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Move to space...
                      </option>
                      {spaces.map((space) => (
                        <option key={space.id} value={space.id} className="bg-neutral-800">
                          {space.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Container */}
        <div>
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors"
            >
              <PlusIcon className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-medium">Create New Container</span>
            </button>
          ) : (
            <div className="bg-white/5 border border-gray-600/20 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Create Container</h3>

              <input
                type="text"
                value={containerName}
                onChange={(e) => setContainerName(e.target.value)}
                placeholder="Container name..."
                className="w-full bg-white/10 border border-gray-600/30 rounded-lg px-3 py-2 mb-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />

              <p className="text-xs text-gray-400 mb-3">
                Select at least 2 windows to group together:
              </p>

              <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
                {windows.map((window) => (
                  <label
                    key={window.id}
                    className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                      selectedWindows.includes(window.id)
                        ? 'bg-blue-500/20 border border-blue-500/40'
                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedWindows.includes(window.id)}
                      onChange={() => handleToggleWindow(window.id)}
                      className="w-4 h-4 rounded border-gray-600 bg-neutral-800 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
                    />
                    <div className="flex-1">
                      <div className="text-sm text-white">{window.title}</div>
                      <div className="text-xs text-gray-400">{window.app}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setSelectedWindows([]);
                    setContainerName('');
                  }}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-gray-600/30 rounded-lg text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateContainer}
                  disabled={selectedWindows.length < 2 || !containerName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-blue-400/20 border-t-blue-200/30 bg-blue-500/[0.1] p-4 shadow-[0_20px_36px_-24px_rgba(0,0,0,0.7)]">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-blue-300/15 border-t-blue-200/30 bg-blue-400/10 p-2">
              <InformationCircleIcon className="h-5 w-5 text-blue-200" />
            </div>
            <p className="text-sm leading-6 text-blue-100/85">
              Containers group windows together. Moving a container to another space moves its windows as a group while preserving their relative positions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContainerManager = React.memo(ContainerManagerComponent);
ContainerManager.displayName = 'ContainerManager';
