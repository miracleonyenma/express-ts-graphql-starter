// ./src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction, RequestHandler } from "express";
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

export interface AuthOptions {
  /**
   * If true, allows unauthenticated requests to proceed without throwing errors.
   * The request will continue with req.user = null
   */
  soft?: boolean;

  /**
   * Paths to skip authentication (e.g., public GraphQL playground)
   */
  skipPaths?: Array<{ path: string; method?: string }>;
}

export const authenticate = (options: AuthOptions = {}): RequestHandler => {
  const { soft = false, skipPaths = [{ path: "/graphql", method: "GET" }] } =
    options;

  return (req: CustomRequest, res: Response, next: NextFunction): void => {
    // Check if this path should skip authentication
    const shouldSkip = skipPaths.some(
      (skip) =>
        req.path === skip.path && (!skip.method || req.method === skip.method)
    );

    if (shouldSkip) {
      next();
      return;
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("Authorization header missing");
      req.user = null;

      if (soft) {
        next();
        return;
      }

      res.status(401).json({ message: "Authorization header required" });
      return;
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
      console.log("🚨 authenticate error:", error.message);
      req.user = null;

      if (soft) {
        next();
        return;
      }

      res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};
