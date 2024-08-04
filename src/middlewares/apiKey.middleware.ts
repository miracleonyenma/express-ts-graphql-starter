import { Request, Response, NextFunction } from "express";
import ApiKey from "../models/apiKey.model.js";

export interface ApiKeyRequest extends Request {
  apiKey?: string;
}

const validateApiKey = async (
  req: ApiKeyRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.headers["x-api-key"] as string;

    console.log("🪵🪵🪵🪵🪵 ~ apiKey: ", apiKey);

    // console.log("🪵🪵🪵🪵🪵 ~ path", req.path);
    // console.log("🪵🪵🪵🪵🪵 ~ method", req.method);

    if (
      (req.path == "/graphql" || "/") &&
      (req.method == "GET" || req.method == "OPTIONS")
    )
      return next();

    if (!apiKey) {
      return res.status(401).json({ error: "API key is required" });
    }

    const key = await ApiKey.findOne({ key: apiKey });

    if (!key) {
      return res.status(403).json({ error: "Invalid API key" });
    }

    req.apiKey = apiKey;
    next();
  } catch (error) {
    console.log("🚨🚨🚨🚨🚨 ~ error", error);
  }
};

export { validateApiKey };
