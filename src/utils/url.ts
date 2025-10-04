// ./src/utils/url.ts

import { UserDocument } from "../types/user.js";

export interface RedirectUrlParams {
  accessToken?: string;
  refreshToken?: string;
  error?: string;
  message?: string;
  userId?: string;
  email?: string;
  name?: string;
}

export interface UserDataForRedirect {
  userId: string;
  email: string;
  name?: string;
}

/**
 * Sanitizes a URL to prevent open redirect attacks
 * @param url - The URL to sanitize
 * @param allowedDomains - Array of allowed domains (optional)
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeRedirectUrl(
  url: string,
  allowedDomains?: string[]
): string | null {
  try {
    const parsedUrl = new URL(url);

    // Check protocol - only allow http and https
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return null;
    }

    // If allowed domains are specified, validate against them
    if (allowedDomains && allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some((domain) => {
        // Handle wildcard subdomains (e.g., "*.example.com")
        if (domain.startsWith("*.")) {
          const baseDomain = domain.substring(2);
          return (
            parsedUrl.hostname === baseDomain ||
            parsedUrl.hostname.endsWith("." + baseDomain)
          );
        }
        return parsedUrl.hostname === domain;
      });

      if (!isAllowed) {
        return null;
      }
    }

    return parsedUrl.toString();
  } catch (error) {
    // Invalid URL format
    return null;
  }
}

/**
 * Validates URL parameters to prevent injection attacks
 * @param params - Object containing URL parameters
 * @returns Sanitized parameters object
 */
export function sanitizeUrlParams(
  params: Record<string, any>
): Record<string, string> {
  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) {
      // Convert to string and sanitize
      const stringValue = String(value);

      // Basic sanitization - remove potentially dangerous characters
      const sanitizedValue = stringValue
        .replace(/[<>'"&]/g, "") // Remove HTML/JS injection characters
        .replace(/[\r\n]/g, "") // Remove line breaks
        .trim();

      // Only include non-empty values
      if (sanitizedValue.length > 0) {
        sanitized[key] = sanitizedValue;
      }
    }
  }

  return sanitized;
}

/**
 * Builds a redirect URL with query parameters
 * @param baseUrl - The base URL to redirect to
 * @param params - Parameters to include in the URL
 * @param allowedDomains - Array of allowed domains for validation
 * @returns Complete redirect URL or null if invalid
 */
export function buildRedirectUrl(
  baseUrl: string,
  params: RedirectUrlParams,
  allowedDomains?: string[]
): string | null {
  // Sanitize the base URL
  const sanitizedBaseUrl = sanitizeRedirectUrl(baseUrl, allowedDomains);
  if (!sanitizedBaseUrl) {
    return null;
  }

  // Sanitize parameters
  const sanitizedParams = sanitizeUrlParams(params);

  // Build URL with parameters
  const url = new URL(sanitizedBaseUrl);

  for (const [key, value] of Object.entries(sanitizedParams)) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

/**
 * Extracts user data for redirect URL inclusion
 * @param user - User document from database
 * @returns User data safe for URL inclusion
 */
export function extractUserDataForRedirect(
  user: UserDocument
): UserDataForRedirect {
  return {
    userId: user._id.toString(),
    email: user.email,
    name:
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || undefined,
  };
}

/**
 * Builds success redirect URL with authentication tokens and optional user data
 * @param baseUrl - Base success URL
 * @param accessToken - JWT access token
 * @param refreshToken - JWT refresh token
 * @param user - User document (optional)
 * @param includeUserData - Whether to include user data in URL
 * @param allowedDomains - Array of allowed domains
 * @returns Complete success redirect URL
 */
export function buildSuccessRedirectUrl(
  baseUrl: string,
  accessToken: string,
  refreshToken: string,
  user?: UserDocument,
  includeUserData: boolean = false,
  allowedDomains?: string[]
): string | null {
  const params: RedirectUrlParams = {
    accessToken,
    refreshToken,
  };

  // Include user data if requested and user is provided
  if (includeUserData && user) {
    const userData = extractUserDataForRedirect(user);
    params.userId = userData.userId;
    params.email = userData.email;
    if (userData.name) {
      params.name = userData.name;
    }
  }

  return buildRedirectUrl(baseUrl, params, allowedDomains);
}

/**
 * Builds error redirect URL with error information
 * @param baseUrl - Base error URL
 * @param error - Error code or type
 * @param message - Error message (optional)
 * @param allowedDomains - Array of allowed domains
 * @returns Complete error redirect URL
 */
export function buildErrorRedirectUrl(
  baseUrl: string,
  error: string,
  message?: string,
  allowedDomains?: string[]
): string | null {
  const params: RedirectUrlParams = {
    error,
  };

  if (message) {
    params.message = message;
  }

  return buildRedirectUrl(baseUrl, params, allowedDomains);
}

/**
 * Validates if a URL is safe for redirection
 * @param url - URL to validate
 * @param allowedDomains - Array of allowed domains
 * @returns True if URL is safe for redirection
 */
export function isValidRedirectUrl(
  url: string,
  allowedDomains?: string[]
): boolean {
  return sanitizeRedirectUrl(url, allowedDomains) !== null;
}

/**
 * Gets allowed domains from environment configuration
 * @returns Array of allowed domains or undefined if not configured
 */
export function getAllowedDomainsFromEnv(): string[] | undefined {
  const allowedDomains = process.env.ALLOWED_REDIRECT_DOMAINS;
  if (!allowedDomains) {
    return undefined;
  }

  return allowedDomains
    .split(",")
    .map((domain) => domain.trim())
    .filter((domain) => domain.length > 0);
}
