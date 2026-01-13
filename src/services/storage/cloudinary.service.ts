import { v2 as cloudinary } from "cloudinary";
import {
  IFileUploadService,
  UploadResult,
  FileUpload,
} from "../../interfaces/file-upload.interface.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import stream from "stream";

export class CloudinaryService implements IFileUploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(
    file: FileUpload,
    folder: string = "uploads"
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: uuidv4(),
          resource_type: "auto", // Automatically detect image/video/raw
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            resolve({
              success: false,
              provider: "cloudinary",
              error: error.message,
            });
          } else {
            resolve({
              success: true,
              key: result?.public_id,
              url: result?.secure_url,
              provider: "cloudinary",
            });
          }
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      const bufferStream = new stream.PassThrough();
      bufferStream.end(file.buffer);
      bufferStream.pipe(uploadStream);
    });
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(fileKey);
      return result.result === "ok";
    } catch (error) {
      console.error("Cloudinary Delete Error:", error);
      return false;
    }
  }
}
