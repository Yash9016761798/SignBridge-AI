/**
 * Unit tests for TranslationCard component.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import TranslationCard from '@/components/ai/TranslationCard';
import type { AiPredictionResult } from '@/lib/ai-inference-api';

const mockResult: AiPredictionResult = {
  prediction: { text: 'Hello World', tokens: [1, 2, 3] },
  confidence: 0.92,
  processing_time_ms: 45.2,
  model_version: '1.0.0',
};

describe('TranslationCard', () => {
  it('renders loading state', () => {
    render(<TranslationCard result={null} isLoading={true} />);
    expect(screen.getByText('Translating...')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(<TranslationCard result={null} />);
    expect(screen.getByText(/No translation yet/)).toBeInTheDocument();
  });

  it('renders prediction result', () => {
    render(<TranslationCard result={mockResult} />);
    expect(screen.getByTestId('translation-text')).toHaveTextContent('Hello World');
  });

  it('displays processing time', () => {
    render(<TranslationCard result={mockResult} />);
    expect(screen.getByTestId('processing-time')).toHaveTextContent('45.2ms');
  });

  it('displays model version', () => {
    render(<TranslationCard result={mockResult} />);
    expect(screen.getByTestId('model-version')).toHaveTextContent('v1.0.0');
  });

  it('renders confidence meter', () => {
    render(<TranslationCard result={mockResult} />);
    expect(screen.getByTestId('confidence-meter')).toBeInTheDocument();
  });
});
