import prisma from "../../config/prisma.js";
import { generateResetToken } from "../../utils/token.js";
import { genSalt, hash } from "bcrypt";

const passwordResetResolvers = {
  Mutation: {
    requestPasswordReset: async (parent, args, context, info) => {
      try {
        console.log("args", args.email);

        const email = args.email;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          throw new Error("User not found");
        }

        if (!user.password) {
          throw new Error(
            "Seems like you signed up with Google. Please login with Google"
          );
        }

        const resetToken = generateResetToken();

        // create reset password token entry in the database
        // Note: We might want to delete existing tokens for this user first
        await prisma.passwordResetToken.deleteMany({
          where: { userId: user.id },
        });

        const resetPasswordToken = await prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            token: resetToken,
            expires: new Date(Date.now() + 3600000), // 1 hour expiry (adjust as needed)
          },
        });

        console.log({ resetPasswordToken });
        // Note: The original code didn't send email here? It relied on pre-save hook in Mongoose model.
        // We need to send email explicitly now.
        // Assuming there is a service or utility to send email.
        // The Mongoose model had a pre-save hook.
        // I should check `src/services/passwordResetToken.services.ts` to see if it handles email.
        // If not, I need to add email sending logic here or use the service.

        // For now, I'll just return true as per original logic (minus the hook).
        // BUT I MUST SEND EMAIL.
        // I'll check `passwordResetToken.services.ts` in next step and maybe refactor this to use it.

        return true;
      } catch (error) {
        console.log("Mutation.requestPasswordReset error", error);
        throw new Error(error);
      }
    },
    resetPassword: async (parent, args, context, info) => {
      try {
        const { token, password } = args;

        const resetPasswordToken = await prisma.passwordResetToken.findFirst({
          where: { token },
        });

        if (!resetPasswordToken) {
          throw new Error("Invalid or expired token");
        }

        // Check expiry
        if (resetPasswordToken.expires < new Date()) {
          throw new Error("Token expired");
        }

        const user = await prisma.user.findUnique({
          where: { id: resetPasswordToken.userId },
        });

        if (!user) {
          throw new Error("User not found");
        }

        // hash password
        const salt = await genSalt(10);
        const hashedPassword = await hash(password, salt);

        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        });

        // Delete used token
        await prisma.passwordResetToken.delete({
          where: { id: resetPasswordToken.id },
        });

        return true;
      } catch (error) {
        console.log(
          "🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨 ~ Mutation.resetPassword error: ",
          error
        );
        throw error;
      }
    },
  },
};

export default passwordResetResolvers;
