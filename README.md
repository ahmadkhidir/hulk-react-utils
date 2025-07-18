# Hulk React Utils

A comprehensive React utility library for authentication, fetching, and alert management with Next.js support.

## Features

- 🔐 **Authentication Management** - Built-in auth state management with token handling
- 🌐 **Smart Fetch Hook** - Advanced fetch hook with retry logic, error handling, and auto-authentication
- 🚨 **Alert System** - Flexible alert/notification system with DOM manipulation
- 🎯 **TypeScript Support** - Fully typed for better developer experience
- ⚡ **Next.js Integration** - Seamless integration with Next.js navigation
- 🔄 **Context Provider** - Easy global state management via React Context

## Installation

```bash
npm install hulk-react-utils
# or
yarn add hulk-react-utils
```

## Quick Start

### 1. Wrap your app with the Hulk HOC

```tsx
import React from 'react';
import withHulk, { HulkGlobalConfigProps } from 'hulk-react-utils';

const config: HulkGlobalConfigProps = {
  fetchGlobalOptions: {
    baseUrl: 'https://api.example.com',
    defaultHeaders: {
      'Content-Type': 'application/json',
    },
    unauthorizedRedirectUrl: '/login',
  },
  alertGlobalOptions: {
    targetId: 'app-alerts',
    replaceDuplicates: true,
  }
};

function MyApp(...) {
  return <div>...</div>;
}

export default withHulk(MyApp, config);
```

### 2. Use the hooks in your components

```tsx
import React from 'react';
import { useHulk, useHulkFetch, useHulkAlert } from 'hulk-react-utils';

function UserProfile() {
  const hulk = useHulk();
  const alert = useHulkAlert();
  const { data: user, dispatch: fetchUser } = useHulkFetch<User>('/api/user');

  const handleLogin = async () => {
    await fetchUser();
    if (user) {
      hulk.auth.update({ user, token: { access_token: 'your-token' } });
      alert.push(<div>Welcome back!</div>, { alertId: 'welcome' });
    }
  };

  return (
    <div>
      {hulk.auth.isAuthenticated() ? (
        <p>Hello, {user?.name}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

## API Reference

### Hooks

#### `useHulk()`
Returns the main Hulk context with auth state and global configurations.

#### `useHulkFetch<T>(url: string, options?: HulkFetchOptionsProps)`
Advanced fetch hook with automatic error handling, retries, and authentication.

#### `useHulkAlert()`
Provides push/pop methods for managing alerts in the DOM.

### HOC

#### `withHulk(Component, config)`
Higher-order component that wraps your app with Hulk context.

## Configuration

```typescript
interface HulkGlobalConfigProps {
  defaultAuthState?: HulkAuthStateProps<any>;
  fetchGlobalOptions: HulkFetchGlobalOptionsProps;
  alertGlobalOptions: HulkAlertGlobalOptionsProps;
}
```

## License

MIT © Ahmad Khidir

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.