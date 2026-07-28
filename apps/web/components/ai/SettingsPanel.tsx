'use client';

import React from 'react';
import { Settings, Camera, Gauge, Layers, Sparkles, Play } from 'lucide-react';
import type { TranslationSettings } from '@/hooks/useRealtimeTranslation';

export interface SettingsPanelProps {
  settings: TranslationSettings;
  onUpdate: (patch: Partial<TranslationSettings>) => void;
  disabled?: boolean;
  className?: string;
}

export default function SettingsPanel({
  settings,
  onUpdate,
  disabled = false,
  className = '',
}: SettingsPanelProps) {
  return (
    <div
      className={`rounded-card border border-surface-200 bg-white shadow-card dark:border-surface-700 dark:bg-surface-900 ${className}`}
      data-testid="settings-panel"
    >
      <div className="flex items-center gap-2 border-b border-surface-100 px-5 py-3 dark:border-surface-800">
        <Settings className="h-4 w-4 text-surface-500" />
        <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Settings</h3>
      </div>

      <div className="space-y-4 px-5 py-4">
        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-surface-700 dark:text-surface-300">
            <Gauge className="h-3 w-3" />
            Inference FPS
          </label>
          <input
            type="range"
            min={1}
            max={15}
            step={1}
            value={settings.inferenceFps}
            onChange={(e) => onUpdate({ inferenceFps: Number(e.target.value) })}
            disabled={disabled}
            className="w-full accent-warning-500"
            data-testid="setting-inference-fps"
          />
          <span className="text-xs text-surface-500">{settings.inferenceFps} FPS</span>
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-surface-700 dark:text-surface-300">
            <Sparkles className="h-3 w-3" />
            Confidence Threshold
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.confidenceThreshold}
            onChange={(e) => onUpdate({ confidenceThreshold: Number(e.target.value) })}
            disabled={disabled}
            className="w-full accent-warning-500"
            data-testid="setting-confidence"
          />
          <span className="text-xs text-surface-500">
            {Math.round(settings.confidenceThreshold * 100)}%
          </span>
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-surface-700 dark:text-surface-300">
            <Layers className="h-3 w-3" />
            Buffer Size
          </label>
          <input
            type="range"
            min={5}
            max={60}
            step={5}
            value={settings.bufferSize}
            onChange={(e) => onUpdate({ bufferSize: Number(e.target.value) })}
            disabled={disabled}
            className="w-full accent-warning-500"
            data-testid="setting-buffer"
          />
          <span className="text-xs text-surface-500">{settings.bufferSize} frames</span>
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-surface-700 dark:text-surface-300">
            <Sparkles className="h-3 w-3" />
            Smoothing Window
          </label>
          <input
            type="range"
            min={1}
            max={15}
            step={1}
            value={settings.smoothingWindow}
            onChange={(e) => onUpdate({ smoothingWindow: Number(e.target.value) })}
            disabled={disabled}
            className="w-full accent-warning-500"
            data-testid="setting-smoothing"
          />
          <span className="text-xs text-surface-500">{settings.smoothingWindow} predictions</span>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-medium text-surface-700 dark:text-surface-300">
            <Play className="h-3 w-3" />
            Auto Start
          </label>
          <button
            type="button"
            role="switch"
            aria-checked={settings.autoStart}
            onClick={() => onUpdate({ autoStart: !settings.autoStart })}
            disabled={disabled}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              settings.autoStart ? 'bg-warning-500' : 'bg-surface-200 dark:bg-surface-700'
            }`}
            data-testid="setting-auto-start"
          >
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                settings.autoStart ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
