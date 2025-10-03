// ./src/services/s3.service.ts

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { logger } from "@untools/logger";

dotenv.config();

export interface S3UploadResult {
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
}

export interface S3FileUpload {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
}

export class S3UploadService {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || "";
    this.region = process.env.AWS_REGION || "us-east-1";

    if (!this.bucketName) {
      logger.error("AWS_S3_BUCKET_NAME environment variable is required");
    }

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });
  }

  /**
   * Generate a unique file key with folder structure
   */
  private generateFileKey(originalName: string, folder = "uploads"): string {
    const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const uniqueId = uuidv4().split("-")[0]; // Short UUID
    const extension = originalName.split(".").pop() || "";
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");

    return `${folder}/${timestamp}/${uniqueId}-${sanitizedName}`;
  }

  /**
   * Upload a single file to S3
   */
  async uploadFile(
    file: S3FileUpload,
    folder = "uploads"
  ): Promise<S3UploadResult> {
    try {
      const fileKey = this.generateFileKey(file.originalName, folder);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimeType,
        ContentLength: file.size,
        // Optional: Add metadata
        Metadata: {
          "original-name": file.originalName,
          "upload-timestamp": new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      const fileUrl = `https://${this.bucketName}.s3.amazonaws.com/${fileKey}`;

      return {
        success: true,
        key: fileKey,
        url: fileUrl,
      };
    } catch (error) {
      console.error("S3 upload error:", error);
      return {
        success: false,
        error: `Failed to upload ${file.originalName}: ${
          (error as Error).message
        }`,
      };
    }
  }

  /**
   * Upload multiple files to S3
   */
  async uploadFiles(
    files: S3FileUpload[],
    folder = "uploads"
  ): Promise<S3UploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(fileKey: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      console.error("S3 delete error:", error);
      return false;
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(fileKey: string): string {
    return `https://${this.bucketName}.s3.amazonaws.com/${fileKey}`;
  }

  /**
   * Validate file before upload
   */
  validateFile(
    file: S3FileUpload,
    maxSizeBytes: number = 15 * 1024 * 1024, // 15MB default
    allowedMimeTypes: string[] = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ]
  ): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File ${file.originalName} exceeds maximum size of ${Math.round(
          maxSizeBytes / (1024 * 1024)
        )}MB`,
      };
    }

    // Check mime type
    if (!allowedMimeTypes.includes(file.mimeType)) {
      return {
        valid: false,
        error: `File ${file.originalName} has unsupported type: ${file.mimeType}`,
      };
    }

    return { valid: true };
  }
}
