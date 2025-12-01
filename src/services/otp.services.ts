import otpGenerator from "otp-generator";
import { EmailService } from "../utils/emails/index.js";
import prisma from "../config/prisma.js";
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
  console.log({ email });

  try {
    // Check if user with email exists
    const userExists = await prisma.user.findUnique({ where: { email } });

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
    // Note: Prisma doesn't have native TTL, so we rely on cron or logic to clean up, or just check expiry on read.
    // However, Mongoose had TTL index. PostgreSQL doesn't have native TTL.
    // We can use a scheduled job or just ignore expired ones.
    // For now, we just save it.

    // Check if OTP exists for this email
    const existingOTP = await prisma.otp.findFirst({ where: { email } });

    let OTPObject;
    if (existingOTP) {
      OTPObject = await prisma.otp.update({
        where: { id: existingOTP.id },
        data: { otp, createdAt: new Date() }, // Update createdAt to reset timer effectively if we check age
      });
    } else {
      OTPObject = await prisma.otp.create({
        data: { email, otp },
      });
    }

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
