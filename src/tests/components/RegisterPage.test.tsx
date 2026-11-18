import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import RegisterPage from '@/app/register/page';

// Mock Navigation and Footer to keep tests lightweight and focused on form behavior
vi.mock('@/components', () => ({
  Navigation: () => <nav data-testid="mock-navigation">Navigation</nav>,
  Footer: () => <footer data-testid="mock-footer">Footer</footer>,
}));

describe('RegisterPage Component Tests', () => {
  it('shows the closed-registration state and no form', () => {
    render(<RegisterPage />);

    expect(screen.getByText(/Registration is temporarily closed/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Proceed to Payment/i })).not.toBeInTheDocument();
  });
});
