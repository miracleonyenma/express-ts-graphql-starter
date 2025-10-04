import { Router } from "express";
import express from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authConfig } from "../config/auth.config.js";
import { logger } from "@untools/logger";

const router = Router();

// Add JSON parsing middleware for POST requests
router.use(express.json());
const authController = new AuthController();

// Only register REST endpoints if REST mode is enabled
if (authConfig.isRestModeEnabled()) {
  logger.info("Registering REST authentication endpoints", {
    mode: authConfig.mode,
  });

  // Magic Link REST endpoints
  router.post("/magic-link/request", (req, res) =>
    authController.requestMagicLinkRest(req, res)
  );

  router.get("/magic-link/verify", (req, res) =>
    authController.verifyMagicLinkRest(req, res)
  );

  // Google OAuth REST endpoints (to be implemented in next task)
  router.get("/google/login", (req, res) =>
    authController.initiateGoogleOAuth(req, res)
  );

  router.get("/google/callback", (req, res) =>
    authController.handleGoogleCallback(req, res)
  );
} else {
  logger.info("REST authentication endpoints disabled", {
    mode: authConfig.mode,
  });

  // Return 404 for REST endpoints when not enabled
  router.use("*", (req, res) => {
    res.status(404).json({
      success: false,
      error: "REST authentication endpoints are not enabled",
      hint: "Set AUTH_MODE to 'rest' or 'hybrid' to enable these endpoints",
    });
  });
}

export default router;
