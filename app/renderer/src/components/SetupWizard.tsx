import React, { useState } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { SquaresExclude } from 'lucide-react';

interface SetupWizardProps {
  onComplete: () => void;
}

const buttonBaseClass =
  'relative inline-flex items-center justify-center overflow-hidden rounded-md border border-white/10 border-t-white/20 border-b-0 px-3 py-1.5 text-xs font-medium shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)] transition-all duration-200';

const secondaryButtonClass = `${buttonBaseClass} bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-gray-200`;
const primaryButtonClass =
  `${buttonBaseClass} bg-[linear-gradient(135deg,rgba(79,70,229,0.95),rgba(37,99,235,0.92)_58%,rgba(29,78,216,0.98))] text-white hover:brightness-110`;

const AppLogo: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={`relative rounded-lg bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center overflow-hidden ${className ?? ''}`}
  >
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 to-black/15" />
    <SquaresExclude className="relative z-10 w-8 h-8 text-white" />
  </div>
);

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [detectedSpaces, setDetectedSpaces] = useState<number[]>([]);

  const handleOpenSystemPreferences = async () => {
    await window.electronAPI.openSystemPreferences();
  };

  const handleValidateShortcuts = async () => {
    setValidating(true);
    setValidationError(null);

    try {
      const result = await window.electronAPI.checkMissionControlShortcuts();

      if (result.enabled && result.availableSpaces.length > 0) {
        setDetectedSpaces(result.availableSpaces);
        setValidationError(null);
        return true;
      } else {
        setDetectedSpaces([]);
        setValidationError(
          `No Mission Control shortcuts detected. Please enable at least one "Switch to Desktop" shortcut in System Settings.`
        );
        return false;
      }
    } catch (error) {
      console.error('Validation error:', error);
      setDetectedSpaces([]);
      setValidationError('Failed to validate shortcuts. Please try again.');
      return false;
    } finally {
      setValidating(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      // If already validated on this step, let the user continue.
      if (detectedSpaces.length > 0) {
        setCurrentStep(currentStep + 1);
        return;
      }

      const isValid = await handleValidateShortcuts();
      if (!isValid) {
        return;
      }

      // Stay on this step so detected shortcuts are immediately visible.
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleSkip = () => {
    localStorage.setItem('setup_completed', 'true');
    onComplete();
  };

  const steps = [
    {
      title: 'Welcome to Winzen!',
      description:
        'Before you can use this app, you need to enable Mission Control keyboard shortcuts. This app uses macOS Mission Control keyboard shortcuts to switch between Spaces.',
      icon: <AppLogo className="w-14 h-14 mb-3" />,
      content: null,
    },
    {
      title: 'Enable Mission Control Shortcuts',
      description: 'Follow these steps to enable keyboard shortcuts for switching Spaces:',
      icon: <ExclamationTriangleIcon className="w-12 h-12 text-yellow-400 mb-3" />,
      content: (
        <div className="space-y-4">
          <div className="bg-neutral-800/60 rounded-lg p-4 space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                1
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Open System Preferences</p>
                <p className="text-sm text-gray-400">Click the button below to open it automatically</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                2
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Click on Keyboard</p>
                <p className="text-sm text-gray-400">Then click &quot;Keyboard Shortcuts...&quot; button</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                3
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Select Mission Control</p>
                <p className="text-sm text-gray-400">In the left sidebar, click on &quot;Mission Control&quot;</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                4
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Enable Desktop Shortcuts</p>
                <p className="text-sm text-gray-400">
                  Check the boxes for &quot;Switch to Desktop 1&quot; (^1), &quot;Switch to Desktop 2&quot; (^2), etc. Make sure all checkboxes show blue checkmarks.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                5
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Close System Preferences</p>
                <p className="text-sm text-gray-400">Return to this app and click &quot;I&apos;m Done&quot;</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenSystemPreferences}
            className={`w-full ${primaryButtonClass}`}
          >
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.06)_42%,rgba(0,0,0,0.16)_100%)]" />
            <span className="relative flex items-center justify-center space-x-2">
              <Cog6ToothIcon className="w-4 h-4" />
              <span>Open System Preferences</span>
            </span>
          </button>

          {detectedSpaces.length === 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-sm text-yellow-400">
                Important: You need to enable at least the shortcuts for the Spaces you want to use (usually 1-4).
              </p>
            </div>
          )}

          {validationError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-sm text-red-400">{validationError}</p>
            </div>
          )}

          {detectedSpaces.length > 0 && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-sm text-green-400">
                Detected shortcuts for {detectedSpaces.length} space{detectedSpaces.length !== 1 ? 's' : ''}: {detectedSpaces.join(', ')}
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'All Set!',
      description: "You're ready to start using Winzen",
      icon: <CheckCircleIcon className="w-12 h-12 text-green-400 mb-3" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Mission Control shortcuts should now be enabled. You can start using Winzen!
          </p>

          <div className="bg-neutral-800/60 rounded-lg p-4 space-y-3">
            <h4 className="text-white font-medium mb-2">Quick Tips:</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start space-x-2">
                <span className="text-blue-400">•</span>
                <span>Press <kbd className="px-2 py-1 bg-neutral-700 rounded text-xs">⇧⌘D</kbd> to toggle the app</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-400">•</span>
                <span>Type to search for Spaces by name</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-400">•</span>
                <span>Press <kbd className="px-2 py-1 bg-neutral-700 rounded text-xs">⌘,</kbd> to rename Spaces</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-400">•</span>
                <span>Press <kbd className="px-2 py-1 bg-neutral-700 rounded text-xs">⌘C</kbd> to manage Window Containers</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-sm text-green-400">
              You can always re-open this guide from the Settings menu if you need help later.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-[28px] overflow-hidden">
      <div className="relative bg-gradient-to-br from-neutral-900/95 to-neutral-950/98 border border-white/[0.1] border-t-white/[0.18] border-l-white/[0.08] border-r-white/[0.035] border-b-white/[0.025] rounded-2xl w-[90%] max-w-[560px] h-[min(85vh,620px)] overflow-hidden flex flex-col">
        {/* Step Indicator — top */}
        <div className="flex justify-center space-x-2 pt-7 pb-12">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 bg-[linear-gradient(135deg,#4F46E5,#2563EB)]'
                  : index < currentStep
                  ? 'w-1.5 bg-green-500'
                  : 'w-1.5 bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 pb-8 flex flex-col">
          {/* Icon + Title */}
          <div className={`flex flex-col items-center ${currentStep === 0 ? 'my-auto' : 'mb-6'}`}>
            {currentStepData.icon}
            <h2 className="text-xl font-bold text-white mb-2">{currentStepData.title}</h2>
            <p className="text-gray-400 text-center text-sm">{currentStepData.description}</p>
          </div>

          {/* Content */}
          {currentStepData.content && <div className="mb-8">{currentStepData.content}</div>}

          {/* Navigation — centered */}
          <div className="flex items-center justify-center gap-3 mt-10">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className={secondaryButtonClass}
              >
                Back
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <>
                <button
                  onClick={handleSkip}
                  className={secondaryButtonClass}
                >
                  Skip Setup
                </button>
                <button
                  onClick={handleNext}
                  disabled={validating}
                  className={`${primaryButtonClass} disabled:bg-gray-600 disabled:text-white/70 disabled:hover:brightness-100`}
                >
                  <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.06)_42%,rgba(0,0,0,0.16)_100%)]" />
                  <span className="relative">{validating ? 'Checking...' : currentStep === 0 ? "Let's Go!" : currentStep === 1 && detectedSpaces.length > 0 ? 'Continue' : "I'm Done"}</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleSkip}
                className={primaryButtonClass}
              >
                <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.06)_42%,rgba(0,0,0,0.16)_100%)]" />
                <span className="relative">Start Using Winzen</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
