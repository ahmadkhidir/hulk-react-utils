import { hulkFetchErrorParser } from "./helpers";
import { HulkGlobalConfigProps } from "./types";

/**
 * Default global configuration for the Hulk library.
 * 
 * This configuration object defines the default settings for HTTP requests and alert management
 * throughout the application. It can be customized when initializing the Hulk context provider.
 * 
 * @example
 * ```typescript
 * // Using default configuration
 * <HulkProvider config={hulkGlobalConfigDefault}>
 *   <App />
 * </HulkProvider>
 * 
 * // Customizing configuration
 * const customConfig = {
 *   ...hulkGlobalConfigDefault,
 *   fetchGlobalOptions: {
 *     ...hulkGlobalConfigDefault.fetchGlobalOptions,
 *     baseUrl: 'https://api.myapp.com',
 *     defaultHeaders: {
 *       'Content-Type': 'application/json',
 *       'X-API-Version': 'v1'
 *     }
 *   }
 * };
 * ```
 */
export const hulkGlobalConfigDefault: HulkGlobalConfigProps = {
    /**
     * Global fetch configuration options that apply to all HTTP requests made through Hulk.
     * These settings provide consistent behavior across the application.
     */
    fetchGlobalOptions: {
        /**
         * Base URL for all API requests.
         * @default '' - When empty, requests will be made relative to the current domain
         * @example 'https://api.myapp.com' or '/api'
         */
        baseUrl: '',

        /**
         * Default headers included with every request.
         * These can be overridden on a per-request basis.
         * @default { 'Content-Type': 'application/json' }
         */
        defaultHeaders: {
            'Content-Type': 'application/json',
        },

        /**
         * URL to redirect users when they receive a 401 Unauthorized response.
         * This is typically your login page.
         * @default '/login'
         */
        unauthorizedRedirectUrl: '/login',

        /**
         * Global callback function executed when a request starts or ends.
         * Useful for showing/hiding loading indicators.
         * 
         * @param state - Either 'start' when request begins or 'end' when it completes
         * @example
         * onPending: (state, alert) => {
         *   if (state === 'start') {
         *     alert.push(<LoadingIndicator />, { alertId: 'loading' });
         *   } else {
         *     alert.pop({ alertId: 'loading' });
         *   }
         * }
         */
        onPending: (state, alert) => console.log('Request', state),

        /**
         * Global error handler for failed requests.
         * Called whenever a request fails or returns an error status.
         * 
         * @param error - The error object containing details about the failure
         * @example
         * onError: (error, alert) => {
         *   alert.push(
         *      <ErrorMessage 
         *          onClick={() => alert.pop({ alertId: 'error' })} 
         *   />, { alertId: 'error' });
         * }
         */
        onError: (error, alert) => console.log('Error while fetching'),

        /**
         * Global success handler for successful requests.
         * Called whenever a request completes successfully.
         * 
         * @param data - The response data from the successful request
         * @example
         * onSuccess: (data, alert) => {
         *   alert.push(
         *      <SuccessMessage
         *          onClick={() => alert.pop({ alertId: 'success' })}
         *   />, { alertId: 'success' });
         * }
         */
        onSuccess: (data) => console.log('Data fetched successfully'),

        /**
         * Function to parse error responses from the server.
         * Converts raw Response objects into standardized error objects.
         * 
         * @default hulkFetchErrorParser - The built-in error parser
         * @see hulkFetchErrorParser in helpers.ts for implementation details
         */
        errorParser: hulkFetchErrorParser,
    },

    /**
     * Global alert system configuration.
     * Controls how notifications and alerts are displayed in the application.
     */
    alertGlobalOptions: {
        /**
         * DOM element ID where alerts will be rendered.
         * This element should exist in your HTML/JSX template.
         * 
         * @default 'hulk-global-alert-target'
         * @example
         * // In your HTML/JSX:
         * <div id="hulk-global-alert-target"></div>
         */
        targetId: 'hulk-global-alert-target',

        /**
         * Whether to replace existing alerts with the same ID.
         * 
         * - `true`: New alerts with same ID replace existing ones (prevents duplicates)
         * - `false`: Multiple alerts with same ID can exist simultaneously
         * 
         * @default true
         * @example
         * // With replaceDuplicates: true
         * alert.push(<ErrorAlert />, { alertId: 'error-1' }); // Shows error
         * alert.push(<ErrorAlert />, { alertId: 'error-1' }); // Replaces previous error
         * 
         * // With replaceDuplicates: false
         * alert.push(<ErrorAlert />, { alertId: 'error-1' }); // Shows error
         * alert.push(<ErrorAlert />, { alertId: 'error-1' }); // Shows second error
         */
        replaceDuplicates: true,
    }
};