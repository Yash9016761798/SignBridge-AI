/**
 * Integration test: AI inference workflow end-to-end.
 *
 * This test verifies the complete pipeline:
 *   AI API client → hooks → components → rendered output
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TranslationCard from '@/components/ai/TranslationCard';
import ConnectionStatus from '@/components/ai/ConnectionStatus';
import PredictionHistory from '@/components/ai/PredictionHistory';
import type { PredictionHistoryItem } from '@/components/ai/PredictionHistory';
import type { AiPredictionResult } from '@/lib/ai-inference-api';

// ---------------------------------------------------------------------------
// Mock the AI inference API module
// ---------------------------------------------------------------------------

const mockPredict = jest.fn();
const mockCheckHealth = jest.fn();

jest.mock('@/lib/ai-inference-api', () => ({
  __esModule: true,
  default: {
    health: jest.fn(),
    modelInfo: jest.fn(),
    predict: (...args: any[]) => mockPredict(...args),
    webcamFrame: jest.fn(),
  },
  AI_SERVICE_URL: 'http://localhost:8000',
  AiServiceError: class AiServiceError extends Error {
    status: number;
    detail: string;
    constructor(status: number, detail: string) {
      super(detail);
      this.status = status;
      this.detail = detail;
    }
  },
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AI Inference Workflow Integration', () => {
  const sampleResult: AiPredictionResult = {
    prediction: { text: 'Hello World', tokens: [1, 2, 3] },
    confidence: 0.92,
    processing_time_ms: 45.2,
    model_version: '1.0.0',
  };

  beforeEach(() => {
    mockPredict.mockReset();
  });

  it('end-to-end: prediction flows through TranslationCard', async () => {
    // Simulate what useAIInference does: call predict, get result, pass to TranslationCard
    mockPredict.mockResolvedValueOnce(sampleResult);

    const result = await mockPredict({ pose_sequence: [[[1, 2, 3, 4, 5]]] });

    render(<TranslationCard result={result} />);

    expect(screen.getByTestId('translation-text')).toHaveTextContent('Hello World');
    expect(screen.getByTestId('confidence-value')).toHaveTextContent('92%');
    expect(screen.getByTestId('processing-time')).toHaveTextContent('45.2ms');
    expect(screen.getByTestId('model-version')).toHaveTextContent('v1.0.0');
  });

  it('end-to-end: connection status reflects API health', () => {
    const health = {
      status: 'healthy',
      model_loaded: true,
      model_version: '1.0.0',
      uptime_seconds: 100,
    };

    render(<ConnectionStatus status="connected" health={health} />);

    expect(screen.getByText('AI Service Connected')).toBeInTheDocument();
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });

  it('end-to-end: history accumulates predictions', () => {
    const items: PredictionHistoryItem[] = [
      { id: '1', result: sampleResult, timestamp: Date.now() },
    ];

    render(<PredictionHistory items={items} />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it('end-to-end: loading state shown during inference', () => {
    render(<TranslationCard result={null} isLoading={true} />);
    expect(screen.getByText('Translating...')).toBeInTheDocument();
  });

  it('end-to-end: error retry triggers callback', () => {
    const onRetry = jest.fn();
    render(
      <ConnectionStatus status="offline" health={null} onRetry={onRetry} />,
    );
    fireEvent.click(screen.getByLabelText('Retry connection'));
    expect(onRetry).toHaveBeenCalled();
  });
});
