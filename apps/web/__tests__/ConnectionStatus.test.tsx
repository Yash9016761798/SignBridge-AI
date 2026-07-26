/**
 * Unit tests for ConnectionStatus component.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConnectionStatus from '@/components/ai/ConnectionStatus';

const mockHealth = {
  status: 'healthy',
  model_loaded: true,
  model_version: '1.0.0',
  uptime_seconds: 100,
};

describe('ConnectionStatus', () => {
  it('shows connected status', () => {
    render(<ConnectionStatus status="connected" health={mockHealth} />);
    expect(screen.getByTestId('connection-status')).toHaveTextContent('AI Service Connected');
    expect(screen.getByTestId('connection-status')).toHaveTextContent('v1.0.0');
  });

  it('shows degraded status', () => {
    render(<ConnectionStatus status="degraded" health={mockHealth} />);
    expect(screen.getByTestId('connection-status')).toHaveTextContent('AI Service Degraded');
  });

  it('shows offline status with retry', () => {
    const onRetry = jest.fn();
    render(<ConnectionStatus status="offline" health={null} onRetry={onRetry} />);
    expect(screen.getByTestId('connection-status')).toHaveTextContent('AI Service Offline');

    const retryBtn = screen.getByLabelText('Retry connection');
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows unknown/checking status', () => {
    render(<ConnectionStatus status="unknown" health={null} />);
    expect(screen.getByTestId('connection-status')).toHaveTextContent('Checking AI Service...');
  });

  it('hides retry button when connected', () => {
    render(<ConnectionStatus status="connected" health={mockHealth} onRetry={() => {}} />);
    expect(screen.queryByLabelText('Retry connection')).not.toBeInTheDocument();
  });
});
