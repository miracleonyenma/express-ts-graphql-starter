import { Types } from "mongoose";
import pkg, { JwtPayload } from "jsonwebtoken";
import { config } from "dotenv";
import crypto from "crypto";

const { sign, verify } = pkg;
config();

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "youraccesstokensecret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "yourrefreshtokensecret";

// Create access token
const createAccessToken = (data: any | { id: Types.ObjectId }, dur = "15m") => {
  return sign({ data }, ACCESS_TOKEN_SECRET, {
    expiresIn: dur,
  });
};

// Create refresh token
const createRefreshToken = (data: any | { id: Types.ObjectId }, dur = "7d") => {
  return sign({ data }, REFRESH_TOKEN_SECRET, {
    expiresIn: dur,
  });
};

// Verify access token
const verifyAccessToken = (token: string) => {
  return verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
};

// Verify refresh token
const verifyRefreshToken = (token: string) => {
  return verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;
};

const generateApiKey = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateApiKey,
};
