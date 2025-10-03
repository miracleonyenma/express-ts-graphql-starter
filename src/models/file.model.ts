// ./src/models/file.model.ts

import mongoose, { Document, Model, Schema } from "mongoose";

export interface IFile {
  name: string; // Original name of the file (e.g., "business-plan.pdf")
  type: string; // MIME type (e.g., "application/pdf")
  size: number; // File size in bytes
  s3Key?: string; // The unique key for the file in your S3 bucket
  s3Url?: string; // The full URL to access the file
  cloudinaryId?: string; // The unique ID for the file in Cloudinary
  cloudinaryUrl?: string; // The full URL to access the file in Cloudinary
  pinataId?: string; // The unique ID for the file in Pinata
  pinataUrl?: string; // The full URL to access the file in Pinata
  supabaseId?: string; // The unique ID for the file in Supabase
  supabaseUrl?: string; // The full URL to access the file in Supabase
  user?: Schema.Types.ObjectId; // Optional: Reference to the user who uploaded it
  purpose?: string; // Optional: A string to categorize the file (e.g., "pitchDeck", "supportingDocument")
}

// This interface defines the properties stored in the MongoDB document.
export interface FileDocument extends IFile, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface FileModel extends Model<FileDocument> {}

// Mongoose Schema definition
const fileSchema = new Schema<FileDocument, FileModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    s3Key: {
      type: String,
      required: true,
      unique: true, // Each file in S3 has a unique key
    },
    s3Url: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", // Assumes you have a 'User' model
      required: false,
    },
    purpose: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

const FileModel = mongoose.model<FileDocument, FileModel>("File", fileSchema);

export default FileModel;
