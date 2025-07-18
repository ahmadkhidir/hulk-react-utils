/**
 * @fileoverview Hulk React Context
 * 
 * This file defines the React Context that provides global state management
 * for authentication, fetch configuration, and alert system settings throughout
 * the Hulk-enabled application.
 * 
 * The context serves as the central state container and is provided by the
 * withHulk HOC to all child components.
 * 
 * @example Using the context
 * ```tsx
 * import { useContext } from 'react';
 * import { HulkContext } from 'hulk-react-utils';
 * 
 * function MyComponent() {
 *   const hulk = useContext(HulkContext);
 *   
 *   // Access authentication state
 *   if (hulk.auth.isAuthenticated()) {
 *     console.log('User:', hulk.auth.state.user);
 *   }
 *   
 *   return <div>Component content</div>;
 * }
 * ```
 * 
 * @author Hulk React Utils Team
 * @version 1.0.0
 */

import { createContext } from "react";
import { HulkContextProps, HulkAuthStateProps } from "./types";

/**
 * The main React Context for Hulk functionality.
 * 
 * This context provides access to:
 * - Authentication state and methods (login, logout, user data)
 * - Global fetch configuration (base URLs, headers, error handling)
 * - Alert system configuration (target elements, duplicate handling)
 * 
 * The context is created with safe default values to prevent runtime errors
 * when components try to use Hulk features outside of a HulkProvider.
 * 
 * @remarks
 * The default values include warning messages for auth operations to help
 * developers identify when components are not properly wrapped with the
 * withHulk HOC.
 * 
 * @example Accessing context directly
 * ```tsx
 * import { useContext } from 'react';
 * import { HulkContext } from 'hulk-react-utils';
 * 
 * function AuthButton() {
 *   const { auth } = useContext(HulkContext);
 *   
 *   return (
 *     <button onClick={() => auth.reset()}>
 *       {auth.isAuthenticated() ? 'Logout' : 'Login'}
 *     </button>
 *   );
 * }
 * ```
 * 
 * @example Using with the useHulk hook (recommended)
 * ```tsx
 * import { useHulk } from 'hulk-react-utils';
 * 
 * function AuthButton() {
 *   const hulk = useHulk(); // More convenient than useContext
 *   
 *   return (
 *     <button onClick={() => hulk.auth.reset()}>
 *       {hulk.auth.isAuthenticated() ? 'Logout' : 'Login'}
 *     </button>
 *   );
 * }
 * ```
 */
export const HulkContext = createContext<HulkContextProps>({
    /**
     * Authentication state and methods
     * 
     * Default implementation provides empty state and warning functions
     * to help developers identify missing provider setup.
     */
    auth: {
        /** Empty authentication state (no user, no token) */
        state: {},
        
        /** 
         * Default isAuthenticated always returns false
         * @returns false - no authentication when context provider is missing
         */
        isAuthenticated: () => false,
        
        /** 
         * Default update function that logs a warning
         * Helps developers identify when components aren't wrapped with withHulk
         * @param data - Authentication data (ignored in default implementation)
         */
        update: () => {
            console.warn("No AuthContext provider found - make sure your app is wrapped with withHulk()");
        },
        
        /** 
         * Default reset function that logs a warning
         * Helps developers identify when components aren't wrapped with withHulk
         */
        reset: () => {
            console.warn("No AuthContext provider found - make sure your app is wrapped with withHulk()");
        },
    },
    
    /**
     * Default alert system configuration
     * 
     * Provides safe defaults for the alert system when no configuration
     * is provided via the withHulk HOC.
     */
    alertGlobalOptions: {
        /** Empty target ID - alerts won't render without proper setup */
        targetId: '',
        
        /** Enable duplicate replacement by default for better UX */
        replaceDuplicates: true,
    },
    
    /**
     * Default fetch configuration
     * 
     * Empty object allows fetch operations to work with browser defaults
     * when no global configuration is provided.
     */
    fetchGlobalOptions: {},
});