// ./src/routes/upload.routes.ts

import { Router } from "express";
import multer from "multer";
import { FileService } from "../services/file.service.js";
import { CustomRequest } from "../middlewares/auth.middleware.js";
import { ApiKeyRequest } from "../middlewares/apiKey.middleware.js";

// Combine both request types
type AuthenticatedRequest = CustomRequest & ApiKeyRequest;

const router = Router();
const fileService = new FileService();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
});

// Upload single file
router.post(
  "/upload",
  upload.single("file"),
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }

      // Check authentication
      const userId = req.owner?.id || req.user?.data?.id;
      // Note: Allow upload without user if API key is present (owner), logic depends on req.owner/req.user
      if (!userId) {
        // Optionally allow anon uploads if that's the use case, but sticking to existing logic:
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const file = {
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        fieldname: req.file.fieldname,
        encoding: req.file.encoding,
      };

      const fileRecord = await fileService.uploadAndSave(
        file,
        req.body.provider || "s3",
        {
          user: userId,
          purpose: req.body.purpose,
          folder: req.body.folder,
        }
      );

      res.json({
        success: true,
        message: "File uploaded successfully.",
        file: fileRecord,
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// Upload multiple files
router.post(
  "/upload-multiple",
  upload.array("files", 10),
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        res.status(400).json({ error: "No files provided" });
        return;
      }

      const userId = req.owner?.id || req.user?.data?.id;
      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const uploadPromises = (req.files as Express.Multer.File[]).map(
        (reqFile) => {
          const file = {
            buffer: reqFile.buffer,
            originalname: reqFile.originalname,
            mimetype: reqFile.mimetype,
            size: reqFile.size,
            fieldname: reqFile.fieldname,
            encoding: reqFile.encoding,
          };

          return fileService
            .uploadAndSave(file, req.body.provider || "s3", {
              user: userId,
              purpose: req.body.purpose,
              folder: req.body.folder,
            })
            .then((record) => ({ success: true, record }))
            .catch((error) => ({
              success: false,
              error: error.message,
              filename: file.originalname,
            }));
        }
      );

      const results = await Promise.all(uploadPromises);

      const successful = results
        .filter((r) => r.success)
        .map((r: any) => r.record);
      const failed = results.filter((r) => !r.success);

      res.json({
        success: failed.length === 0,
        uploaded: successful.length,
        failed: failed.length,
        records: successful,
        errors: failed,
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// Get file by ID
router.get("/files/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.owner?.id || req.user?.data?.id;
    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const file = await fileService.getFileById(req.params.id);

    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    // Check if user owns the file
    if (file.user && file.user.toString() !== userId) {
      // Allow if admin or something? Sticking to strict ownership for now
      res.status(403).json({ error: "Access denied" });
      return;
    }

    res.json({ success: true, file });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// List user's files
router.get("/files", async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.owner?.id || req.user?.data?.id;
    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await fileService.getFiles(
      { page, limit },
      {
        filter: { user: userId },
      }
    );

    res.json({
      success: true,
      files: result.data,
      pagination: result.meta,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Delete file
router.delete("/files/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.owner?.id || req.user?.data?.id;
    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const file = await fileService.getFileById(req.params.id);

    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    // Check if user owns the file
    if (file.user && file.user.toString() !== userId) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    // Delete file (this will delete from both Cloud Provider and database)
    const result = await fileService.deleteFile(req.params.id);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
