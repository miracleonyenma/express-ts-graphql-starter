// ./src/middlewares/apiKey.middleware.ts

import { Request, Response, NextFunction } from "express";
import ApiKey from "../models/apiKey.model.js";
import User from "../models/user.model.js"; // Import User model
import { Types } from "mongoose";

export interface ApiKeyRequest extends Request {
  apiKey?: string;
  owner?: {
    id: string;
    email: string;
    roles: Types.ObjectId[];
    emailVerified: boolean;
  };
}

export interface ApiKeyOptions {
  /**
   * If true, allows requests without API keys to proceed.
   * The request will continue with req.apiKey = null and req.owner = null
   */
  soft?: boolean;

  /**
   * Paths to skip API key validation
   */
  skipPaths?: Array<{ path: string; method?: string }>;

  /**
   * If true, populates req.owner with the API key owner's user information
   */
  populateOwner?: boolean;
}

export const validateApiKey = (options: ApiKeyOptions = {}) => {
  const {
    soft = false,
    skipPaths = [
      { path: "/graphql", method: "GET" },
      { path: "/graphql", method: "OPTIONS" },
      { path: "/", method: "GET" },
      { path: "/", method: "OPTIONS" },
    ],
    populateOwner = true,
  } = options;

  return async (
    req: ApiKeyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Check if this path should skip validation
      const shouldSkip = skipPaths.some(
        (skip) =>
          req.path === skip.path && (!skip.method || req.method === skip.method)
      );

      if (shouldSkip) {
        next();
        return;
      }

      const apiKey = req.headers["x-api-key"] as string;

      if (!apiKey) {
        req.apiKey = null;
        req.owner = null;

        if (soft) {
          next();
          return;
        }

        res.status(401).json({ error: "API key is required" });
        return;
      }

      const key = await ApiKey.findOne({ key: apiKey });

      if (!key) {
        req.apiKey = null;
        req.owner = null;

        if (soft) {
          next();
          return;
        }

        res.status(403).json({ error: "Invalid API key" });
        return;
      }

      req.apiKey = apiKey;

      // Populate owner information if requested
      if (populateOwner && key.owner) {
        const owner = await User.findById(key.owner).select(
          "email roles emailVerified"
        );

        if (owner) {
          req.owner = {
            id: owner._id.toString(),
            email: owner.email,
            roles: owner.roles || [],
            emailVerified: owner.emailVerified || false,
          };
        }
      }

      next();
    } catch (error) {
      console.error("🚨 Error in API Key middleware:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
};
