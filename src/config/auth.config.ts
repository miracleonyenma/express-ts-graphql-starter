// src/config/auth.config.ts

import { config } from "dotenv";
import {
  buildSuccessRedirectUrl,
  buildErrorRedirectUrl,
  getAllowedDomainsFromEnv,
  isValidRedirectUrl,
} from "../utils/url.js";
import { UserDocument } from "../types/user.js";

config();

export type AuthMode = "graphql" | "rest" | "hybrid";

export interface AuthConfigInterface {
  mode: AuthMode;
  frontendSuccessUrl: string;
  frontendErrorUrl: string;
  includeUserDataInRedirect: boolean;
  generateMagicLinkUrl(token: string): string;
  generateGoogleOAuthUrl(): string;
  getGoogleOAuthRedirectUri(): string;
  buildSuccessRedirect(
    accessToken: string,
    refreshToken: string,
    user?: UserDocument
  ): string | null;
  buildErrorRedirect(error: string, message?: string): string | null;
  validateRedirectUrl(url: string): boolean;
}

class AuthConfigService implements AuthConfigInterface {
  public readonly mode: AuthMode;
  public readonly frontendSuccessUrl: string;
  public readonly frontendErrorUrl: string;
  public readonly includeUserDataInRedirect: boolean;
  private readonly appUrl: string;
  private readonly allowedDomains: string[] | undefined;

  constructor() {
    // Parse authentication mode from environment with validation
    const authMode = process.env.AUTH_MODE?.toLowerCase() as AuthMode;
    this.mode = this.validateAuthMode(authMode) ? authMode : "graphql";

    // Log warning if invalid auth mode was provided
    if (process.env.AUTH_MODE && !this.validateAuthMode(authMode)) {
      console.warn(
        `Warning: Invalid AUTH_MODE '${process.env.AUTH_MODE}' provided. Falling back to 'graphql'. Valid options: graphql, rest, hybrid`
      );
    }

    // Frontend redirect URLs for REST mode with validation
    this.frontendSuccessUrl = this.getValidatedUrl(
      process.env.FRONTEND_SUCCESS_URL ||
        process.env.APP_URL ||
        "http://localhost:3000",
      "FRONTEND_SUCCESS_URL"
    );

    this.frontendErrorUrl = this.getValidatedUrl(
      process.env.FRONTEND_ERROR_URL ||
        `${this.frontendSuccessUrl}/login?error=auth_failed`,
      "FRONTEND_ERROR_URL"
    );

    // Optional user data inclusion in redirect URLs with validation
    this.includeUserDataInRedirect = this.parseBoolean(
      process.env.INCLUDE_USER_DATA_IN_REDIRECT,
      false,
      "INCLUDE_USER_DATA_IN_REDIRECT"
    );

    // App URL for API endpoints with validation
    this.appUrl = this.getValidatedUrl(
      process.env.APP_URL || "http://localhost:4000",
      "APP_URL"
    );

    // Allowed domains for redirect URL validation
    this.allowedDomains = getAllowedDomainsFromEnv();

    // Validate all configured URLs and required settings
    this.validateConfiguration();
  }

  /**
   * Validates if the provided auth mode is valid
   */
  private validateAuthMode(mode: string): mode is AuthMode {
    return ["graphql", "rest", "hybrid"].includes(mode);
  }

  /**
   * Validates and returns a URL with proper error handling
   */
  private getValidatedUrl(url: string, envVarName: string): string {
    if (!url) {
      console.warn(`Warning: ${envVarName} is not set, using default value`);
      return envVarName === "APP_URL"
        ? "http://localhost:4000"
        : "http://localhost:3000";
    }

    try {
      new URL(url);
      return url;
    } catch (error) {
      console.warn(
        `Warning: Invalid URL format for ${envVarName}: ${url}. Using default.`
      );
      return envVarName === "APP_URL"
        ? "http://localhost:4000"
        : "http://localhost:3000";
    }
  }

  /**
   * Parses boolean environment variables with proper validation
   */
  private parseBoolean(
    value: string | undefined,
    defaultValue: boolean,
    envVarName: string
  ): boolean {
    if (value === undefined) {
      return defaultValue;
    }

    const lowerValue = value.toLowerCase();
    if (lowerValue === "true" || lowerValue === "1" || lowerValue === "yes") {
      return true;
    } else if (
      lowerValue === "false" ||
      lowerValue === "0" ||
      lowerValue === "no"
    ) {
      return false;
    } else {
      console.warn(
        `Warning: Invalid boolean value for ${envVarName}: '${value}'. Using default: ${defaultValue}`
      );
      return defaultValue;
    }
  }

  /**
   * Validates all configuration and logs warnings for missing required values
   */
  private validateConfiguration(): void {
    // Validate URLs
    if (!this.validateRedirectUrl(this.frontendSuccessUrl)) {
      console.warn(
        `Warning: Frontend success URL may not be valid: ${this.frontendSuccessUrl}`
      );
    }
    if (!this.validateRedirectUrl(this.frontendErrorUrl)) {
      console.warn(
        `Warning: Frontend error URL may not be valid: ${this.frontendErrorUrl}`
      );
    }

    // Validate required configuration for REST mode
    if (this.isRestModeEnabled()) {
      this.validateRestModeConfiguration();
    }

    // Log configuration summary in development
    if (process.env.NODE_ENV !== "production") {
      console.log("Auth Configuration:", this.getConfigSummary());
    }
  }

  /**
   * Validates configuration specific to REST mode
   */
  private validateRestModeConfiguration(): void {
    const requiredEnvVars = ["FRONTEND_SUCCESS_URL", "FRONTEND_ERROR_URL"];

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      console.warn(
        `Warning: REST mode is enabled but the following environment variables are not set: ${missingVars.join(", ")}. Using default values.`
      );
    }

    // Validate Google OAuth configuration if needed
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.warn(
        "Warning: Google OAuth credentials are not configured. Google OAuth will not work."
      );
    }
  }

  /**
   * Builds success redirect URL with authentication tokens and optional user data
   * @param accessToken - JWT access token
   * @param refreshToken - JWT refresh token
   * @param user - User document (optional)
   * @returns Complete success redirect URL
   */
  public buildSuccessRedirect(
    accessToken: string,
    refreshToken: string,
    user?: UserDocument
  ): string | null {
    return buildSuccessRedirectUrl(
      this.frontendSuccessUrl,
      accessToken,
      refreshToken,
      user,
      this.includeUserDataInRedirect,
      this.allowedDomains
    );
  }

  /**
   * Builds error redirect URL with error information
   * @param error - Error code or type
   * @param message - Error message (optional)
   * @returns Complete error redirect URL
   */
  public buildErrorRedirect(error: string, message?: string): string | null {
    return buildErrorRedirectUrl(
      this.frontendErrorUrl,
      error,
      message,
      this.allowedDomains
    );
  }

  /**
   * Validates if a URL is safe for redirection
   * @param url - URL to validate
   * @returns True if URL is safe for redirection
   */
  public validateRedirectUrl(url: string): boolean {
    return isValidRedirectUrl(url, this.allowedDomains);
  }

  /**
   * Generates magic link URL based on configuration mode
   * @param token - The magic link token
   * @returns Complete magic link URL
   */
  public generateMagicLinkUrl(token: string): string {
    if (this.mode === "rest" || this.mode === "hybrid") {
      // Generate API REST endpoint URL
      return `${this.appUrl}/api/auth/magic-link/verify?token=${encodeURIComponent(token)}`;
    } else {
      // Generate frontend URL for GraphQL mode
      return `${this.frontendSuccessUrl}/auth/magic-link?token=${encodeURIComponent(token)}`;
    }
  }

  /**
   * Generates Google OAuth initiation URL for REST mode
   * @returns Google OAuth initiation URL
   */
  public generateGoogleOAuthUrl(): string {
    if (this.mode === "rest" || this.mode === "hybrid") {
      // Generate API REST endpoint URL for OAuth initiation
      return `${this.appUrl}/api/auth/google/login`;
    } else {
      // For GraphQL mode, return the frontend URL that will handle OAuth
      return `${this.frontendSuccessUrl}/auth/google`;
    }
  }

  /**
   * Gets the Google OAuth redirect URI for the current configuration
   * @returns Google OAuth redirect URI
   */
  public getGoogleOAuthRedirectUri(): string {
    // Use environment variable if set, otherwise construct based on mode
    if (process.env.GOOGLE_OAUTH_REDIRECT_URI) {
      return process.env.GOOGLE_OAUTH_REDIRECT_URI;
    }

    if (this.mode === "rest" || this.mode === "hybrid") {
      return `${this.appUrl}/api/auth/google/callback`;
    } else {
      // For GraphQL mode, use the existing pattern
      return `${this.appUrl}/api/auth/google`;
    }
  }

  /**
   * Checks if REST endpoints should be enabled
   */
  public isRestModeEnabled(): boolean {
    return this.mode === "rest" || this.mode === "hybrid";
  }

  /**
   * Checks if GraphQL endpoints should be enabled
   */
  public isGraphQLModeEnabled(): boolean {
    return this.mode === "graphql" || this.mode === "hybrid";
  }

  /**
   * Gets configuration summary for logging/debugging
   */
  public getConfigSummary(): Record<string, any> {
    return {
      mode: this.mode,
      frontendSuccessUrl: this.frontendSuccessUrl,
      frontendErrorUrl: this.frontendErrorUrl,
      includeUserDataInRedirect: this.includeUserDataInRedirect,
      appUrl: this.appUrl,
      restModeEnabled: this.isRestModeEnabled(),
      graphqlModeEnabled: this.isGraphQLModeEnabled(),
    };
  }
}

// Export singleton instance
export const authConfig = new AuthConfigService();
export default authConfig;
