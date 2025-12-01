import prisma from "../../config/prisma.js";
import { initOTPGeneration } from "../../services/otp.services.js";

const OTPResolvers = {
  Query: {
    otps: async (parent, args, context, info) => {
      try {
        const otps = await prisma.otp.findMany();

        return otps;
      } catch (error) {
        console.log("Query.otps error", error);
        throw new Error(error);
      }
    },
    otp: async (parent, args, context, info) => {
      try {
        return await prisma.otp.findUnique({ where: { id: args.id } });
      } catch (error) {
        console.log("Query.otp error", error);
        throw new Error(error);
      }
    },
  },
  Mutation: {
    sendOTP: async (parent, args, context, info) => {
      try {
        console.log("args", args);

        const email = args?.input?.email;
        if (!email) {
          throw new Error("Email is required");
        }
        const response = await initOTPGeneration(email);
        console.log({ response });

        return `OTP sent to ${email} successfully`;
      } catch (error) {
        console.log("Mutation.sendOTP error", error);
        throw new Error(error);
      }
    },
    verifyOTP: async (parent, args, context, info) => {
      try {
        console.log("args", args);

        const email = args.input?.email;
        const otp = args.input?.otp;
        const otpDoc = await prisma.otp.findFirst({ where: { email, otp } });
        console.log({ otpDoc });

        if (!otpDoc) {
          throw new Error("Invalid OTP");
        }
        // get user from email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          throw new Error("User not found");
        }
        // set user as verified
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true },
        });

        console.log({ updatedUser });

        // await prisma.otp.delete({ where: { id: otpDoc.id } });
        return true;
      } catch (error) {
        console.log("Mutation.verifyOTP error", error);
        throw new Error(error);
      }
    },
  },
};

export default OTPResolvers;
