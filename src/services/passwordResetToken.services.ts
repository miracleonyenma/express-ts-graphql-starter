import { EmailService } from "../utils/emails/index.js";
import { config } from "dotenv";

config();

// Environment variables
const APP_NAME = process.env.APP_NAME || "Application";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

/**
 * Sends a password reset email to the user
 * @param email The user's email address
 * @param token The password reset token
 * @param userName Optional user's name for personalization
 * @returns Email sending result
 */
const sendPasswordResetMail = async (
  email: string,
  token: string,
  userName?: string
) => {
  try {
    // Initialize email service with default provider from environment
    const emailService = new EmailService();

    // Create the reset URL
    const resetURL = `${APP_URL}/auth/reset-password?token=${token}`;

    // Use the built-in password reset template
    const emailBody = emailService.generatePasswordResetEmail({
      userName: userName || email.split("@")[0], // Use name if provided, otherwise use email username
      resetUrl: resetURL,
      expiryTime: "1 hour", // Specify the token expiry time
    });

    // Send the email
    const mailResponse = await emailService.sendEmail({
      subject: `${APP_NAME} - Password Reset Request`,
      htmlBody: emailBody,
      to: {
        email,
        name: userName || email.split("@")[0],
      },
    });

    console.log("Password reset email sent:", mailResponse.success);

    return {
      success: mailResponse.success,
      message: "Password reset email sent successfully",
      details: mailResponse,
    };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error(error.message || "Failed to send password reset email");
  }
};

/**
 * Sends a password change confirmation email
 * @param email The user's email address
 * @param userName Optional user's name for personalization
 * @returns Email sending result
 */
const sendPasswordChangeConfirmationMail = async (
  email: string,
  userName?: string
) => {
  try {
    // Initialize email service
    const emailService = new EmailService();

    // Create the login URL
    const loginURL = `${APP_URL}/auth/login`;

    // Create the content
    const content = `
      <p>Your password has been successfully changed.</p>
      <p>If you did not make this change, please contact our support team immediately.</p>
    `;

    // Use the standard template
    const emailBody = emailService.generateStandardTemplate({
      title: "Password Changed Successfully",
      content,
      buttonText: "Log In",
      buttonUrl: loginURL,
    });

    // Send the email
    const mailResponse = await emailService.sendEmail({
      subject: `${APP_NAME} - Password Changed`,
      htmlBody: emailBody,
      to: {
        email,
        name: userName || email.split("@")[0],
      },
    });

    return {
      success: mailResponse.success,
      message: "Password change confirmation email sent successfully",
      details: mailResponse,
    };
  } catch (error) {
    console.error("Error sending password change confirmation email:", error);
    throw new Error(
      error.message || "Failed to send password change confirmation email"
    );
  }
};

export { sendPasswordResetMail, sendPasswordChangeConfirmationMail };
