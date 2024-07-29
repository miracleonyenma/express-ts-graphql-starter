import { Request, Response } from "express";
import { findOriginalUrl } from "../services/url.services.js";

const redirect = async (req: Request, res: Response) => {
  const { code } = req.params;
  try {
    const originalUrl = await findOriginalUrl(code);
    if (originalUrl) {
      return res.redirect(originalUrl);
    }
    return res.status(404).json("URL not found");
  } catch (err) {
    return res.status(500).json("Server error");
  }
};

export { redirect };
