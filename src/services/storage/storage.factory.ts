import { IFileUploadService } from "../../interfaces/file-upload.interface.js";
import { S3UploadService } from "./s3.service.js";
import { CloudinaryService } from "./cloudinary.service.js";

export class StorageFactory {
  static getService(provider: string = "s3"): IFileUploadService {
    switch (provider.toLowerCase()) {
      case "s3":
      case "aws":
        return new S3UploadService();
      case "cloudinary":
        return new CloudinaryService();
      default:
        console.warn(`Unknown provider '${provider}', defaulting to S3.`);
        return new S3UploadService();
    }
  }
}
