import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import TranslationPanel from '@/components/ai/TranslationPanel';

describe('TranslationPanel', () => {
  it('renders empty state', () => {
    render(
      <TranslationPanel
        translation=""
        confidence={0}
        latency={0}
        isNew={false}
        fps={0}
        totalFrames={0}
        sessionDuration={0}
      />,
    );
    expect(screen.getByTestId('translation-panel')).toBeInTheDocument();
    expect(screen.getByText('Start translation to see live results.')).toBeInTheDocument();
  });

  it('renders translation text', () => {
    render(
      <TranslationPanel
        translation="Hello World"
        confidence={0.85}
        latency={45}
        isNew={true}
        fps={5}
        totalFrames={100}
        sessionDuration={20}
        modelVersion="1.0.0"
      />,
    );
    expect(screen.getByTestId('live-translation-text')).toHaveTextContent('Hello World');
  });

  it('shows latency', () => {
    render(
      <TranslationPanel
        translation="Test"
        confidence={0.9}
        latency={32}
        isNew={false}
        fps={5}
        totalFrames={50}
        sessionDuration={10}
      />,
    );
    expect(screen.getByTestId('live-latency')).toHaveTextContent('32ms');
  });

  it('shows FPS', () => {
    render(
      <TranslationPanel
        translation="Test"
        confidence={0.9}
        latency={32}
        isNew={false}
        fps={7}
        totalFrames={50}
        sessionDuration={10}
      />,
    );
    expect(screen.getByTestId('live-fps')).toHaveTextContent('7 FPS');
  });

  it('shows model version', () => {
    render(
      <TranslationPanel
        translation="Test"
        confidence={0.9}
        latency={32}
        isNew={false}
        fps={5}
        totalFrames={50}
        sessionDuration={10}
        modelVersion="2.0.0"
      />,
    );
    expect(screen.getByTestId('live-model')).toHaveTextContent('v2.0.0');
  });

  it('shows frame count', () => {
    render(
      <TranslationPanel
        translation="Test"
        confidence={0.9}
        latency={32}
        isNew={false}
        fps={5}
        totalFrames={200}
        sessionDuration={10}
      />,
    );
    expect(screen.getByTestId('live-frames')).toHaveTextContent('200 frames');
  });

  it('shows loading state', () => {
    render(
      <TranslationPanel
        translation=""
        confidence={0}
        latency={0}
        isNew={false}
        fps={0}
        totalFrames={0}
        sessionDuration={0}
        isLoading={true}
      />,
    );
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });
});
