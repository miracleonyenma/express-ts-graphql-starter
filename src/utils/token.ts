import { Types } from "mongoose";
import pkg from "jsonwebtoken";
import { config } from "dotenv";

const { sign } = pkg;
config();

const JWT_SECRET = process.env.JWT_SECRET;

const createToken = (
  data: any | { id: Types.ObjectId },
  // defualt 3 days
  dur = 3 * 24 * 60 * 60
) => {
  return sign({ data }, JWT_SECRET, {
    expiresIn: dur,
  });
};

export { createToken };
