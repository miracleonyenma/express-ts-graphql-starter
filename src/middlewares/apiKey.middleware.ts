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
  const apiKey = req.headers["x-api-key"] as string;

  if (req.path == "/graphql" && req.method == "GET") return next();

  if (!apiKey) {
    return res.status(401).json({ error: "API key is required" });
  }

  const key = await ApiKey.findOne({ key: apiKey });

  if (!key) {
    return res.status(403).json({ error: "Invalid API key" });
  }

  req.apiKey = apiKey;
  next();
};

export { validateApiKey };
