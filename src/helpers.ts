/**
 * @fileoverview Hulk Helper Utilities
 * 
 * This file contains utility functions for error parsing and text processing
 * used throughout the Hulk library. These helpers provide standardized
 * error handling and response parsing for HTTP requests.
 * 
 * @author Hulk React Utils Team
 * @version 1.0.0
 */

import { logger } from "./logger";
import { HulkFetchErrorProps } from "./types";

/**
 * Parses error text into a standardized array of error messages.
 * 
 * This function handles various error response formats commonly returned by APIs:
 * - JSON arrays of error messages
 * - JSON objects with nested error structures
 * - Plain text error messages
 * - Complex validation error objects
 * 
 * @param errorText - Raw error text from HTTP response
 * @returns Array of formatted error messages
 * 
 * @example JSON array response
 * ```typescript
 * const errors = parseErrorText('["Email is required", "Password too short"]');
 * // Result: ["Email is required", "Password too short"]
 * ```
 * 
 * @example Validation object response
 * ```typescript
 * const errors = parseErrorText('{"email": ["Required field"], "password": ["Too short", "Must contain numbers"]}');
 * // Result: ["Email: Required field", "Password: Too short", "Password: Must contain numbers"]
 * ```
 * 
 * @example Plain text response
 * ```typescript
 * const errors = parseErrorText('Server error occurred');
 * // Result: ["Server error occurred"]
 * ```
 */
export function parseErrorText(errorText: string): string[] {
    try {
        const parsed = JSON.parse(errorText);

        // Handle array of error messages
        if (Array.isArray(parsed)) {
            return parsed.map((item) => 
                typeof item === "object" ? item.message || String(item) : String(item)
            );
        }

        // Handle object with error fields (e.g., validation errors)
        if (typeof parsed === "object" && parsed !== null) {
            return Object.entries<any>(parsed).flatMap(([key, value]) => {
                // Special handling for 'detail' field - don't prefix with field name
                const formattedKey = key === "detail" ? null : capitalizeFirstLetter(key);

                if (Array.isArray(value)) {
                    // Multiple errors for a single field
                    return value.map((item) => 
                        `${formattedKey ? `${formattedKey}: ` : ""}${item.message || String(item)}`
                    );
                }

                // Single error for a field
                return [`${formattedKey ? `${formattedKey}: ` : ""}${value.message || String(value)}`];
            });
        }

        // Handle primitive JSON values
        return [String(parsed)];
    } catch {
        // If JSON parsing fails, return the original text as a single error
        return [errorText];
    }
}

/**
 * Capitalizes the first letter of a string while preserving the rest.
 * Used for formatting field names in error messages.
 * 
 * @param text - The string to capitalize
 * @returns String with first letter capitalized
 * 
 * @example
 * ```typescript
 * capitalizeFirstLetter("email"); // "Email"
 * capitalizeFirstLetter("confirmPassword"); // "ConfirmPassword"
 * ```
 */
function capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Default error parser for Hulk fetch operations.
 * 
 * This function standardizes HTTP error responses into the HulkFetchErrorProps format,
 * making error handling consistent across the application. It parses the response
 * text and extracts meaningful error information.
 * 
 * Features:
 * - Handles various API error response formats
 * - Preserves HTTP status codes and status text
 * - Extracts detailed error messages from response body
 * - Returns undefined for successful responses (2xx status codes)
 * - Provides fallback error messages for malformed responses
 * 
 * @param response - The HTTP Response object from a fetch request
 * @returns Promise resolving to standardized error object or undefined for success
 * 
 * @example Usage in fetch configuration
 * ```typescript
 * const config: HulkGlobalConfigProps = {
 *   fetchGlobalOptions: {
 *     baseUrl: 'https://api.example.com',
 *     errorParser: hulkFetchErrorParser, // Use this parser
 *     onError: (error) => {
 *       console.log(`Error ${error.code}: ${error.message}`);
 *       error.details?.forEach(detail => console.log(`- ${detail}`));
 *     }
 *   }
 * };
 * ```
 * 
 * @example Error object structure
 * ```typescript
 * // For a 400 validation error:
 * {
 *   message: "Bad Request",
 *   code: 400,
 *   details: [
 *     "Email: This field is required",
 *     "Password: Must be at least 8 characters"
 *   ]
 * }
 * 
 * // For a 500 server error:
 * {
 *   message: "Internal Server Error",
 *   code: 500,
 *   details: ["An unexpected error occurred"]
 * }
 * ```
 */
export async function hulkFetchErrorParser(response: Response): Promise<HulkFetchErrorProps | undefined> {
    logger("Parsing error response:", response.status, response.statusText);
    
    // Extract response text for error parsing
    const text = await response.text();
    
    // Return undefined for successful responses
    if (response.ok) {
        return undefined;
    }
    
    // Parse error details from response body
    const details = parseErrorText(text);
    
    // Construct standardized error object
    const error: HulkFetchErrorProps = {
        message: response.statusText || "An error occurred",
        code: response.status,
        details: details,
    };
    
    return error;
}