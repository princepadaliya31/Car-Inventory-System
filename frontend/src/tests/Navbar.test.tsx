import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

// Mock the useAuth hook to simulate authentication states
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    logout: vi.fn(),
    isLoading: false,
  }),
}));

describe('Navbar Component', () => {
  test('renders brand title and login links for unauthenticated guest', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Verify brand logo exists
    expect(screen.getByText('Apex.')).toBeInTheDocument();

    // Verify dashboard link is visible
    expect(screen.getByText('Inventory')).toBeInTheDocument();

    // Verify guest links exist
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText('Get started')).toBeInTheDocument();
  });
});
