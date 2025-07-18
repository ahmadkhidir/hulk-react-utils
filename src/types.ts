import { ReactNode } from "react";

/**
 * @fileoverview Type definitions for the Hulk library
 * 
 * This file contains all TypeScript interfaces and types used throughout
 * the Hulk library for authentication, HTTP requests, and alert management.
 */

/**
 * Callback function type for updating authentication state.
 * 
 * @template UserProps - The shape of your user object
 * @param state - New authentication state containing token and user data
 * @returns void or undefined
 * 
 * @example
 * ```typescript
 * const updateAuth: HulkAuthUpdateProps<User> = (newState) => {
 *   // Update authentication state with new user data
 *   console.log('Auth updated:', newState);
 * };
 * ```
 */
export type HulkAuthUpdateProps = <UserProps>(state: HulkAuthStateProps<UserProps>) => void | undefined

/**
 * Structure for API error responses.
 * Provides standardized error information across the application.
 * 
 * @interface HulkFetchErrorProps
 * @property message - Human-readable error message
 * @property code - HTTP status code or custom error code
 * @property details - Optional array of additional error details
 * 
 * @example
 * ```typescript
 * const error: HulkFetchErrorProps = {
 *   message: "Validation failed",
 *   code: 400,
 *   details: ["Email is required", "Password must be at least 8 characters"]
 * };
 * ```
 */
export type HulkFetchErrorProps = {
    message: string;
    code: number;
    details?: string[];
}

/**
 * Authentication token structure.
 * Contains the access token for API authentication.
 * 
 * @interface TokenProps
 * @property access_token - JWT or other token string for API authentication
 * 
 * @example
 * ```typescript
 * const token: TokenProps = {
 *   access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * };
 * ```
 */
export type TokenProps = {
    access_token: string;
}

/**
 * Authentication state containing token and user information.
 * 
 * @template UserProps - The shape of your application's user object
 * @interface HulkAuthStateProps
 * @property token - Optional authentication token
 * @property user - Optional user data of generic type UserProps
 * 
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 * }
 * 
 * const authState: HulkAuthStateProps<User> = {
 *   token: { access_token: "..." },
 *   user: { id: "123", name: "John Doe", email: "john@example.com" }
 * };
 * ```
 */
export type HulkAuthStateProps<UserProps> = {
    token?: TokenProps;
    user?: UserProps;
};

/**
 * States for tracking request pending status.
 * Used to indicate when a request starts or completes.
 * 
 * @type HulkFetchOptionsPendingStateProps
 * @description
 * - "start" - Request has begun
 * - "end" - Request has completed (success or failure)
 */
export type HulkFetchOptionsPendingStateProps = "start" | "end";

/**
 * Configuration options for individual fetch requests.
 * Provides callbacks for handling request lifecycle events.
 * 
 * @interface HulkFetchOptionsProps
 * @property onError - Called when request fails or returns error status
 * @property onSuccess - Called when request completes successfully
 * @property onPending - Called when request starts or ends
 * 
 * @example
 * ```typescript
 * const fetchOptions: HulkFetchOptionsProps = {
 *   onError: (error, alert) => {
 *     alert?.push(<ErrorToast message={error.message} />, { alertId: 'error' });
 *   },
 *   onSuccess: (data, alert) => {
 *     alert?.push(<SuccessToast />, { alertId: 'success' });
 *   },
 *   onPending: (state) => {
 *     if (state === 'start') setLoading(true);
 *     else setLoading(false);
 *   }
 * };
 * ```
 */
export interface HulkFetchOptionsProps {
    onError?: (error: any, alert?: HulkAlertProps) => void;
    onSuccess?: (data: any, alert?: HulkAlertProps) => void;
    onPending?: (state: HulkFetchOptionsPendingStateProps, alert?: HulkAlertProps) => void;
}

/**
 * Global fetch configuration that applies to all requests.
 * Extends HulkFetchOptionsProps with additional global settings.
 * 
 * @interface HulkFetchGlobalOptionsProps
 * @extends HulkFetchOptionsProps
 * @property baseUrl - Base URL prepended to all request URLs
 * @property errorParser - Function to parse error responses into standard format
 * @property accessTokenRetriever - Function to retrieve current access token
 * @property defaultHeaders - Headers included with every request
 * @property unauthorizedRedirectUrl - URL to redirect to on 401 errors
 * 
 * @example
 * ```typescript
 * const globalOptions: HulkFetchGlobalOptionsProps = {
 *   baseUrl: 'https://api.myapp.com',
 *   defaultHeaders: {
 *     'Content-Type': 'application/json',
 *     'X-API-Version': 'v1'
 *   },
 *   unauthorizedRedirectUrl: '/login',
 *   accessTokenRetriever: async () => {
 *     const token = localStorage.getItem('token');
 *     return token ? { access_token: token } : undefined;
 *   }
 * };
 * ```
 */
export interface HulkFetchGlobalOptionsProps extends HulkFetchOptionsProps {
    baseUrl?: string;
    errorParser?: (response: Response) => Promise<any>;
    accessTokenRetriever?: () => Promise<TokenProps | undefined>;
    defaultHeaders?: Record<string, string>;
    unauthorizedRedirectUrl?: string;
}

/**
 * Configuration for individual alert instances.
 * 
 * @interface HulkAlertOptionsProps
 * @property targetId - Optional specific DOM element ID to render this alert
 * @property alertId - Unique identifier for this alert instance
 * 
 * @example
 * ```typescript
 * const alertOptions: HulkAlertOptionsProps = {
 *   targetId: 'custom-alert-container', // Optional: use specific container
 *   alertId: 'user-profile-error'        // Required: unique ID for this alert
 * };
 * ```
 */
export interface HulkAlertOptionsProps {
    targetId?: string;
    alertId: string;
}

/**
 * Global configuration for the alert system.
 * Controls default behavior for all alerts.
 * 
 * @interface HulkAlertGlobalOptionsProps
 * @property targetId - Default DOM element ID where alerts are rendered
 * @property replaceDuplicates - Whether to replace existing alerts with same ID
 * 
 * @example
 * ```typescript
 * const alertGlobalOptions: HulkAlertGlobalOptionsProps = {
 *   targetId: 'app-alerts',
 *   replaceDuplicates: true // Prevent duplicate error messages
 * };
 * ```
 */
export interface HulkAlertGlobalOptionsProps {
    targetId: string;
    replaceDuplicates: boolean; // If true, replaces existing alerts with the same ID
}

/**
 * Complete global configuration for the Hulk library.
 * Combines fetch and alert configurations with optional default auth state.
 * 
 * @interface HulkGlobalConfigProps
 * @property defaultAuthState - Optional initial authentication state
 * @property fetchGlobalOptions - Global HTTP request configuration
 * @property alertGlobalOptions - Global alert system configuration
 * 
 * @example
 * ```typescript
 * const config: HulkGlobalConfigProps = {
 *   defaultAuthState: {
 *     user: null,
 *     token: undefined
 *   },
 *   fetchGlobalOptions: {
 *     baseUrl: process.env.REACT_APP_API_URL,
 *     defaultHeaders: { 'Content-Type': 'application/json' }
 *   },
 *   alertGlobalOptions: {
 *     targetId: 'notifications',
 *     replaceDuplicates: true
 *   }
 * };
 * ```
 */
export interface HulkGlobalConfigProps {
    defaultAuthState?: HulkAuthStateProps<any>;
    fetchGlobalOptions: HulkFetchGlobalOptionsProps;
    alertGlobalOptions: HulkAlertGlobalOptionsProps;
}

/**
 * The main context value provided by HulkContext.
 * Contains all authentication, fetch, and alert functionality.
 * 
 * @interface HulkContextProps
 * @property auth - Authentication state and methods
 * @property fetchGlobalOptions - Global fetch configuration
 * @property alertGlobalOptions - Global alert configuration
 * 
 * @example
 * ```typescript
 * const hulkContext = useContext(HulkContext);
 * 
 * // Check if user is authenticated
 * if (hulkContext.auth.isAuthenticated()) {
 *   // Access user data
 *   console.log(hulkContext.auth.state.user);
 * }
 * 
 * // Update authentication
 * hulkContext.auth.update({ 
 *   token: { access_token: newToken },
 *   user: userData 
 * });
 * ```
 */
export type HulkContextProps = {
    auth: {
        state: HulkAuthStateProps<any>;
        update: HulkAuthUpdateProps;
        reset: () => void;
        isAuthenticated: () => boolean;
    };
    fetchGlobalOptions: HulkFetchGlobalOptionsProps;
    alertGlobalOptions: HulkAlertGlobalOptionsProps;
};

/**
 * Extended request configuration for Hulk fetch operations.
 * Extends the standard RequestInit with additional Hulk-specific options.
 * 
 * @interface HulkFetchProps
 * @extends RequestInit
 * @property query - URL query parameters as key-value pairs
 * @property clearThreshold - Whether to reset retry threshold for this request
 * 
 * @example
 * ```typescript
 * const fetchProps: HulkFetchProps = {
 *   method: 'POST',
 *   body: JSON.stringify({ name: 'John' }),
 *   query: { 
 *     include: 'profile',
 *     page: 1,
 *     active: true 
 *   },
 *   clearThreshold: true // Reset retry count for this request
 * };
 * ```
 */
export interface HulkFetchProps extends RequestInit {
    query?: Record<string, string | number | boolean | null | undefined>;
    clearThreshold?: boolean; // If true, reset the threshold for retries
}

/**
 * Return type for the useHulkFetch hook.
 * Provides data and a dispatch function for making requests.
 * 
 * @template HulkFetchDataProps - The expected shape of the response data
 * @interface HulkFetchResponseProps
 * @property data - The response data (undefined until first successful request)
 * @property dispatch - Function to trigger a new request with optional parameters
 * 
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 * }
 * 
 * function UserProfile() {
 *   const { data, dispatch }: HulkFetchResponseProps<User> = useHulkFetch('/api/user');
 *   
 *   const refreshUser = () => {
 *     dispatch({ clearThreshold: true }); // Refresh with reset retry count
 *   };
 *   
 *   return (
 *     <div>
 *       {data ? <h1>{data.name}</h1> : <p>Loading...</p>}
 *       <button onClick={refreshUser}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */
export type HulkFetchResponseProps<HulkFetchDataProps> = {
    data?: HulkFetchDataProps;
    dispatch: (init?: HulkFetchProps) => Promise<void>;
}

/**
 * Function type for pushing alerts to the alert system.
 * 
 * @param node - React component or element to display as the alert
 * @param alertOptions - Configuration options for this alert
 * 
 * @example
 * ```typescript
 * const pushAlert: HulkAlertPushProps = (node, options) => {
 *   // Display the alert in the specified container
 * };
 * 
 * pushAlert(<ErrorMessage text="Something went wrong" />, {
 *   alertId: 'api-error',
 *   targetId: 'error-container'
 * });
 * ```
 */
export type HulkAlertPushProps = (node: ReactNode, alertOptions: HulkAlertOptionsProps) => void

/**
 * Function type for removing alerts from the alert system.
 * 
 * @param alertOptions - Configuration identifying which alert to remove
 * 
 * @example
 * ```typescript
 * const popAlert: HulkAlertPopProps = (options) => {
 *   // Remove the specified alert
 * };
 * 
 * popAlert({ alertId: 'api-error' }); // Remove specific alert
 * ```
 */
export type HulkAlertPopProps = (alertOptions: HulkAlertOptionsProps) => void

/**
 * Alert management interface providing push and pop functionality.
 * Returned by the useHulkAlert hook.
 * 
 * @interface HulkAlertProps
 * @property push - Function to display a new alert
 * @property pop - Function to remove an existing alert
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const alert = useHulkAlert();
 *   
 *   const showSuccess = () => {
 *     alert.push(
 *       <div className="success">Operation completed!</div>,
 *       { alertId: 'success-msg' }
 *     );
 *   };
 *   
 *   const hideSuccess = () => {
 *     alert.pop({ alertId: 'success-msg' });
 *   };
 *   
 *   return (
 *     <div>
 *       <button onClick={showSuccess}>Show Success</button>
 *       <button onClick={hideSuccess}>Hide Success</button>
 *     </div>
 *   );
 * }
 * ```
 */
export type HulkAlertProps = {
    push: HulkAlertPushProps;
    pop: HulkAlertPopProps;
}