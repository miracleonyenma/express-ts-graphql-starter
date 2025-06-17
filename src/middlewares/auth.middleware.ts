// ./src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token.js";

export interface CustomRequest extends Request {
  user?: Partial<{
    data?: {
      id: string;
      email: string;
      roles: string[];
      emailVerified: boolean;
    };
    iat: number;
    exp: number;
  }>;
}

export const authenticate = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (req.path == "/graphql" && req.method == "GET") return next();

  if (!authHeader) {
    console.log("Authorization header missing");
    req.user = null;
    return next();
  }

  try {
    // Handle both single and multiple Bearer tokens
    // Remove commas and split by spaces
    const parts = authHeader.replace(/,/g, "").split(" ").filter(Boolean);

    // Find all Bearer tokens - get the last one (actual JWT)
    let token = null;
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].toLowerCase() === "bearer" && i + 1 < parts.length) {
        // Check if the next part looks like a JWT (contains dots)
        const potentialToken = parts[i + 1];
        if (potentialToken && potentialToken.includes(".")) {
          token = potentialToken;
        }
      }
    }

    if (!token) {
      throw new Error(
        "Invalid authorization header - no valid JWT token found"
      );
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("🚨🚨🚨🚨🚨 ~ authenticate error", error.message);
    req.user = null;
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
