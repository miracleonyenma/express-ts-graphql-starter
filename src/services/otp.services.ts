import otpGenerator from "otp-generator";
import { EmailService } from "../utils/emails/index.js";
import OTP from "../models/otp.model.js";
import User from "../models/user.model.js";
import { config } from "dotenv";

config();

const sendVerificationMail = async (
  email: string,
  otp: string,
  userName?: string
) => {
  try {
    // Initialize the email service with default provider from environment
    const emailService = new EmailService();

    // Generate a more professional-looking email template with the OTP
    const content = `
      <p>Your one-time verification code is:</p>
      <div style="text-align: center; margin: 25px 0;">
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 12px 24px; background-color: #f7f7f7; display: inline-block; border-radius: 4px;">${otp}</div>
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
  console.log({ email });

  try {
    // Check if user with email exists
    const userExists = await User.findOne({ email });

    console.log({ userExists });

    if (!userExists) {
      throw new Error("User with email does not exist");
    }

    // Generate OTP - 6 digits, no lowercase, no special chars
    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Save OTP to database with expiry (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Create or update OTP record
    const OTPObject = await OTP.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        expiresAt,
        verified: false,
      },
      { upsert: true, new: true }
    );

    // Send verification email with user's name if available
    const mailResponse = await sendVerificationMail(
      email,
      otp,
      userExists.firstName
    );

    console.log("Email sent:", mailResponse);

    return {
      success: true,
      message: "OTP sent successfully",
      data: OTPObject,
    };
  } catch (error) {
    console.error("OTP generation error:", error);

    return {
      success: false,
      message: error.message || "Failed to generate OTP",
      error,
    };
  }
};

export { sendVerificationMail, initOTPGeneration };
