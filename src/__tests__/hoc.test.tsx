import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import withHulk from '../hoc';
import { useHulk } from '../hooks';
import { HulkGlobalConfigProps } from '../types';

// Test component that uses the Hulk context
const TestComponent = () => {
  const hulk = useHulk();
  
  return (
    <div>
      <div data-testid="auth-status">
        {hulk.auth.isAuthenticated() ? 'authenticated' : 'not authenticated'}
      </div>
      <div data-testid="base-url">
        {hulk.fetchGlobalOptions.baseUrl || 'no base url'}
      </div>
      <div data-testid="alert-target">
        {hulk.alertGlobalOptions.targetId}
      </div>
      <button
        data-testid="login-btn"
        onClick={() => hulk.auth.update({ 
          token: { access_token: 'test-token' },
          user: { name: 'John Doe' }
        })}
      >
        Login
      </button>
      <button
        data-testid="logout-btn"
        onClick={() => hulk.auth.reset()}
      >
        Logout
      </button>
    </div>
  );
};

describe('withHulk HOC', () => {
  const mockConfig: HulkGlobalConfigProps = {
    fetchGlobalOptions: {
      baseUrl: 'https://api.test.com',
      defaultHeaders: {
        'Content-Type': 'application/json',
      },
    },
    alertGlobalOptions: {
      targetId: 'test-alerts',
      replaceDuplicates: true,
    },
  };

  it('should render component with default context values', () => {
    const WrappedComponent = withHulk(TestComponent);
    render(<WrappedComponent />);

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not authenticated');
    expect(screen.getByTestId('base-url')).toHaveTextContent('no base url');
    expect(screen.getByTestId('alert-target')).toHaveTextContent('hulk-global-alert-target');
  });

  it('should render component with custom config', () => {
    const WrappedComponent = withHulk(TestComponent, mockConfig);
    render(<WrappedComponent />);

    expect(screen.getByTestId('base-url')).toHaveTextContent('https://api.test.com');
    expect(screen.getByTestId('alert-target')).toHaveTextContent('test-alerts');
  });

  it('should create alert target div in DOM', () => {
    const WrappedComponent = withHulk(TestComponent, mockConfig);
    render(<WrappedComponent />);

    const alertTarget = document.getElementById('test-alerts');
    expect(alertTarget).toBeInTheDocument();
  });

  it('should handle authentication state updates', () => {
    const WrappedComponent = withHulk(TestComponent, mockConfig);
    render(<WrappedComponent />);

    // Initially not authenticated
    expect(screen.getByTestId('auth-status')).toHaveTextContent('not authenticated');

    // Login
    fireEvent.click(screen.getByTestId('login-btn'));
    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');

    // Logout
    fireEvent.click(screen.getByTestId('logout-btn'));
    expect(screen.getByTestId('auth-status')).toHaveTextContent('not authenticated');
  });

  it('should handle partial state updates', () => {
    const TestPartialUpdate = () => {
      const hulk = useHulk();
      
      return (
        <div>
          <div data-testid="token">
            {hulk.auth.state.token?.access_token || 'no token'}
          </div>
          <div data-testid="user">
            {hulk.auth.state.user?.name || 'no user'}
          </div>
          <button
            data-testid="update-token"
            onClick={() => hulk.auth.update({ 
              token: { access_token: 'new-token' }
            })}
          >
            Update Token
          </button>
          <button
            data-testid="update-user"
            onClick={() => hulk.auth.update({ 
              user: { name: 'Jane Doe' }
            })}
          >
            Update User
          </button>
        </div>
      );
    };

    const WrappedComponent = withHulk(TestPartialUpdate, mockConfig);
    render(<WrappedComponent />);

    // Update token only
    fireEvent.click(screen.getByTestId('update-token'));
    expect(screen.getByTestId('token')).toHaveTextContent('new-token');
    expect(screen.getByTestId('user')).toHaveTextContent('no user');

    // Update user only (should preserve token)
    fireEvent.click(screen.getByTestId('update-user'));
    expect(screen.getByTestId('token')).toHaveTextContent('new-token');
    expect(screen.getByTestId('user')).toHaveTextContent('Jane Doe');
  });

  it('should handle default auth state from config', () => {
    const configWithDefaultAuth: HulkGlobalConfigProps = {
      ...mockConfig,
      defaultAuthState: {
        token: { access_token: 'default-token' },
        user: { name: 'Default User' }
      }
    };

    const WrappedComponent = withHulk(TestComponent, configWithDefaultAuth);
    render(<WrappedComponent />);

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
  });
});