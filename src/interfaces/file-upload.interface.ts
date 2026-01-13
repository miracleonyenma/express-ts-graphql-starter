export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename?: string;
  path?: string;
  buffer: Buffer;
}

export interface UploadResult {
  success: boolean;
  key?: string; // The unique identifier in the bucket/cloud
  url?: string; // The public access URL
  provider: string; // 's3', 'cloudinary', etc.
  error?: string;
}

export interface IFileUploadService {
  uploadFile(file: FileUpload, folder?: string): Promise<UploadResult>;
  deleteFile(fileKey: string): Promise<boolean>;
}
