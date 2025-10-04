// ./src/services/magicLink.services.ts

import crypto from "crypto";
import bcrypt from "bcrypt";
import { config } from "dotenv";
import { logger } from "@untools/logger";
import MagicLinkToken from "../models/magicLinkToken.model.js";
import User from "../models/user.model.js";
import { EmailService, createEmailButton } from "../utils/emails/index.js";
import {
  BadRequestError,
  UnauthorizedError,
  ValidationError,
  ErrorHandler,
  InternalServerError,
} from "./error.services.js";
import {
  createAccessToken,
  createRefreshToken,
  accessTokenData,
} from "../utils/token.js";
import { UserDocument } from "../types/user.js";
import { authConfig } from "../config/auth.config.js";

config();

const APP_NAME = process.env.APP_NAME || "Application";

/**
 * Rate limiting storage for magic link requests
 * In production, this should be replaced with Redis or similar
 */
interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Magic Link Service for handling passwordless authentication
 */
class MagicLinkService {
  private readonly RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds
  private readonly RATE_LIMIT_MAX_REQUESTS = 3;
  private readonly TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes in milliseconds

  /**
   * Generate a cryptographically secure token
   * @returns {string} A secure random token
   */
  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Compare a raw token with a hashed token using constant-time comparison
   * @param rawToken The raw token to compare
   * @param hashedToken The hashed token to compare against
   * @returns {Promise<boolean>} True if tokens match
   */
  private async compareTokens(
    rawToken: string,
    hashedToken: string
  ): Promise<boolean> {
    return bcrypt.compare(rawToken, hashedToken);
  }

  /**
   * Check rate limiting for magic link requests
   * @param email The email address to check
   * @returns {boolean} True if request is allowed, false if rate limited
   */
  private checkRateLimit(email: string): boolean {
    const now = Date.now();
    const entry = rateLimitStore.get(email);

    if (!entry) {
      // First request for this email
      rateLimitStore.set(email, { count: 1, windowStart: now });
      return true;
    }

    // Check if we're still in the same window
    if (now - entry.windowStart < this.RATE_LIMIT_WINDOW) {
      if (entry.count >= this.RATE_LIMIT_MAX_REQUESTS) {
        return false; // Rate limited
      }
      entry.count++;
      return true;
    } else {
      // New window, reset counter
      rateLimitStore.set(email, { count: 1, windowStart: now });
      return true;
    }
  }

  /**
   * Get remaining time for rate limit window
   * @param email The email address to check
   * @returns {number} Remaining time in minutes
   */
  private getRateLimitRemainingTime(email: string): number {
    const entry = rateLimitStore.get(email);
    if (!entry) return 0;

    const now = Date.now();
    const elapsed = now - entry.windowStart;
    const remaining = this.RATE_LIMIT_WINDOW - elapsed;
    return Math.ceil(remaining / (60 * 1000)); // Convert to minutes
  }

  /**
   * Clean up expired rate limit entries
   */
  private cleanupRateLimitStore(): void {
    const now = Date.now();
    for (const [email, entry] of rateLimitStore.entries()) {
      if (now - entry.windowStart >= this.RATE_LIMIT_WINDOW) {
        rateLimitStore.delete(email);
      }
    }
  }

  /**
   * Validate email format
   * @param email The email to validate
   * @returns {boolean} True if email is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Request a magic link for the given email address
   * @param email The user's email address
   * @returns {Promise<{success: boolean, message: string}>} Result of the request
   */
  async requestMagicLink(email: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Clean up expired rate limit entries
      this.cleanupRateLimitStore();

      // Validate input
      if (!email) {
        throw new ValidationError("Email address is required");
      }

      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();

      // Validate email format
      if (!this.isValidEmail(normalizedEmail)) {
        throw new ValidationError("Please provide a valid email address");
      }

      // Check rate limiting
      if (!this.checkRateLimit(normalizedEmail)) {
        const remainingTime = this.getRateLimitRemainingTime(normalizedEmail);
        logger.warn("Magic link rate limit exceeded", {
          email: normalizedEmail,
          remainingTime,
        });
        throw new BadRequestError(
          `Too many requests. Please try again in ${remainingTime} minutes.`
        );
      }

      // Check if user exists (but don't reveal this information in the response)
      const userExists = await User.findOne({ email: normalizedEmail });

      if (userExists) {
        // Generate secure token
        const rawToken = this.generateSecureToken();

        // Create magic link token record
        const magicLinkToken = new MagicLinkToken({
          email: normalizedEmail,
          tokenHash: rawToken, // This will be hashed in the pre-save middleware
          expires: new Date(Date.now() + this.TOKEN_EXPIRY),
        });

        // Save the token first
        await magicLinkToken.save();

        // Send magic link email with the raw token
        try {
          await sendMagicLinkMail(
            normalizedEmail,
            rawToken,
            `${userExists.firstName} ${userExists.lastName}`.trim() || undefined
          );
        } catch (emailError) {
          console.log("🚫 Error sending magic link: ", emailError);
          // If email sending fails, clean up the token to maintain consistency
          await MagicLinkToken.findByIdAndDelete(magicLinkToken._id);
          logger.error("Failed to send magic link email, token cleaned up", {
            email: normalizedEmail,
            tokenId: magicLinkToken._id,
            error: emailError.message,
          });
          throw new InternalServerError(
            "Failed to send magic link email. Please try again later."
          );
        }

        logger.info("Magic link requested successfully", {
          email: normalizedEmail,
          tokenId: magicLinkToken._id,
        });
      } else {
        // Log the attempt for security monitoring
        logger.warn("Magic link requested for non-existent user", {
          email: normalizedEmail,
        });
      }

      // Always return success message for security (don't reveal if user exists)
      return {
        success: true,
        message:
          "If an account with this email exists, a magic link has been sent.",
      };
    } catch (error) {
      logger.error("Magic link request failed", {
        email: email?.toLowerCase()?.trim(),
        error: error.message,
      });

      // Re-throw known errors
      if (
        error instanceof ValidationError ||
        error instanceof BadRequestError
      ) {
        throw error;
      }

      // Handle unexpected errors
      throw ErrorHandler.handleError(error);
    }
  }

  /**
   * Verify a magic link token and authenticate the user
   * @param token The magic link token to verify
   * @returns {Promise<{accessToken: string, refreshToken: string, user: UserDocument}>} Authentication result
   */
  async verifyMagicLink(token: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserDocument;
  }> {
    try {
      // Validate input
      if (!token) {
        throw new ValidationError("Magic link token is required");
      }

      // Normalize token
      const normalizedToken = token.trim();

      // Find all unused magic link tokens and check each one
      // We need to do this because tokens are hashed in the database
      const magicLinkTokens = await MagicLinkToken.find({
        used: false,
        expires: { $gt: new Date() }, // Only get non-expired tokens
      });

      let validToken = null;

      // Use constant-time comparison to prevent timing attacks
      for (const dbToken of magicLinkTokens) {
        const isMatch = await this.compareTokens(
          normalizedToken,
          dbToken.tokenHash
        );
        if (isMatch) {
          validToken = dbToken;
          break;
        }
      }

      if (!validToken) {
        logger.warn("Invalid or expired magic link token used", {
          tokenPrefix: normalizedToken.substring(0, 8) + "...",
        });
        throw new UnauthorizedError(
          "This magic link has expired or is invalid. Please request a new one."
        );
      }

      // Find the user associated with this token
      const user = await User.findOne({ email: validToken.email }).populate(
        "roles"
      );

      if (!user) {
        logger.error("Magic link token found but user does not exist", {
          email: validToken.email,
          tokenId: validToken._id,
        });
        throw new UnauthorizedError("User account not found.");
      }

      // Mark token as used to prevent reuse
      validToken.used = true;
      await validToken.save();

      // Generate JWT tokens using existing patterns
      const accessToken = createAccessToken(accessTokenData(user));
      const refreshToken = createRefreshToken({ id: user._id });

      logger.info("Magic link authentication successful", {
        userId: user._id,
        email: user.email,
        tokenId: validToken._id,
      });

      return {
        accessToken,
        refreshToken,
        user,
      };
    } catch (error) {
      logger.error("Magic link verification failed", {
        tokenPrefix: token?.substring(0, 8) + "...",
        error: error.message,
      });

      // Re-throw known errors
      if (
        error instanceof ValidationError ||
        error instanceof UnauthorizedError
      ) {
        throw error;
      }

      // Handle unexpected errors
      throw ErrorHandler.handleError(error);
    }
  }

  /**
   * Clean up expired magic link tokens
   * This method can be called periodically for maintenance
   * @returns {Promise<number>} Number of tokens cleaned up
   */
  async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await MagicLinkToken.deleteMany({
        $or: [
          { expires: { $lt: new Date() } }, // Expired tokens
          { used: true }, // Used tokens older than 1 hour
        ],
      });

      logger.info("Cleaned up expired magic link tokens", {
        deletedCount: result.deletedCount,
      });

      return result.deletedCount;
    } catch (error) {
      logger.error("Failed to cleanup expired magic link tokens", error);
      throw ErrorHandler.handleError(error);
    }
  }
}

/**
 * Validates email configuration for magic link sending
 */
const validateEmailConfiguration = (): void => {
  const requiredEmailVars = ["MAIL_USER"];
  const missingVars = requiredEmailVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      `Warning: Email configuration incomplete. Missing: ${missingVars.join(", ")}. Magic link emails may fail to send.`
    );
  }

  // Check if a valid email provider is configured
  const emailProvider = process.env.DEFAULT_MAIL_PROVIDER || "nodemailer";
  const validProviders = ["nodemailer", "zeptomail", "resend"];

  if (!validProviders.includes(emailProvider)) {
    console.warn(
      `Warning: Invalid email provider '${emailProvider}'. Valid options: ${validProviders.join(", ")}`
    );
  }

  // Provider-specific validation
  if (emailProvider === "zeptomail" && !process.env.ZOHO_KEY) {
    console.warn("Warning: ZeptoMail selected but ZOHO_KEY is not configured");
  }

  if (emailProvider === "resend" && !process.env.RESEND_API_KEY) {
    console.warn(
      "Warning: Resend selected but RESEND_API_KEY is not configured"
    );
  }

  if (
    emailProvider === "nodemailer" &&
    (!process.env.MAIL_USER || !process.env.MAIL_PASS)
  ) {
    console.warn(
      "Warning: Nodemailer selected but MAIL_USER or MAIL_PASS is not configured"
    );
  }
};

/**
 * Send magic link email to user
 * @param email The user's email address
 * @param token The raw magic link token
 * @param userName Optional user's name for personalization
 * @returns Email sending result
 */
export const sendMagicLinkMail = async (
  email: string,
  token: string,
  userName?: string
) => {
  try {
    // Validate email configuration before attempting to send
    validateEmailConfiguration();

    // Initialize email service
    const emailService = new EmailService();

    // Create the magic link URL using configurable URL generation
    const magicLinkURL = authConfig.generateMagicLinkUrl(token);

    // Create email content with proper button styling
    const content = `
      <p>Hello${userName ? ` ${userName}` : ""},</p>
      <p>Click the button below to securely log into your ${APP_NAME} account:</p>
      ${createEmailButton(`Log In to ${APP_NAME}`, magicLinkURL)}
      <p><strong>Important security information:</strong></p>
      <ul>
        <li>This link will expire in <strong>15 minutes</strong> for your security</li>
        <li>This link can only be used <strong>once</strong></li>
        <li>If you didn't request this login link, please ignore this email</li>
      </ul>
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        Need a new link? Simply request another magic link from the login page.
      </p>
    `;

    // Use the standard template for consistent branding
    const emailBody = emailService.generateStandardTemplate({
      title: "Your Secure Login Link",
      content,
      logoUrl: process.env.MAIL_LOGO,
      supportEmail: process.env.APP_SUPPORT_MAIL,
      footerText: `© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.`,
    });

    // Send the email with proper error handling
    const mailResponse = await emailService.sendEmail({
      subject: `${APP_NAME} - Your Secure Login Link`,
      htmlBody: emailBody,
      to: {
        email,
        name: userName || email.split("@")[0],
      },
    });

    logger.log("🔍 Mail Response: ", mailResponse);

    if (!mailResponse.success) {
      logger.error("Failed to send magic link email", {
        email,
        error: mailResponse.error,
        details: mailResponse.details,
      });
      throw new InternalServerError(
        "Failed to send magic link email. Please try again later."
      );
    }

    logger.info("Magic link email sent successfully", {
      email,
      messageId: mailResponse.messageId,
    });

    return {
      success: true,
      message: "Magic link email sent successfully",
      messageId: mailResponse.messageId,
    };
  } catch (error) {
    logger.error("Error sending magic link email:", error);
    throw new Error(error.message || "Failed to send magic link email");
  }
};

export default MagicLinkService;
