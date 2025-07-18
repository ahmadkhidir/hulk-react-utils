/**
 * @fileoverview Higher-Order Component (HOC) for Hulk React Utils
 * 
 * This file provides the main HOC that wraps your React application to enable
 * authentication state management, HTTP request handling, and alert notifications.
 * 
 * @example Basic Usage
 * ```tsx
 * import withHulk from 'hulk-react-utils';
 * import { HulkGlobalConfigProps } from 'hulk-react-utils';
 * 
 * const config: HulkGlobalConfigProps = {
 *   fetchGlobalOptions: {
 *     baseUrl: 'https://api.example.com',
 *     defaultHeaders: { 'Content-Type': 'application/json' }
 *   },
 *   alertGlobalOptions: {
 *     targetId: 'app-alerts',
 *     replaceDuplicates: true
 *   }
 * };
 * 
 * function MyApp({ Component, pageProps }) {
 *   return <Component {...pageProps} />;
 * }
 * 
 * export default withHulk(MyApp, config);
 * ```
 * 
 * @author Hulk React Utils Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useCallback } from "react";
import { HulkContext } from "./context";
import { HulkAuthStateProps, HulkGlobalConfigProps } from "./types";
import { logger } from "./logger";
import { hulkGlobalConfigDefault } from "./configs";

/**
 * Higher-Order Component that provides authentication, fetch, and alert capabilities
 * to your React application through context.
 * 
 * This HOC wraps your root component and provides:
 * - Authentication state management with token and user data
 * - Global fetch configuration for HTTP requests
 * - Alert system for displaying notifications
 * - Automatic DOM element creation for alert rendering
 * 
 * @template P - The props type of the wrapped component
 * @param Component - The React component to wrap (typically your root App component)
 * @param config - Global configuration for Hulk features (optional, uses defaults if not provided)
 * @returns A new component that provides Hulk context to all children
 * 
 * @example With TypeScript interface
 * ```tsx
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 * }
 * 
 * const config: HulkGlobalConfigProps = {
 *   defaultAuthState: {
 *     user: null,
 *     token: undefined
 *   },
 *   fetchGlobalOptions: {
 *     baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
 *     defaultHeaders: {
 *       'Content-Type': 'application/json',
 *       'X-API-Version': 'v1'
 *     },
 *     unauthorizedRedirectUrl: '/login',
 *     accessTokenRetriever: async () => {
 *       const token = localStorage.getItem('authToken');
 *       return token ? { access_token: token } : undefined;
 *     }
 *   },
 *   alertGlobalOptions: {
 *     targetId: 'global-notifications',
 *     replaceDuplicates: true
 *   }
 * };
 * 
 * export default withHulk(App, config);
 * ```
 * 
 * @example Next.js _app.tsx integration
 * ```tsx
 * // pages/_app.tsx
 * import type { AppProps } from 'next/app';
 * import withHulk from 'hulk-react-utils';
 * 
 * function MyApp({ Component, pageProps }: AppProps) {
 *   return (
 *     <>
 *       <div id="app-alerts" /> // Optional: explicit alert container
 *       <Component {...pageProps} />
 *     </>
 *   );
 * }
 * 
 * export default withHulk(MyApp, {
 *   fetchGlobalOptions: {
 *     baseUrl: '/api',
 *     onError: (error, alert) => {
 *       console.error('Global error:', error);
 *     }
 *   },
 *   alertGlobalOptions: {
 *     targetId: 'app-alerts',
 *     replaceDuplicates: false
 *   }
 * });
 * ```
 */
const withHulk =
    <P extends object>(Component: React.ComponentType<P>, config: HulkGlobalConfigProps = hulkGlobalConfigDefault) => {
        /**
         * The enhanced component that provides Hulk context functionality.
         * This component manages authentication state and provides context to all children.
         * 
         * @param props - Props passed to the original component
         * @returns JSX element with Hulk context provider
         */
        return function AuthenticatedComponent(props: P) {
            // Initialize authentication state with default values from config
            // This state will persist throughout the application lifecycle
            const [hulkAuthState, setHulkAuthState] = useState<HulkAuthStateProps<any>>(config.defaultAuthState ?? {});

            /**
             * Updates the authentication state with new token and/or user data.
             * Uses functional state update to merge new data with existing state.
             * 
             * Performance Note: Memoized with useCallback to prevent unnecessary re-renders
             * of components that consume this function via context.
             * 
             * @param data - New authentication data (token and/or user)
             * @param data.token - Optional new token object with access_token
             * @param data.user - Optional new user data of any shape
             * 
             * @example Update token only
             * ```tsx
             * const { auth } = useHulk();
             * auth.update({ 
             *   token: { access_token: 'new-jwt-token' }
             * });
             * ```
             * 
             * @example Update user and token
             * ```tsx
             * auth.update({
             *   token: { access_token: response.token },
             *   user: { id: '123', name: 'John', email: 'john@example.com' }
             * });
             * ```
             */
            // Using useCallback to memoize the updater function
            const update = useCallback((data: HulkAuthStateProps<any>) => {
                logger("Auth updater called with data:", data);
                logger("State data:", hulkAuthState);
                
                // Merge new data with existing state, preserving existing values when new ones are undefined
                setHulkAuthState(prevState => ({
                    token: data.token ?? prevState.token,
                    user: data.user ?? prevState.user,
                }));
            }, []); // Empty dependency array since we use functional state update

            /**
             * Resets the authentication state to the default values specified in config.
             * Useful for logout functionality or clearing corrupted auth state.
             * 
             * Performance Note: Memoized to prevent unnecessary re-renders.
             * 
             * @example Logout functionality
             * ```tsx
             * const handleLogout = () => {
             *   const { auth } = useHulk();
             *   auth.reset();
             *   // Redirect to login page
             *   router.push('/login');
             * };
             * ```
             */
            const reset = useCallback(() => {
                logger("Auth reset called");
                setHulkAuthState(config.defaultAuthState ?? {});
            }, [config.defaultAuthState]); // Depend on config in case it changes

            /**
             * Checks if the user is currently authenticated by verifying the presence
             * of an access token in the authentication state.
             * 
             * Performance Note: Memoized to prevent unnecessary re-renders when used
             * in conditional rendering or effects.
             * 
             * @returns true if user has a valid access token, false otherwise
             * 
             * @example Conditional rendering
             * ```tsx
             * const { auth } = useHulk();
             * 
             * return (
             *   <div>
             *     {auth.isAuthenticated() ? (
             *       <UserDashboard />
             *     ) : (
             *       <LoginForm />
             *     )}
             *   </div>
             * );
             * ```
             * 
             * @example Route protection
             * ```tsx
             * useEffect(() => {
             *   if (!auth.isAuthenticated()) {
             *     router.push('/login');
             *   }
             * }, [auth.isAuthenticated()]);
             * ```
             */
            const isAuthenticated = useCallback(() => {
                return !!hulkAuthState.token?.access_token;
            }, [hulkAuthState.token]); // Re-run when token changes

            /*
             * Render the context provider with all Hulk functionality.
             * 
             * The provider includes:
             * 1. Authentication state and methods (update, reset, isAuthenticated)
             * 2. Global fetch configuration for HTTP requests
             * 3. Global alert configuration for notifications
             * 4. A DOM element for rendering alerts (created automatically)
             */
            return (
                <HulkContext.Provider value={{
                    // Authentication functionality
                    auth: {
                        state: hulkAuthState,         // Current auth state (token + user)
                        update,                       // Function to update auth state
                        reset,                        // Function to reset auth state
                        isAuthenticated              // Function to check authentication status
                    },
                    // Global configurations passed through context
                    fetchGlobalOptions: config.fetchGlobalOptions,    // HTTP request defaults
                    alertGlobalOptions: config.alertGlobalOptions     // Alert system defaults
                }}>
                    {/* 
                        Alert container element - automatically created for alert rendering.
                        This div will be used by the alert system to display notifications.
                        The ID comes from config.alertGlobalOptions.targetId.
                        
                        Note: You can also create this element manually in your HTML/JSX
                        if you need more control over positioning or styling.
                    */}
                    <div id={config.alertGlobalOptions.targetId} />
                    
                    {/* Render the wrapped component with all original props */}
                    <Component {...props} />
                </HulkContext.Provider>
            );
        };
    };

export default withHulk;