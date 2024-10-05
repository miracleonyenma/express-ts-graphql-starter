import User from "../../models/user.model.js";
import PasswordResetToken from "../../models/passwordResetToken.model.js";
import { generateResetToken } from "../../utils/token.js";
import { genSalt, hash } from "bcrypt";

const passwordResetResolvers = {
  Mutation: {
    requestPasswordReset: async (parent, args, context, info) => {
      try {
        console.log("args", args.email);

        const email = args.email;
        const user = await User.findOne({ email });

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
        const resetPasswordToken = await PasswordResetToken.create({
          userId: user.id,
          token: resetToken,
        });

        console.log({ resetPasswordToken });
        return true;
      } catch (error) {
        console.log("Mutation.requestPasswordReset error", error);
        throw new Error(error);
      }
    },
    resetPassword: async (parent, args, context, info) => {
      try {
        const { token, password } = args;

        const resetPasswordToken = await PasswordResetToken.findOne({
          token,
        });

        if (!resetPasswordToken) {
          throw new Error("Invalid or expired token");
        }

        const user = await User.findById(resetPasswordToken.userId);

        if (!user) {
          throw new Error("User not found");
        }

        // hash password
        const salt = await genSalt(10);
        const hashedPassword = await hash(password, salt);

        user.password = hashedPassword;

        await user.save();

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
