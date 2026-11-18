import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import AdminRegistrationsPage from '@/app/admin/registrations/page';
import { registrationAPI } from '@/services/supabaseService';
import { supabase } from '@/lib/supabase';

// Mock supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: { user: { id: 'admin-user-id', email: 'admin@hgbcinfluencers.org' } },
        },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { is_approved: true, role: 'admin' },
            error: null,
          }),
        }),
      }),
    }),
  },
}));

// Mock registrationAPI
vi.mock('@/services/supabaseService', () => ({
  registrationAPI: {
    getAll: vi.fn(),
    getAttendees: vi.fn(),
    updateAttendee: vi.fn(),
    deleteAttendee: vi.fn(),
  },
  adminAPI: {
    getDashboardMetrics: vi.fn(),
  },
  handleApiError: vi.fn((err) => ({ message: err.message || 'Error' })),
}));

// Mock DashboardLayout
vi.mock('@/components/admin/DashboardLayout', () => ({
  default: ({ children }: any) => <div data-testid="mock-dashboard-layout">{children}</div>,
}));

describe('AdminRegistrationsPage Breakout Sessions & Filtering', () => {
  const mockAttendees = [
    {
      id: 'att-1',
      registrationNumber: '0001',
      firstName: 'Faith',
      lastName: 'Adebayo',
      email: 'faith@example.com',
      phone: '+2348011111111',
      paymentStatus: 'paid',
      breakoutSessionChoice: 'Food',
      attendanceMode: 'On-site',
      registrationType: 'standard',
      createdAt: '2026-10-24T00:00:00Z',
    },
    {
      id: 'att-2',
      registrationNumber: '0002',
      firstName: 'Daniel',
      lastName: 'Ojo',
      email: 'daniel@example.com',
      phone: '+2348022222222',
      paymentStatus: 'paid',
      breakoutSessionChoice: 'Real Estate',
      attendanceMode: 'Online',
      registrationType: 'standard',
      createdAt: '2026-10-24T01:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(registrationAPI.getAll).mockResolvedValue({
      success: true,
      data: mockAttendees,
    });
  });

  it('renders the filter dropdown containing the 4 updated breakout tracks', async () => {
    const { container } = render(<AdminRegistrationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Faith Adebayo')).toBeInTheDocument();
    });

    // Locate breakout filter dropdown (3rd select in filter bar)
    const selects = container.querySelectorAll('select');
    const breakoutSelect = Array.from(selects).find((s) =>
      Array.from(s.options).some((o) => o.value === 'Food')
    ) as HTMLSelectElement;

    expect(breakoutSelect).toBeDefined();

    const options = Array.from(breakoutSelect.options).map((o) => o.text);
    expect(options).toContain('All Breakout Masterclasses');
    expect(options).toContain('Food');
    expect(options).toContain('Craft');
    expect(options).toContain('Online Visibility');
    expect(options).toContain('Real Estate');
  });

  it('filters attendees according to selected breakout session', async () => {
    const { container } = render(<AdminRegistrationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Faith Adebayo')).toBeInTheDocument();
      expect(screen.getByText('Daniel Ojo')).toBeInTheDocument();
    });

    // Find the breakout filter select
    const selects = container.querySelectorAll('select');
    const breakoutSelect = Array.from(selects).find((s) =>
      Array.from(s.options).some((o) => o.value === 'Food')
    ) as HTMLSelectElement;

    fireEvent.change(breakoutSelect, { target: { value: 'Food' } });

    await waitFor(() => {
      // Faith Adebayo is in Food track -> visible
      expect(screen.getByText('Faith Adebayo')).toBeInTheDocument();
      // Daniel Ojo is in Real Estate track -> filtered out
      expect(screen.queryByText('Daniel Ojo')).not.toBeInTheDocument();
    });
  });
});
