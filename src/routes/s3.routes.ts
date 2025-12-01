// ./src/routes/s3.routes.ts

import { Router } from "express";
import multer from "multer";
import { S3UploadService } from "../services/s3.service.js";
import { FileService } from "../services/file.service.js";
import { CustomRequest } from "../middlewares/auth.middleware.js";
import { ApiKeyRequest } from "../middlewares/apiKey.middleware.js";

// Combine both request types
type AuthenticatedRequest = CustomRequest & ApiKeyRequest;

const router = Router();
const s3Service = new S3UploadService();
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
      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const file = {
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      };

      const result = await s3Service.uploadFile(
        file,
        req.body.folder || "uploads"
      );

      if (result.success) {
        // Create a file record in the database
        const fileRecord = await fileService.createFileRecord({
          name: file.originalName,
          type: file.mimeType,
          size: file.size,
          s3Key: result.key!,
          s3Url: result.url!,
          user: userId,
          purpose: req.body.purpose, // Optional purpose from request body
        });

        res.json({
          success: true,
          message: "File uploaded successfully.",
          file: fileRecord,
        });
      } else {
        res.status(500).json({ error: result.error });
      }
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

      // Check authentication
      const userId = req.owner?.id || req.user?.data?.id;
      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const files = req.files.map((file) => ({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      }));

      const results = await s3Service.uploadFiles(
        files,
        req.body.folder || "uploads"
      );

      const successfulUploads = results.filter((r) => r.success);
      const failedUploads = results.filter((r) => !r.success);

      // Create file records for successful uploads
      const fileRecords = await Promise.allSettled(
        results.map(async (result, index) => {
          if (!result.success || !result.key || !result.url) {
            return null;
          }

          const file = files[index];
          return await fileService.createFileRecord({
            name: file.originalName,
            type: file.mimeType,
            size: file.size,
            s3Key: result.key,
            s3Url: result.url,
            user: userId,
            purpose: req.body.purpose,
          });
        })
      );

      // Extract successful file records
      const createdRecords = fileRecords
        .filter(
          (result) => result.status === "fulfilled" && result.value !== null
        )
        .map((result) => (result as PromiseFulfilledResult<any>).value);

      // Count failed record creations
      const recordCreationFailures = fileRecords.filter(
        (result) => result.status === "rejected"
      ).length;

      res.json({
        success: failedUploads.length === 0 && recordCreationFailures === 0,
        uploaded: successfulUploads.length,
        failed: failedUploads.length,
        recordsCreated: createdRecords.length,
        recordCreationFailed: recordCreationFailures,
        files: results.map((result, index) => ({
          name: files[index].originalName,
          success: result.success,
          key: result.key,
          url: result.url,
          error: result.error,
        })),
        records: createdRecords,
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
    if (file.userId !== userId) {
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
    if (file.userId !== userId) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    // Delete file (this will delete from both S3 and database)
    const result = await fileService.deleteFile(req.params.id);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
