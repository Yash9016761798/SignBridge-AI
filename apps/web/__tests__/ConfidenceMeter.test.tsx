/**
 * Unit tests for ConfidenceMeter component.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import ConfidenceMeter from '@/components/ai/ConfidenceMeter';

describe('ConfidenceMeter', () => {
  it('renders with low confidence', () => {
    render(<ConfidenceMeter value={0.3} />);
    expect(screen.getByTestId('confidence-value')).toHaveTextContent('30%');
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('renders with medium confidence', () => {
    render(<ConfidenceMeter value={0.65} />);
    expect(screen.getByTestId('confidence-value')).toHaveTextContent('65%');
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('renders with high confidence', () => {
    render(<ConfidenceMeter value={0.95} />);
    expect(screen.getByTestId('confidence-value')).toHaveTextContent('95%');
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('clamps values above 1', () => {
    render(<ConfidenceMeter value={1.5} />);
    expect(screen.getByTestId('confidence-value')).toHaveTextContent('100%');
  });

  it('clamps values below 0', () => {
    render(<ConfidenceMeter value={-0.5} />);
    expect(screen.getByTestId('confidence-value')).toHaveTextContent('0%');
  });

  it('hides percentage when showPercentage=false', () => {
    render(<ConfidenceMeter value={0.8} showPercentage={false} />);
    expect(screen.queryByTestId('confidence-value')).not.toBeInTheDocument();
  });

  it('applies sm size class', () => {
    render(<ConfidenceMeter value={0.5} size="sm" />);
    const bar = screen.getByTestId('confidence-bar');
    expect(bar.className).toContain('h-1.5');
  });

  it('applies lg size class', () => {
    render(<ConfidenceMeter value={0.5} size="lg" />);
    const bar = screen.getByTestId('confidence-bar');
    expect(bar.className).toContain('h-4');
  });
});
