import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import CountdownTimer from '@/components/CountdownTimer';

describe('CountdownTimer Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders all 4 time segments: Days, Hours, Mins, Secs', () => {
    // 2 days in the future
    const now = new Date('2026-11-10T12:00:00Z');
    vi.setSystemTime(now);

    const targetDate = new Date('2026-11-12T12:00:00Z');
    render(<CountdownTimer targetDate={targetDate} />);

    expect(screen.getByText('Days')).toBeInTheDocument();
    expect(screen.getByText('Hours')).toBeInTheDocument();
    expect(screen.getByText('Mins')).toBeInTheDocument();
    expect(screen.getByText('Secs')).toBeInTheDocument();

    expect(screen.getByText('02')).toBeInTheDocument();
  });

  it('displays 00:00:00:00 when target date is already in the past', () => {
    const now = new Date('2026-11-20T12:00:00Z');
    vi.setSystemTime(now);

    const pastDate = new Date('2026-11-10T12:00:00Z');
    render(<CountdownTimer targetDate={pastDate} />);

    const zeroes = screen.getAllByText('00');
    expect(zeroes.length).toBeGreaterThanOrEqual(4);
  });
});
