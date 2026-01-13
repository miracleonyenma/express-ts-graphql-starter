import User from "../../models/user.model.js";
import { initOTPGeneration } from "../../services/otp.services.js";
import { userService } from "../../services/user.services.js";
import crypto from "crypto";

const OTPResolvers = {
  Mutation: {
    requestOTP: async (parent, args, context, info) => {
      try {
        const email = args.email;
        if (!email) {
          throw new Error("Email is required");
        }

        const response = await initOTPGeneration(email);
        return response;
      } catch (error) {
        console.log("Mutation.requestOTP error", error);
        throw new Error(error.message || "Failed to request code");
      }
    },
    verifyOTP: async (parent, args, context, info) => {
      try {
        const { email, otp, shouldLogin } = args;
        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail }).select(
          "+loginOTP.codeHash"
        );

        if (!user || !user.loginOTP || !user.loginOTP.codeHash) {
          throw new Error("Invalid or expired code.");
        }

        if (new Date() > user.loginOTP.expiresAt) {
          throw new Error("Code has expired. Please request a new one.");
        }

        const inputHash = crypto.createHash("sha256").update(otp).digest("hex");

        if (inputHash !== user.loginOTP.codeHash) {
          user.loginOTP.attempts = (user.loginOTP.attempts || 0) + 1;
          await user.save();
          throw new Error("Invalid code.");
        }

        // Success: Verify email and clear OTP
        // Ideally we should keep OTP data for a bit or just clear it?
        // "Clear loginOTP" implies it's done.
        user.loginOTP = undefined;
        user.emailVerified = true; // Always verify email on success
        await user.save();

        let authData = {};
        if (shouldLogin) {
          const tokens = await userService.generateAuthTokens(user);
          authData = tokens;
        }

        return {
          success: true,
          message: "Verification successful.",
          ...authData,
          user, // Always return user if available/updated
        };
      } catch (error) {
        console.log("Mutation.verifyOTP error", error);
        throw new Error(error.message || "Verification failed");
      }
    },
  },
};

export default OTPResolvers;
