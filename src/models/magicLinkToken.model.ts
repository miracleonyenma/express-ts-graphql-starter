import mongoose, { Schema } from "mongoose";
import { hash } from "bcrypt";

const MagicLinkTokenSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expires: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    },
    used: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 900, // TTL index - 15 minutes (900 seconds)
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for better query performance
MagicLinkTokenSchema.index({ email: 1, used: 1 });
MagicLinkTokenSchema.index({ tokenHash: 1, used: 1 });

MagicLinkTokenSchema.pre("save", async function (next) {
  // Check if the token is new
  if (this.isNew) {
    // Check if there are existing unused tokens for this email
    const existingTokens = await this.model("MagicLinkToken").find({
      email: this.email,
      used: false,
    });

    // Delete any existing unused tokens for this email
    if (existingTokens.length > 0) {
      await this.model("MagicLinkToken").deleteMany({
        email: this.email,
        used: false,
      });
    }

    // Hash the token before saving (the token is passed as tokenHash but needs to be hashed)
    // Note: The service will pass the raw token in tokenHash field, we hash it here
    if (this.tokenHash) {
      const saltRounds = 12;
      this.tokenHash = await hash(this.tokenHash, saltRounds);
    }
  }
  next();
});

export default mongoose.model("MagicLinkToken", MagicLinkTokenSchema);
