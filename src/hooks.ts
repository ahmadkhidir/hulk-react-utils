/**
 * @fileoverview Hulk React Hooks
 * 
 * This file contains React hooks for the Hulk library, providing:
 * - Data fetching with authentication and error handling
 * - Alert management system
 * - Cross-platform navigation utilities
 * 
 * The hooks are designed to work in both Next.js and vanilla React environments,
 * with automatic fallbacks for framework-specific features.
 * 
 * @author Hulk Development Team
 * @version 1.0.0
 */

"use client";

import React, { ReactNode, useContext } from "react";
import { useState, useCallback } from "react";
import { HulkFetchProps, HulkFetchResponseProps, HulkFetchOptionsProps, HulkContextProps, HulkAlertProps, HulkAlertOptionsProps, HulkAlertPushProps, HulkAlertPopProps } from "./types";
import { HulkContext } from "./context";
import { logger } from "./logger";

/**
 * NAVIGATION UTILITIES
 * 
 * These utilities provide cross-platform navigation functionality
 * with automatic detection and fallbacks for Next.js features.
 */

// Module-level variables to store Next.js navigation functions
let nextRedirect: ((url: string) => void) | undefined;
let nextUsePathname: (() => string) | undefined;

/**
 * Attempt to import Next.js navigation functions at module load time.
 * This approach prevents runtime errors in non-Next.js environments
 * while enabling enhanced functionality when Next.js is available.
 */
try {
    const nextNav = require('next/navigation');
    nextRedirect = nextNav.redirect;
    nextUsePathname = nextNav.usePathname;
} catch {
    // Next.js not available - hooks will fall back to browser APIs
    nextRedirect = undefined;
    nextUsePathname = undefined;
}

/**
 * Smart redirect function with Next.js integration
 * 
 * Attempts to use Next.js server-side redirect when available,
 * falling back to client-side navigation for compatibility.
 * 
 * @param url - The URL to redirect to
 * 
 * @example
 * ```typescript
 * // Will use Next.js redirect if available, otherwise window.location
 * redirect('/login');
 * redirect('https://external-site.com');
 * ```
 */
const redirect = (url: string) => {
    // Try Next.js redirect first (server-side, more efficient)
    if (nextRedirect) {
        try {
            nextRedirect(url);
            return;
        } catch (error) {
            logger("Next.js redirect failed, falling back to window.location:", error);
        }
    }
    
    // Fallback to client-side redirect (works in all browsers)
    if (typeof window !== 'undefined') {
        window.location.href = url;
    }
};

/**
 * Smart pathname hook with Next.js integration
 * 
 * Returns the current pathname using Next.js usePathname when available,
 * falling back to window.location for broader compatibility.
 * 
 * @returns The current pathname (e.g., '/dashboard', '/users/123')
 * 
 * @example
 * ```typescript
 * const currentPath = usePathname();
 * console.log(currentPath); // '/dashboard'
 * ```
 */
const usePathname = () => {
    // Try Next.js usePathname first (reactive, optimized for SSR)
    if (nextUsePathname) {
        try {
            return nextUsePathname();
        } catch (error) {
            logger("Next.js usePathname failed, falling back to window.location:", error);
        }
    }
    
    // Fallback to browser location API
    if (typeof window !== 'undefined') {
        return window.location.pathname;
    }
    return '/'; // Default fallback for SSR environments
};

/**
 * CORE HULK HOOKS
 */

/**
 * Main Hulk context hook
 * 
 * Provides access to the global Hulk configuration and state.
 * Must be used within a HulkProvider component.
 * 
 * @returns The Hulk context object containing configuration and auth state
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const hulk = useHulk();
 *   
 *   // Access global fetch options
 *   console.log(hulk.fetchGlobalOptions.baseUrl);
 *   
 *   // Check authentication state
 *   if (hulk.auth.state.token) {
 *     // User is authenticated
 *   }
 * }
 * ```
 */
export const useHulk = () => {
    return useContext(HulkContext);
};

/**
 * Hulk Alert Management Hook
 * 
 * Provides functions to display and manage alerts in the DOM.
 * Alerts can be text, numbers, or React components and are rendered
 * into specified target elements.
 * 
 * Features:
 * - Duplicate detection and replacement
 * - Multiple target element support
 * - React component rendering with SSR safety
 * - Automatic cleanup
 * 
 * @returns Object with push and pop functions for alert management
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const alert = useHulkAlert();
 *   
 *   const showSuccess = () => {
 *     alert.push(
 *       <div className="success">Operation completed!</div>,
 *       { alertId: 'success-msg', targetId: 'notifications' }
 *     );
 *   };
 *   
 *   const hideAlert = () => {
 *     alert.pop({ alertId: 'success-msg' });
 *   };
 * 
 *   return (
 *     <div>
 *       <button onClick={showSuccess}>Show Alert</button>
 *       <button onClick={hideAlert}>Hide Alert</button>
 *       <div id="notifications"></div>
 *     </div>
 *   );
 * }
 * ```
 */
export const useHulkAlert = (): HulkAlertProps => {
    const hulk = useHulk()
    
    /**
     * Push (display) an alert to the DOM
     * 
     * @param node - The content to display (string, number, or React element)
     * @param alertOptions - Configuration for the alert
     * @param alertOptions.alertId - Unique identifier for the alert
     * @param alertOptions.targetId - Optional target element ID (uses global default if not provided)
     */
    const push: HulkAlertPushProps = useCallback((node: ReactNode, alertOptions) => {
        logger("Push Alert Action processing")
        
        // Determine target element (specific or global default)
        let target: HTMLElement | null = null;
        if (alertOptions.targetId) {
            target = document.getElementById(alertOptions.targetId);
        } else {
            target = document.getElementById(hulk.alertGlobalOptions.targetId)
        }
        
        if (target && node) {
            // Handle duplicate alerts based on global configuration
            if (hulk.alertGlobalOptions.replaceDuplicates) {
                const existingAlert = document.getElementById(alertOptions.alertId)
                if (existingAlert && target.contains(existingAlert)) {
                    logger("Duplicate alert found, replacing existing one")
                    target.removeChild(existingAlert)
                }
            }

            // Create container element for the alert
            const container = document.createElement('div');
            container.id = alertOptions.alertId

            // Handle different node types
            if (typeof node === 'string' || typeof node === 'number') {
                // Simple text content
                container.textContent = node.toString();
            } else if (React.isValidElement(node)) {
                // React component - use dynamic import to avoid SSR issues
                import('react-dom/client').then(({ createRoot }) => {
                    const root = createRoot(container);
                    root.render(node);
                }).catch((error) => {
                    logger("Failed to render React element:", error);
                    container.textContent = "Error rendering alert";
                });
            }

            // Add alert to target element
            target.appendChild(container);
        }
    }, [hulk.alertGlobalOptions])

    /**
     * Pop (remove) an alert from the DOM
     * 
     * @param alertOptions - Configuration for alert removal
     * @param alertOptions.alertId - ID of the alert to remove
     * @param alertOptions.targetId - Optional target element ID (uses global default if not provided)
     */
    const pop: HulkAlertPopProps = useCallback((alertOptions) => {
        logger("Pop Alert Action processing")
        
        // Determine target element (specific or global default)
        let target: HTMLElement | null = null;
        if (alertOptions.targetId) {
            target = document.getElementById(alertOptions.targetId);
        } else {
            target = document.getElementById(hulk.alertGlobalOptions.targetId)
        }

        // Remove alert if it exists
        if (target && alertOptions.alertId) {
            const alertElement = document.getElementById(alertOptions.alertId)
            if (alertElement && target.contains(alertElement)) {
                target.removeChild(alertElement)
                logger("Alert removed successfully")
            } else {
                logger("Alert element not found or not a child of target")
            }
        }
    }, [hulk.alertGlobalOptions])

    return {
        push,
        pop,
    };
}

/**
 * Hulk Fetch Hook
 * 
 * Advanced data fetching hook with built-in authentication, error handling,
 * and retry logic. Designed for modern APIs with token-based authentication.
 * 
 * Features:
 * - Automatic token attachment and refresh
 * - Retry logic with configurable thresholds
 * - Global and per-request error handling
 * - Query parameter handling
 * - Unauthorized redirect handling
 * - Loading state management
 * - Network error resilience
 * 
 * @template D - The expected response data type
 * @param input - The URL or endpoint to fetch from
 * @param options - Optional configuration for this specific request
 * @returns Object containing response data and dispatch function
 * 
 * @example
 * ```typescript
 * // Basic usage
 * function UserProfile({ userId }: { userId: string }) {
 *   const { data, dispatch } = useHulkFetch<User>(`/api/users/${userId}`);
 *   
 *   useEffect(() => {
 *     dispatch(); // Trigger the fetch
 *   }, [dispatch]);
 *   
 *   if (!data) return <div>Loading...</div>;
 *   return <div>Hello, {data.name}</div>;
 * }
 * 
 * // Advanced usage with options
 * function CreateUser() {
 *   const { dispatch } = useHulkFetch<User>('/api/users', {
 *     onSuccess: (user, alert) => {
 *       alert.push(`User ${user.name} created!`, { alertId: 'success' });
 *     },
 *     onError: (error, alert) => {
 *       alert.push(`Error: ${error.message}`, { alertId: 'error' });
 *     }
 *   });
 *   
 *   const createUser = () => {
 *     dispatch({
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({ name: 'John Doe' })
 *     });
 *   };
 *   
 *   return <button onClick={createUser}>Create User</button>;
 * }
 * ```
 */
export const useHulkFetch = <D>(input: string, options?: HulkFetchOptionsProps): HulkFetchResponseProps<D> => {
    const hulk = useHulk();
    const alert = useHulkAlert()
    const [data, setData] = useState<D | undefined>(undefined)
    const pathname = usePathname()

    // Retry mechanism to prevent infinite loops during token refresh
    let threshold = 0;
    const maxThreshold = 5; // Maximum retry attempts
    
    /**
     * Validates and increments the retry threshold
     * Prevents infinite retry loops during authentication failures
     * 
     * @returns true if retry is allowed, false if threshold exceeded
     */
    const validateThreshold = () => {
        if (threshold >= maxThreshold) {
            return false;
        } else {
            threshold++;
            return true;
        }
    }

    /**
     * Main dispatch function for executing HTTP requests
     * 
     * Handles the complete request lifecycle including:
     * - Request preparation and header merging
     * - Authentication token attachment
     * - Network error handling
     * - Token refresh on unauthorized responses
     * - Success and error callback execution
     * 
     * @param init - Fetch configuration options (method, headers, body, etc.)
     */
    const dispatch = useCallback(async (init: HulkFetchProps = {}) => {
        // Merge default options with request-specific options
        init = {
            method: 'GET',
            headers: {
                ...hulk.fetchGlobalOptions?.defaultHeaders,
                ...init.headers,
            },
            ...init,
        };

        // Reset threshold if explicitly requested
        if (init?.clearThreshold) {
            threshold = 0;
        }
        
        // Trigger loading state
        (options?.onPending ?? hulk.fetchGlobalOptions?.onPending)?.("start", alert);
        
        // Construct full URL with base URL
        const baseUrl = hulk.fetchGlobalOptions?.baseUrl || '';
        const url = new URL(input, baseUrl);
        logger("Fetching URL:", url.toString());
        
        // Add query parameters if provided
        if (init?.query) {
            Object.keys(init.query).forEach((key) => {
                const value = init.query![key];
                // Skip undefined and NaN values
                if (value === undefined || Number.isNaN(value)) return;
                
                const stringValue = value === null ? "null" : value.toString();
                url.searchParams.append(key, stringValue);
            });
        }
        
        // Attach authentication token if available
        if (hulk.auth.state.token) {
            logger("Authorization token:", hulk.auth.state.token);
            const authorization = `Bearer ${hulk.auth.state.token.access_token}`;
            init.headers = {
                ...init.headers,
                authorization: authorization,
            };
        }
        
        // Execute the fetch request with network error handling
        let response: Response | undefined = undefined;
        try {
            response = await fetch(url, init);
        } catch (error) {
            // Handle network errors (no internet, server down, etc.)
            logger("Network error:", error);
            const mockResponse: Response = {
                status: 500,
                statusText: "Network Error",
                ok: false,
                url: url.toString(),
                text: async () => "Network error, please try again later.",
                json: async () => ({ message: "Network error, please try again later." }),
            } as Response;
            
            (options?.onPending ?? hulk.fetchGlobalOptions?.onPending)?.("end", alert);
            const _error = hulk.fetchGlobalOptions?.errorParser
                ? await hulk.fetchGlobalOptions.errorParser(mockResponse)
                : { message: "Network error", code: 500 };
            (options?.onError ?? hulk.fetchGlobalOptions?.onError)?.(_error, alert);
            return;
        }

        logger("Response status:", response.status);
        
        // Handle authentication errors (401 Unauthorized, 403 Forbidden)
        const unauthorizedStatuses = [401, 403];
        if (unauthorizedStatuses.includes(response.status) && hulk.fetchGlobalOptions?.accessTokenRetriever) {
            logger("Retrieving access token...");
            const accessResponse = await hulk.fetchGlobalOptions.accessTokenRetriever();
            
            // Check if token refresh failed or retry threshold exceeded
            if (accessResponse === undefined || !validateThreshold()) {
                logger("Access token retrieval failed or threshold exceeded");
                // Clear authentication state
                hulk.auth.update({ token: undefined, user: undefined });
                (options?.onPending ?? hulk.fetchGlobalOptions?.onPending)?.("end", alert);
                
                // Parse and handle error
                const _error = hulk.fetchGlobalOptions?.errorParser
                    ? await hulk.fetchGlobalOptions.errorParser(response)
                    : { message: "Unauthorized", code: response.status };
                (options?.onError ?? hulk.fetchGlobalOptions?.onError)?.(_error, alert);
                
                // Redirect to login page if configured and not already there
                if (pathname !== '' && 
                    hulk.fetchGlobalOptions.unauthorizedRedirectUrl &&
                    pathname !== hulk.fetchGlobalOptions.unauthorizedRedirectUrl) {
                    try {
                        redirect(`${hulk.fetchGlobalOptions.unauthorizedRedirectUrl}?code=401&next=${pathname}`);
                    } catch (error) {
                        logger("Redirect failed:", error);
                    }
                }
                return;
            } else {
                // Token refresh successful - update auth state and retry
                hulk.auth.update({ token: accessResponse });
                logger("Access token updated successfully:", accessResponse);
                
                // Retry the original request with new token
                return dispatch({
                    ...init,
                    clearThreshold: false,
                    headers: {
                        ...init?.headers,
                        authorization: `Bearer ${accessResponse.access_token}`,
                    }
                });
            }
        } else if (!response.ok) {
            // Handle other HTTP errors (400, 500, etc.)
            const errorText = await response.text();
            logger("Fetch error response:", errorText);
            (options?.onPending ?? hulk.fetchGlobalOptions?.onPending)?.("end", alert);
            
            const _error = hulk.fetchGlobalOptions?.errorParser
                ? await hulk.fetchGlobalOptions.errorParser(response)
                : { message: response.statusText || "An error occurred", code: response.status };
            (options?.onError ?? hulk.fetchGlobalOptions?.onError)?.(_error, alert);
        } else {
            // Success case - parse response and update state
            const result = await response.json();
            logger("Fetch result:", result);
            setData(result);
            (options?.onPending ?? hulk.fetchGlobalOptions?.onPending)?.("end", alert);
            (options?.onSuccess ?? hulk.fetchGlobalOptions?.onSuccess)?.(result, alert);
        }
    }, [hulk.auth.state.token, input, options, hulk.fetchGlobalOptions, hulk.alertGlobalOptions, alert, pathname]);

    return {
        data,
        dispatch
    };
};
