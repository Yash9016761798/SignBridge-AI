/**
 * Unit tests for PredictionHistory component.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PredictionHistory from '@/components/ai/PredictionHistory';
import type { PredictionHistoryItem } from '@/components/ai/PredictionHistory';

const mockItems: PredictionHistoryItem[] = [
  {
    id: '1',
    result: {
      prediction: { text: 'Hello', tokens: [1] },
      confidence: 0.95,
      processing_time_ms: 30,
      model_version: '1.0.0',
    },
    timestamp: Date.now() - 1000,
  },
  {
    id: '2',
    result: {
      prediction: { text: 'World', tokens: [2] },
      confidence: 0.8,
      processing_time_ms: 45,
      model_version: '1.0.0',
    },
    timestamp: Date.now(),
  },
];

describe('PredictionHistory', () => {
  it('renders empty state', () => {
    render(<PredictionHistory items={[]} />);
    expect(screen.getByText('No predictions yet.')).toBeInTheDocument();
  });

  it('renders items', () => {
    render(<PredictionHistory items={mockItems} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('World')).toBeInTheDocument();
  });

  it('shows item count', () => {
    render(<PredictionHistory items={mockItems} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('calls onClear when clear button clicked', () => {
    const onClear = jest.fn();
    render(<PredictionHistory items={mockItems} onClear={onClear} />);
    fireEvent.click(screen.getByLabelText('Clear history'));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('hides clear button when empty', () => {
    render(<PredictionHistory items={[]} onClear={() => {}} />);
    expect(screen.queryByLabelText('Clear history')).not.toBeInTheDocument();
  });

  it('respects maxItems', () => {
    render(<PredictionHistory items={mockItems} maxItems={1} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.queryByText('World')).not.toBeInTheDocument();
  });
});
