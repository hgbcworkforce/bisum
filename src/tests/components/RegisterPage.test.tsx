import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import RegisterPage from '@/app/register/page';
import { registrationAPI } from '@/services/supabaseService';

// Mock supabaseService
vi.mock('@/services/supabaseService', () => ({
  registrationAPI: {
    initiate: vi.fn(),
  },
  handleApiError: vi.fn((err) => ({ message: err.message || 'Error occurred' })),
}));

// Mock Navigation and Footer to keep tests lightweight and focused on form behavior
vi.mock('@/components', () => ({
  Navigation: () => <nav data-testid="mock-navigation">Navigation</nav>,
  Footer: () => <footer data-testid="mock-footer">Footer</footer>,
}));

describe('RegisterPage Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the registration form with personal details and payment summary', () => {
    const { container } = render(<RegisterPage />);

    expect(screen.getByText(/Personal & Conference Details/i)).toBeInTheDocument();
    expect(container.querySelector('button[type="submit"]')).toBeInTheDocument();
    expect(screen.getByText(/Conference Admission Pass/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Payable/i)).toBeInTheDocument();
  });

  it('includes all 4 updated breakout session options in the select dropdown', () => {
    const { container } = render(<RegisterPage />);

    const select = container.querySelector('select[name="breakoutSessionChoice"]') as HTMLSelectElement;
    expect(select).toBeInTheDocument();

    const optionValues = Array.from(select.options).map((opt) => opt.value);
    const optionLabels = Array.from(select.options).map((opt) => opt.text);

    expect(optionValues).toContain('Food');
    expect(optionValues).toContain('Craft');
    expect(optionValues).toContain('Online Visibility');
    expect(optionValues).toContain('Real Estate');

    expect(optionLabels).toContain('Food');
    expect(optionLabels).toContain('Craft');
    expect(optionLabels).toContain('Online Visibility');
    expect(optionLabels).toContain('Real Estate');
  });

  it('displays validation errors when submitting an empty form', async () => {
    const { container } = render(<RegisterPage />);

    const submitBtn = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/First name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Phone number is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Please select a breakout session/i)).toBeInTheDocument();
    });

    expect(registrationAPI.initiate).not.toHaveBeenCalled();
  });

  it('submits valid form data including the chosen breakout session and redirects to Paystack', async () => {
    delete (window as any).location;
    window.location = { origin: 'http://localhost:3000', href: '' } as any;

    vi.mocked(registrationAPI.initiate).mockResolvedValue({
      success: true,
      message: 'Success',
      data: {
        authorizationUrl: 'https://checkout.paystack.com/mock-checkout',
        reference: 'BISUM-TX-TEST-123',
      },
    });

    const { container } = render(<RegisterPage />);

    // Fill required inputs
    const firstNameInput = container.querySelector('input[name="firstName"]') as HTMLInputElement;
    const lastNameInput = container.querySelector('input[name="lastName"]') as HTMLInputElement;
    const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement;
    const phoneInput = container.querySelector('input[name="phone"]') as HTMLInputElement;

    fireEvent.change(firstNameInput, { target: { value: 'Samuel' } });
    fireEvent.change(lastNameInput, { target: { value: 'Akin' } });
    fireEvent.change(emailInput, { target: { value: 'samuel@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '+2348011223344' } });

    // Select Gender
    const genderSelect = container.querySelector('select[name="gender"]') as HTMLSelectElement;
    fireEvent.change(genderSelect, { target: { value: 'male' } });

    // Select Age Range
    const ageSelect = container.querySelector('select[name="ageRange"]') as HTMLSelectElement;
    fireEvent.change(ageSelect, { target: { value: '21-25' } });

    // Select Referral Source
    const referralSelect = container.querySelector('select[name="referralSource"]') as HTMLSelectElement;
    fireEvent.change(referralSelect, { target: { value: 'church' } });

    // Select Breakout Session: Online Visibility
    const breakoutSelect = container.querySelector('select[name="breakoutSessionChoice"]') as HTMLSelectElement;
    fireEvent.change(breakoutSelect, { target: { value: 'Online Visibility' } });

    // Submit
    const submitBtn = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(registrationAPI.initiate).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Samuel',
          lastName: 'Akin',
          email: 'samuel@example.com',
          phone: '+2348011223344',
          gender: 'male',
          ageRange: '21-25',
          breakoutSessionChoice: 'Online Visibility',
          amount: 2130, // 2000 + 130 Paystack fee
        })
      );
      expect(window.location.href).toBe('https://checkout.paystack.com/mock-checkout');
    });
  });
});
