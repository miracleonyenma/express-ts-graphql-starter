import mongoose, { Schema } from "mongoose";
import { sendPasswordResetMail } from "../services/passwordResetToken.services.js";
import User from "../models/user.model.js";

const PasswordResetTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    token: {
      type: String,
      required: true,
    },
    expires: {
      type: Date,
      required: true,
      default: Date.now() + 20 * 60 * 1000, // expires in 1 minute
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      expires: 20 * 60 * 1000, // expires in 1 minute
    },
  },
  {
    timestamps: true, // createdAt and updatedAt
  }
);

PasswordResetTokenSchema.pre("save", async function (next) {
  // Check if the token is new
  if (this.isNew) {
    // Check if the email already exists
    const existingToken = await this.model("PasswordResetToken").findOne({
      userId: this.userId,
    });

    console.log({ existingToken });

    // if the token already exists, delete it
    if (existingToken) {
      await existingToken.deleteOne();
    }

    // find the user
    const user = await User.findById(this.userId);

    // send email
    await sendPasswordResetMail(user.email, this.token);
  }
  next();
});

export default mongoose.model("PasswordResetToken", PasswordResetTokenSchema);
