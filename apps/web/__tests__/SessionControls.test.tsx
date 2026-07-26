import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SessionControls from '@/components/ai/SessionControls';

describe('SessionControls', () => {
  const defaultProps = {
    onStart: jest.fn(),
    onPause: jest.fn(),
    onResume: jest.fn(),
    onStop: jest.fn(),
    onReset: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders Start button when idle', () => {
    render(<SessionControls sessionState="idle" {...defaultProps} />);
    expect(screen.getByTestId('btn-start')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  it('renders Pause button when running', () => {
    render(<SessionControls sessionState="running" {...defaultProps} />);
    expect(screen.getByTestId('btn-pause')).toBeInTheDocument();
    expect(screen.getByText('Running')).toBeInTheDocument();
  });

  it('renders Resume button when paused', () => {
    render(<SessionControls sessionState="paused" {...defaultProps} />);
    expect(screen.getByTestId('btn-resume')).toBeInTheDocument();
    expect(screen.getByText('Paused')).toBeInTheDocument();
  });

  it('renders Stop and Reset when running', () => {
    render(<SessionControls sessionState="running" {...defaultProps} />);
    expect(screen.getByTestId('btn-stop')).toBeInTheDocument();
    expect(screen.getByTestId('btn-reset')).toBeInTheDocument();
  });

  it('calls onStart when Start clicked', () => {
    render(<SessionControls sessionState="idle" {...defaultProps} />);
    fireEvent.click(screen.getByTestId('btn-start'));
    expect(defaultProps.onStart).toHaveBeenCalledTimes(1);
  });

  it('calls onPause when Pause clicked', () => {
    render(<SessionControls sessionState="running" {...defaultProps} />);
    fireEvent.click(screen.getByTestId('btn-pause'));
    expect(defaultProps.onPause).toHaveBeenCalledTimes(1);
  });

  it('calls onResume when Resume clicked', () => {
    render(<SessionControls sessionState="paused" {...defaultProps} />);
    fireEvent.click(screen.getByTestId('btn-resume'));
    expect(defaultProps.onResume).toHaveBeenCalledTimes(1);
  });

  it('calls onStop when Stop clicked', () => {
    render(<SessionControls sessionState="running" {...defaultProps} />);
    fireEvent.click(screen.getByTestId('btn-stop'));
    expect(defaultProps.onStop).toHaveBeenCalledTimes(1);
  });

  it('calls onReset when Reset clicked', () => {
    render(<SessionControls sessionState="idle" {...defaultProps} />);
    fireEvent.click(screen.getByTestId('btn-reset'));
    expect(defaultProps.onReset).toHaveBeenCalledTimes(1);
  });
});
