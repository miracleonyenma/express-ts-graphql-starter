import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import {
  IFileUploadService,
  UploadResult,
  FileUpload,
} from "../../interfaces/file-upload.interface.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export class S3UploadService implements IFileUploadService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    // Determine region and credentials from environment
    const region = process.env.AWS_REGION || "us-east-1";
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || "";

    if (!this.bucketName) {
      console.warn("AWS_S3_BUCKET_NAME is not set.");
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });
  }

  async uploadFile(
    file: FileUpload,
    folder: string = "uploads"
  ): Promise<UploadResult> {
    try {
      const extension = path.extname(file.originalname);
      const uniqueKey = `${folder}/${uuidv4()}${extension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: uniqueKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL: 'public-read', // Uncomment if bucket is public and you want files to be public
      });

      await this.s3Client.send(command);

      // Construct the URL.
      // Note: This assumes standard AWS S3.
      // If using CloudFront or custom domain, update this logic.
      const url = `https://${this.bucketName}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${uniqueKey}`;

      return {
        success: true,
        key: uniqueKey,
        url,
        provider: "s3",
      };
    } catch (error: any) {
      console.error("S3 Upload Error:", error);
      return {
        success: false,
        provider: "s3",
        error: error.message,
      };
    }
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      console.error("S3 Delete Error:", error);
      return false;
    }
  }
}
