import mongoose, { Schema } from "mongoose";
import { sendVerificationMail } from "../services/otp.services.js";

const OTPSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      expires: 600, // expires in 10 minutes
    },
  },
  {
    timestamps: true,
  }
);

OTPSchema.pre("save", async function (next) {
  if (this.isNew) {
    const existingOTP = await this.model("OTP").findOne({ email: this.email });
    if (existingOTP) {
      await existingOTP.deleteOne();
    }

    await sendVerificationMail(this.email, this.otp);
  }
  next();
});

export default mongoose.model("OTP", OTPSchema);
