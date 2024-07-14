import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token.js";

interface CustomRequest extends Request {
  user?: any;
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

    // return res.status(401).json({ message: "Authorization header missing" });
    req.user = null;
    return next();
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("error", error.message);
    req.user = null;
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
