// ./src/services/file.service.ts

import FileModel, { FileDocument } from "../models/file.model.js";
import {
  NotFoundError,
  ErrorHandler,
  BadRequestError,
} from "./error.services.js";
import { StorageFactory } from "./storage/storage.factory.js";
import { FileUpload } from "../interfaces/file-upload.interface.js";
import paginateCollection, {
  PaginatedResult,
  Pagination,
  SortOptions,
} from "../utils/paginate.js";
import { Filters, buildFileFilters } from "../utils/filters/file.js";
import { logger } from "@untools/logger";

export class FileService {
  /**
   * Uploads a file to the specified provider and saves the record in the database
   */
  async uploadAndSave(
    file: FileUpload,
    providerType: string = "s3",
    meta: { user?: string; purpose?: string; folder?: string }
  ): Promise<FileDocument> {
    try {
      // 1. Upload to Cloud (DB Agnostic)
      const storageService = StorageFactory.getService(providerType);
      const result = await storageService.uploadFile(
        file,
        meta.folder || "uploads"
      );

      if (!result.success || !result.key || !result.url) {
        throw new Error(result.error || "Upload failed");
      }

      // 2. Save to Database
      const fileRecord = await FileModel.create({
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        provider: result.provider,
        key: result.key,
        url: result.url,
        user: meta.user,
        purpose: meta.purpose,
      });

      logger.info(
        `File record created for ${fileRecord.name} (provider: ${fileRecord.provider}, key: ${fileRecord.key})`
      );
      return fileRecord;
    } catch (error) {
      logger.error("Error uploading and saving file:", error);
      throw ErrorHandler.handleError(error);
    }
  }

  // --- STANDARD CRUD METHODS ---

  async getFileById(id: string): Promise<FileDocument> {
    try {
      const fileRecord = await FileModel.findById(id).populate(
        "user",
        "firstName lastName email"
      );
      if (!fileRecord) {
        throw new NotFoundError("File record not found.");
      }
      return fileRecord;
    } catch (error) {
      throw ErrorHandler.handleError(error);
    }
  }

  async getFiles(
    pagination: Pagination,
    options?: {
      filter?: Filters.FileFilterOptions;
      sort?: SortOptions<FileDocument>;
    }
  ): Promise<PaginatedResult<FileDocument>> {
    try {
      const filterQuery = buildFileFilters(options?.filter || {});
      const files = await paginateCollection(FileModel, pagination, {
        filter: filterQuery,
        sort: options?.sort,
        populate: { path: "user", select: "firstName lastName email" },
      });
      return files;
    } catch (error) {
      throw ErrorHandler.handleError(error);
    }
  }

  async deleteFile(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const fileRecord = await this.getFileById(id);

      // Delete from Cloud Provider
      const storageService = StorageFactory.getService(fileRecord.provider);
      await storageService.deleteFile(fileRecord.key);

      // Delete from Database
      await FileModel.findByIdAndDelete(id);

      logger.info(
        `Successfully deleted file record and ${fileRecord.provider} object for key: ${fileRecord.key}`
      );
      return { success: true, message: "File deleted successfully." };
    } catch (error) {
      throw ErrorHandler.handleError(error);
    }
  }
}
