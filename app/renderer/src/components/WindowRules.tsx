import React, { useState } from 'react';
import { useStore } from '../store';
import { PlusIcon, TrashIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

export const WindowRules: React.FC = () => {
  const { rules, desktops, addRule, removeRule } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRule, setNewRule] = useState({
    appName: '',
    desktopId: '',
    ruleType: 'assign' as 'assign' | 'follow',
    followAppName: '',
  });

  const handleAddRule = () => {
    if (newRule.appName && (newRule.desktopId || newRule.followAppName)) {
      addRule(newRule);
      setNewRule({
        appName: '',
        desktopId: '',
        ruleType: 'assign',
        followAppName: '',
      });
      setShowAddForm(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Window Rules</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-500/20"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Rule</span>
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 bg-gradient-to-br from-neutral-900/40 to-neutral-950/60 backdrop-blur-xl border border-neutral-700/30 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-white mb-4">
            Create New Rule
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Application Name
              </label>
              <input
                type="text"
                value={newRule.appName}
                onChange={(e) => setNewRule({ ...newRule, appName: e.target.value })}
                placeholder="e.g., Chrome, Slack, Terminal"
                className="block w-full bg-neutral-800/60 border border-neutral-700/40 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rule Type
              </label>
              <select
                value={newRule.ruleType}
                onChange={(e) => setNewRule({ ...newRule, ruleType: e.target.value as 'assign' | 'follow' })}
                className="block w-full bg-neutral-800/60 border border-neutral-700/40 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
              >
                <option value="assign">Assign to Desktop</option>
                <option value="follow">Follow Another App</option>
              </select>
            </div>

            {newRule.ruleType === 'assign' ? (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Desktop
                </label>
                <select
                  value={newRule.desktopId}
                  onChange={(e) => setNewRule({ ...newRule, desktopId: e.target.value })}
                  className="block w-full bg-neutral-800/60 border border-neutral-700/40 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                >
                  <option value="">Select desktop...</option>
                  {desktops.map((desktop) => (
                    <option key={desktop.id} value={desktop.id}>
                      {desktop.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Follow Application
                </label>
                <input
                  type="text"
                  value={newRule.followAppName}
                  onChange={(e) => setNewRule({ ...newRule, followAppName: e.target.value })}
                  placeholder="e.g., Chrome"
                  className="block w-full bg-neutral-800/60 border border-neutral-700/40 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder-gray-500"
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleAddRule}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600/80 hover:bg-blue-600 rounded-lg transition-colors"
              >
                Add Rule
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/40 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <Cog6ToothIcon className="w-16 h-16 mb-4 text-blue-500/50" />
          <h3 className="text-lg font-semibold text-white mb-2">No Rules Configured</h3>
          <p className="text-sm text-gray-400 max-w-xs">
            Create rules to automatically manage window placement across desktops
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="bg-gradient-to-br from-neutral-900/40 to-neutral-950/60 backdrop-blur-xl border border-neutral-700/30 rounded-lg p-4 hover:border-neutral-600/40 transition-all flex items-center justify-between"
            >
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  {rule.appName}
                </h3>
                <p className="text-xs text-gray-400">
                  {rule.ruleType === 'assign'
                    ? `Always open in ${desktops.find((d) => d.id === rule.desktopId)?.name || 'Unknown Desktop'}`
                    : `Follow ${rule.followAppName}`}
                </p>
              </div>
              <button
                onClick={() => removeRule(rule.id)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
