// ./src/models/file.model.ts

import mongoose, { Document, Model, Schema } from "mongoose";

export interface IFile {
  name: string;
  type: string;
  size: number;

  // Provider Fields
  provider: string; // 's3', 'cloudinary', etc.
  key: string; // The unique key/id from the provider
  url: string; // The public access URL

  user?: Schema.Types.ObjectId;
  purpose?: string;
}

export interface FileDocument extends IFile, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface FileModel extends Model<FileDocument> {}

const fileSchema = new Schema<FileDocument, FileModel>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true },
    size: { type: Number, required: true },

    provider: { type: String, required: true, default: "s3" },
    key: { type: String, required: true, unique: true },
    url: { type: String, required: true },

    user: { type: Schema.Types.ObjectId, ref: "User" },
    purpose: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

const FileModel = mongoose.model<FileDocument, FileModel>("File", fileSchema);

export default FileModel;
