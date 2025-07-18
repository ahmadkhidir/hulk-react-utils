/**
 * @fileoverview Hulk - A React library for simplified HTTP requests and alert management
 * 
 * Hulk provides a comprehensive solution for handling API calls, authentication state,
 * and user notifications in React applications. It includes hooks, HOCs, and utilities
 * to streamline common patterns in web development.
 * 
 * @example
 * ```typescript
 * import { useHulkFetch, withHulk, HulkContext } from 'hulk';
 * 
 * // Using the fetch hook
 * function UserProfile() {
 *   const { data, dispatch } = useHulkFetch<User>('/api/user/profile');
 *   
 *   return (
 *     <div>
 *       {data ? <h1>{data.name}</h1> : <p>Loading...</p>}
 *     </div>
 *   );
 * }
 * 
 * // Using the HOC
 * const EnhancedComponent = withHulk(MyComponent);
 * 
 * // Accessing context directly
 * function MyComponent() {
 *   const hulk = useContext(HulkContext);
 *   // Use hulk.auth, hulk.fetchGlobalOptions, etc.
 * }
 * ```
 * 
 * @version 1.0.0
 * @author Your Team
 * @license MIT
 */

/**
 * Type definitions for the Hulk library.
 * 
 * Includes all TypeScript interfaces and types for:
 * - Authentication state management
 * - HTTP request configuration
 * - Alert system configuration
 * - Hook return types and parameters
 */
export * from './types';

/**
 * React context for sharing Hulk state across components.
 * 
 * Provides access to authentication state, global fetch options,
 * and alert configuration throughout your component tree.
 * 
 * @see HulkContextProps for the shape of the context value
 */
export { HulkContext } from './context';

/**
 * React hooks for interacting with the Hulk library.
 * 
 * - `useHulk`: Access the complete Hulk context (auth, config, etc.)
 * - `useHulkAlert`: Manage alerts and notifications
 * - `useHulkFetch`: Perform HTTP requests with built-in state management
 * 
 * @example
 * ```typescript
 * // Fetch data from an API
 * const { data, dispatch } = useHulkFetch<User[]>('/api/users');
 * 
 * // Show notifications
 * const alert = useHulkAlert();
 * alert.push(<SuccessMessage />, { alertId: 'success' });
 * 
 * // Access authentication
 * const { auth } = useHulk();
 * if (auth.isAuthenticated()) {
 *   // User is logged in
 * }
 * ```
 */
export { useHulk, useHulkAlert, useHulkFetch } from './hooks';

/**
 * Higher-Order Component for injecting Hulk functionality.
 * 
 * Wraps components to provide access to Hulk context via props.
 * Useful for class components or when you prefer prop injection over hooks.
 * 
 * @example
 * ```typescript
 * interface Props {
 *   hulk: HulkContextProps;
 *   // your other props
 * }
 * 
 * function MyComponent({ hulk, ...otherProps }: Props) {
 *   // Access hulk.auth, hulk.fetchGlobalOptions, etc.
 *   return <div>...</div>;
 * }
 * 
 * export default withHulk(MyComponent);
 * ```
 */
export { default as withHulk } from './hoc';

/**
 * Utility functions and helper methods.
 * 
 * Includes functions for:
 * - Error parsing and handling
 * - Request preprocessing
 * - Response transformation
 * - Authentication helpers
 */
export * from './helpers';

/**
 * Default configuration objects and presets.
 * 
 * Exports `hulkGlobalConfigDefault` which provides sensible defaults
 * for HTTP requests and alert management. Can be customized or extended
 * based on your application's needs.
 * 
 * @see hulkGlobalConfigDefault for the complete default configuration
 */
export * from './configs';

/**
 * Logging utility for debugging and development.
 * 
 * Provides structured logging for Hulk operations, useful for
 * debugging API calls, authentication flows, and alert management.
 * 
 * @example
 * ```typescript
 * import { logger } from 'hulk';
 * 
 * logger.info('User authenticated successfully');
 * logger.error('API request failed', { url, error });
 * ```
 */
export { logger } from './logger';