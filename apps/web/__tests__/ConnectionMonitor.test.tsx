import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConnectionMonitor from '@/components/ai/ConnectionMonitor';

describe('ConnectionMonitor', () => {
  it('renders connection monitor', () => {
    render(
      <ConnectionMonitor
        cameraStatus="idle"
        aiStatus="unknown"
        sessionState="idle"
        aiHealth={null}
      />,
    );
    expect(screen.getByTestId('connection-monitor')).toBeInTheDocument();
    expect(screen.getByText('Connections')).toBeInTheDocument();
  });

  it('shows camera active', () => {
    render(
      <ConnectionMonitor
        cameraStatus="active"
        aiStatus="connected"
        sessionState="running"
        aiHealth={{ status: 'healthy', model_loaded: true, model_version: '1.0.0', uptime_seconds: 100 }}
      />,
    );
    expect(screen.getByTestId('indicator-camera')).toHaveTextContent('Active');
    expect(screen.getByTestId('indicator-ai-service')).toHaveTextContent('Connected');
    expect(screen.getByTestId('indicator-model')).toHaveTextContent('Loaded');
  });

  it('shows camera denied', () => {
    render(
      <ConnectionMonitor
        cameraStatus="denied"
        aiStatus="connected"
        sessionState="idle"
        aiHealth={null}
      />,
    );
    expect(screen.getByText('Denied')).toBeInTheDocument();
  });

  it('shows AI offline', () => {
    render(
      <ConnectionMonitor
        cameraStatus="active"
        aiStatus="offline"
        sessionState="idle"
        aiHealth={null}
      />,
    );
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('shows retry button when AI is offline', () => {
    const onRetry = jest.fn();
    render(
      <ConnectionMonitor
        cameraStatus="active"
        aiStatus="offline"
        sessionState="idle"
        aiHealth={null}
        onRetryAi={onRetry}
      />,
    );
    const retryBtn = screen.getByTestId('btn-retry-ai');
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows model version', () => {
    render(
      <ConnectionMonitor
        cameraStatus="active"
        aiStatus="connected"
        sessionState="running"
        aiHealth={{ status: 'healthy', model_loaded: true, model_version: '2.0.0', uptime_seconds: 50 }}
      />,
    );
    expect(screen.getByText('2.0.0')).toBeInTheDocument();
  });
});
