import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import PerformanceDashboard from '@/components/ai/PerformanceDashboard';
import type { PerformanceMetrics } from '@/hooks/usePerformanceMetrics';

const zeroMetrics: PerformanceMetrics = {
  cameraFps: 0,
  inferenceFps: 0,
  avgLatency: 0,
  avgConfidence: 0,
  droppedFrames: 0,
  totalFrames: 0,
  totalInferences: 0,
  acceptedPredictions: 0,
  sessionDuration: 0,
};

describe('PerformanceDashboard', () => {
  it('renders performance dashboard', () => {
    render(<PerformanceDashboard metrics={zeroMetrics} />);
    expect(screen.getByTestId('performance-dashboard')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
  });

  it('displays metrics', () => {
    const metrics: PerformanceMetrics = {
      cameraFps: 10,
      inferenceFps: 5,
      avgLatency: 45,
      avgConfidence: 0.82,
      droppedFrames: 3,
      totalFrames: 500,
      totalInferences: 100,
      acceptedPredictions: 85,
      sessionDuration: 60,
    };

    render(<PerformanceDashboard metrics={metrics} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('45ms')).toBeInTheDocument();
    expect(screen.getByText('82%')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('shows session duration in footer', () => {
    const metrics: PerformanceMetrics = {
      ...zeroMetrics,
      totalInferences: 50,
      acceptedPredictions: 40,
      sessionDuration: 125,
    };

    render(<PerformanceDashboard metrics={metrics} />);
    expect(screen.getByText('Inferences: 50')).toBeInTheDocument();
    expect(screen.getByText('Accepted: 40')).toBeInTheDocument();
    expect(screen.getByText('Session: 125s')).toBeInTheDocument();
  });
});
