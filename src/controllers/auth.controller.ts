import { Request, Response } from "express";
import { logger } from "@untools/logger";
import crypto from "crypto";
import MagicLinkService from "../services/magicLink.services.js";
import { authConfig } from "../config/auth.config.js";
import {
  getGoogleOAuthTokens,
  getGoogleUser,
} from "../services/google.auth.services.js";
import User from "../models/user.model.js";
import {
  accessTokenData,
  createAccessToken,
  createRefreshToken,
} from "../utils/token.js";
import {
  ValidationError,
  BadRequestError,
  UnauthorizedError,
  InternalServerError,
} from "../services/error.services.js";

/**
 * Authentication Controller for REST endpoints
 * Handles magic link authentication and Google OAuth flows
 */
export class AuthController {
  private magicLinkService: MagicLinkService;

  constructor() {
    this.magicLinkService = new MagicLinkService();
  }

  /**
   * Generate a cryptographically secure state parameter for OAuth CSRF protection
   */
  private generateStateParameter(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Sign the state parameter to prevent tampering
   */
  private signState(state: string): string {
    const secret = process.env.ACCESS_TOKEN_SECRET || "fallback-secret";
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(state);
    const signature = hmac.digest("hex");
    return `${state}.${signature}`;
  }

  /**
   * Verify the signed state parameter
   */
  private verifyState(signedState: string): string | null {
    try {
      const [state, signature] = signedState.split(".");
      if (!state || !signature) {
        return null;
      }

      const secret = process.env.ACCESS_TOKEN_SECRET || "fallback-secret";
      const hmac = crypto.createHmac("sha256", secret);
      hmac.update(state);
      const expectedSignature = hmac.digest("hex");

      // Use constant-time comparison to prevent timing attacks
      if (
        crypto.timingSafeEqual(
          Buffer.from(signature, "hex"),
          Buffer.from(expectedSignature, "hex")
        )
      ) {
        return state;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Build Google OAuth authorization URL with proper parameters
   */
  private buildGoogleOAuthUrl(state: string): string {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = authConfig.getGoogleOAuthRedirectUri();

    if (!clientId) {
      throw new Error("Google OAuth client ID not configured");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state: state,
      access_type: "offline",
      prompt: "consent",
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Handle magic link request via REST endpoint
   * POST /api/auth/magic-link/request
   */
  public async requestMagicLinkRest(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: "Email address is required",
        });
        return;
      }

      const result = await this.magicLinkService.requestMagicLink(email);

      res.status(200).json(result);
    } catch (error) {
      logger.error("Magic link request failed in REST endpoint", {
        email: req.body?.email,
        error: error.message,
      });

      if (
        error instanceof ValidationError ||
        error instanceof BadRequestError
      ) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "Internal server error. Please try again later.",
      });
    }
  }

  /**
   * Handle magic link verification via REST endpoint with redirect
   * GET /api/auth/magic-link/verify?token=<token>
   */
  public async verifyMagicLinkRest(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        const errorUrl = authConfig.buildErrorRedirect(
          "invalid_token",
          "Magic link token is missing or invalid"
        );
        if (errorUrl) {
          res.redirect(errorUrl);
          return;
        }
        res.status(400).json({
          success: false,
          error: "Magic link token is required",
        });
        return;
      }

      const authResult = await this.magicLinkService.verifyMagicLink(token);

      // Build success redirect URL with tokens
      const successUrl = authConfig.buildSuccessRedirect(
        authResult.accessToken,
        authResult.refreshToken,
        authResult.user
      );

      if (successUrl) {
        logger.info("Magic link verification successful, redirecting", {
          userId: authResult.user._id,
          email: authResult.user.email,
        });
        res.redirect(successUrl);
        return;
      }

      // Fallback if redirect URL building fails
      res.status(200).json({
        success: true,
        message: "Authentication successful",
        accessToken: authResult.accessToken,
        refreshToken: authResult.refreshToken,
        user: authResult.user,
      });
    } catch (error) {
      logger.error("Magic link verification failed in REST endpoint", {
        token: req.query.token
          ? `${req.query.token.toString().substring(0, 8)}...`
          : "missing",
        error: error.message,
      });

      if (
        error instanceof ValidationError ||
        error instanceof UnauthorizedError
      ) {
        const errorUrl = authConfig.buildErrorRedirect(
          "auth_failed",
          error.message
        );
        if (errorUrl) {
          res.redirect(errorUrl);
          return;
        }
        res.status(401).json({
          success: false,
          error: error.message,
        });
        return;
      }

      // Handle unexpected errors
      const errorUrl = authConfig.buildErrorRedirect(
        "server_error",
        "An unexpected error occurred during authentication"
      );
      if (errorUrl) {
        res.redirect(errorUrl);
        return;
      }
      res.status(500).json({
        success: false,
        error: "Internal server error. Please try again later.",
      });
    }
  }

  /**
   * Initiate Google OAuth authentication
   * GET /api/auth/google/login
   */
  public async initiateGoogleOAuth(req: Request, res: Response): Promise<void> {
    try {
      // Generate state parameter for CSRF protection
      const state = this.generateStateParameter();

      // Store state in session or use signed cookie for verification
      // For now, we'll use a simple approach with signed state
      const signedState = this.signState(state);

      // Build Google OAuth authorization URL
      const googleOAuthUrl = this.buildGoogleOAuthUrl(signedState);

      logger.info("Initiating Google OAuth flow", {
        state: state.substring(0, 8) + "...", // Log partial state for debugging
        redirectUri: authConfig.getGoogleOAuthRedirectUri(),
      });

      // Redirect to Google OAuth
      res.redirect(googleOAuthUrl);
    } catch (error) {
      logger.error("Failed to initiate Google OAuth", {
        error: error.message,
      });

      const errorUrl = authConfig.buildErrorRedirect(
        "oauth_init_failed",
        "Failed to initiate Google OAuth authentication"
      );

      if (errorUrl) {
        res.redirect(errorUrl);
        return;
      }

      res.status(500).json({
        success: false,
        error: "Failed to initiate Google OAuth authentication",
      });
    }
  }

  /**
   * Handle Google OAuth callback
   * GET /api/auth/google/callback
   */
  public async handleGoogleCallback(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { code, state, error } = req.query;

      // Handle OAuth error from Google
      if (error) {
        logger.error("Google OAuth error", { error });
        const errorUrl = authConfig.buildErrorRedirect(
          "oauth_error",
          `Google OAuth error: ${error}`
        );
        if (errorUrl) {
          res.redirect(errorUrl);
          return;
        }
        res.status(400).json({
          success: false,
          error: `Google OAuth error: ${error}`,
        });
        return;
      }

      // Validate required parameters
      if (!code || typeof code !== "string") {
        logger.error("Missing authorization code in OAuth callback");
        const errorUrl = authConfig.buildErrorRedirect(
          "missing_code",
          "Authorization code is missing"
        );
        if (errorUrl) {
          res.redirect(errorUrl);
          return;
        }
        res.status(400).json({
          success: false,
          error: "Authorization code is missing",
        });
        return;
      }

      if (!state || typeof state !== "string") {
        logger.error("Missing state parameter in OAuth callback");
        const errorUrl = authConfig.buildErrorRedirect(
          "missing_state",
          "State parameter is missing"
        );
        if (errorUrl) {
          res.redirect(errorUrl);
          return;
        }
        res.status(400).json({
          success: false,
          error: "State parameter is missing",
        });
        return;
      }

      // Verify state parameter to prevent CSRF attacks
      const verifiedState = this.verifyState(state);
      if (!verifiedState) {
        logger.error("Invalid state parameter in OAuth callback", {
          state: state.substring(0, 8) + "...",
        });
        const errorUrl = authConfig.buildErrorRedirect(
          "invalid_state",
          "Invalid state parameter"
        );
        if (errorUrl) {
          res.redirect(errorUrl);
          return;
        }
        res.status(400).json({
          success: false,
          error: "Invalid state parameter",
        });
        return;
      }

      // Exchange authorization code for tokens
      const redirectUri = authConfig.getGoogleOAuthRedirectUri();
      const authTokens = await getGoogleOAuthTokens({
        code,
        redirect_uri: redirectUri,
      });

      if (authTokens.error) {
        logger.error("Failed to exchange OAuth code for tokens", {
          error: authTokens.error,
        });
        const errorUrl = authConfig.buildErrorRedirect(
          "token_exchange_failed",
          "Failed to exchange authorization code for tokens"
        );
        if (errorUrl) {
          res.redirect(errorUrl);
          return;
        }
        res.status(400).json({
          success: false,
          error: "Failed to exchange authorization code for tokens",
        });
        return;
      }

      // Get user information from Google
      const googleUser = await getGoogleUser({
        access_token: authTokens.access_token,
        id_token: authTokens.id_token,
      });

      if (!googleUser || !googleUser.email) {
        logger.error("Failed to get user information from Google");
        const errorUrl = authConfig.buildErrorRedirect(
          "user_info_failed",
          "Failed to get user information from Google"
        );
        if (errorUrl) {
          res.redirect(errorUrl);
          return;
        }
        res.status(400).json({
          success: false,
          error: "Failed to get user information from Google",
        });
        return;
      }

      // Upsert user in database
      const user = await User.upsertGoogleUser({
        email: googleUser.email,
        firstName: googleUser.given_name,
        lastName: googleUser.family_name,
        picture: googleUser.picture,
        verified_email: googleUser.verified_email,
      });

      // Generate JWT tokens
      const accessToken = createAccessToken(accessTokenData(user));
      const refreshToken = createRefreshToken({ id: user._id });

      logger.info("Google OAuth authentication successful", {
        userId: user._id,
        email: user.email,
      });

      // Build success redirect URL with tokens
      const successUrl = authConfig.buildSuccessRedirect(
        accessToken,
        refreshToken,
        user
      );

      if (successUrl) {
        res.redirect(successUrl);
        return;
      }

      // Fallback if redirect URL building fails
      res.status(200).json({
        success: true,
        message: "Google OAuth authentication successful",
        accessToken,
        refreshToken,
        user,
      });
    } catch (error) {
      logger.error("Google OAuth callback failed", {
        error: error.message,
        code: req.query.code ? "present" : "missing",
        state: req.query.state ? "present" : "missing",
      });

      const errorUrl = authConfig.buildErrorRedirect(
        "oauth_callback_failed",
        "Google OAuth authentication failed"
      );

      if (errorUrl) {
        res.redirect(errorUrl);
        return;
      }

      res.status(500).json({
        success: false,
        error: "Google OAuth authentication failed",
      });
    }
  }
}

export default AuthController;
