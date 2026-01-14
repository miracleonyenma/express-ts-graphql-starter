import otpGenerator from "otp-generator";
import { EmailService } from "../utils/emails/index.js";
// import OTP from "../models/otp.model.js";
import User from "../models/user.model.js";
import { config } from "dotenv";

config();

const APP_URL = process.env.APP_URL;

const sendVerificationMail = async (
  email: string,
  otp: string,
  userName?: string
) => {
  const verificationLink = `${APP_URL}/auth/verify?email=${email}&otp=${otp}&sent=true`;
  try {
    // Initialize the email service with default provider from environment
    const emailService = new EmailService();

    // Generate a more professional-looking email template with the OTP
    const content = `
      <p>Your one-time verification code is:</p>
      <div style="text-align: center; margin: 25px 0;">
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 12px 24px; background-color: #f7f7f7; display: inline-block; border-radius: 4px;">${otp}</div>
        <br />
        <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #1a74e4; color: white; text-decoration: none; border-radius: 4px; font-weight: 500; margin: 20px 0;">Verify Email</a>
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
    `;

    // Use the standard template for a consistent look and feel
    const emailBody = emailService.generateMinimalistTemplate({
      title: "Email Verification",
      content,
    });

    // Send the email using the new EmailService
    const mailResponse = await emailService.sendEmail({
      subject: "Email Verification Code",
      htmlBody: emailBody,
      to: {
        email,
        name: userName || email.split("@")[0], // Use userName if provided, otherwise use email username
      },
    });

    return mailResponse;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error(error.message || "Failed to send verification email");
  }
};

const initOTPGeneration = async (email: string) => {
  try {
    const normalizeEmail = email.toLowerCase().trim();
    // Check if user with email exists
    let user = await User.findOne({ email: normalizeEmail });

    if (!user) {
      // Create new user if not exists
      const firstName = normalizeEmail.split("@")[0];
      user = await User.create({
        email: normalizeEmail,
        firstName,
        lastName: "",
        emailVerified: false,
      });

      // Import userService dynamically to avoid circular dependency issues if any
      const { userService } = await import("./user.services.js");
      await userService.assignRoleToUser(user._id.toString(), "user", true);
    }

    // Throttling
    if (user.loginOTP?.lastSentAt) {
      const timeSinceLast =
        Date.now() - new Date(user.loginOTP.lastSentAt).getTime();
      if (timeSinceLast < 60 * 1000) {
        throw new Error("Please wait 60 seconds before requesting a new code.");
      }
    }

    // Generate OTP - 6 digits
    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    // Hash Code
    const crypto = await import("crypto");
    const codeHash = crypto.createHash("sha256").update(otp).digest("hex");

    // Save to User
    user.loginOTP = {
      codeHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      attempts: 0,
      lastSentAt: new Date(),
    };

    await user.save();

    // Send verification email with user's name if available
    const mailResponse = await sendVerificationMail(
      user.email,
      otp,
      user.firstName
    );

    console.log("Email sent:", mailResponse);

    return {
      success: true,
      message: "OTP sent successfully",
    };
  } catch (error) {
    console.error("OTP generation error:", error);
    throw new Error(error.message || "Failed to generate OTP");
  }
};

export { sendVerificationMail, initOTPGeneration };
