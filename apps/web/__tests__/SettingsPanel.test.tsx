import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsPanel from '@/components/ai/SettingsPanel';
import type { TranslationSettings } from '@/hooks/useRealtimeTranslation';

const defaultSettings: TranslationSettings = {
  inferenceFps: 5,
  confidenceThreshold: 0.7,
  bufferSize: 30,
  smoothingWindow: 5,
  autoStart: false,
};

describe('SettingsPanel', () => {
  const onUpdate = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders settings panel', () => {
    render(<SettingsPanel settings={defaultSettings} onUpdate={onUpdate} />);
    expect(screen.getByTestId('settings-panel')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders all setting controls', () => {
    render(<SettingsPanel settings={defaultSettings} onUpdate={onUpdate} />);
    expect(screen.getByTestId('setting-inference-fps')).toBeInTheDocument();
    expect(screen.getByTestId('setting-confidence')).toBeInTheDocument();
    expect(screen.getByTestId('setting-buffer')).toBeInTheDocument();
    expect(screen.getByTestId('setting-smoothing')).toBeInTheDocument();
    expect(screen.getByTestId('setting-auto-start')).toBeInTheDocument();
  });

  it('calls onUpdate when inference FPS changes', () => {
    render(<SettingsPanel settings={defaultSettings} onUpdate={onUpdate} />);
    const slider = screen.getByTestId('setting-inference-fps');
    fireEvent.change(slider, { target: { value: '10' } });
    expect(onUpdate).toHaveBeenCalledWith({ inferenceFps: 10 });
  });

  it('calls onUpdate when confidence threshold changes', () => {
    render(<SettingsPanel settings={defaultSettings} onUpdate={onUpdate} />);
    const slider = screen.getByTestId('setting-confidence');
    fireEvent.change(slider, { target: { value: '0.8' } });
    expect(onUpdate).toHaveBeenCalledWith({ confidenceThreshold: 0.8 });
  });

  it('calls onUpdate when auto start toggled', () => {
    render(<SettingsPanel settings={defaultSettings} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByTestId('setting-auto-start'));
    expect(onUpdate).toHaveBeenCalledWith({ autoStart: true });
  });

  it('displays current values', () => {
    render(<SettingsPanel settings={defaultSettings} onUpdate={onUpdate} />);
    expect(screen.getByText('5 FPS')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('30 frames')).toBeInTheDocument();
    expect(screen.getByText('5 predictions')).toBeInTheDocument();
  });
});
