// ./src/services/file.service.ts

import FileModel, { FileDocument, IFile } from "../models/file.model.js";
import {
  NotFoundError,
  ErrorHandler,
  BadRequestError,
} from "./error.services.js";
import { S3UploadService } from "./s3.service.js";
import paginateCollection, {
  PaginatedResult,
  Pagination,
  SortOptions,
} from "../utils/paginate.js";
import { Filters, buildFileFilters } from "../utils/filters/file.js";
import { logger } from "@untools/logger";

export interface CreateFileInput
  extends Omit<IFile, "user" | "purpose" | "s3Key" | "s3Url"> {
  s3Key: string;
  s3Url: string;
  user?: string;
  purpose?: string;
}

/**
 * Service for managing file records in the database.
 */
export class FileService {
  private s3Service: S3UploadService;

  constructor() {
    this.s3Service = new S3UploadService();
  }

  /**
   * Creates a new file record in the database.
   * @param input - The data for the new file record.
   * @returns The created file document.
   */
  async createFileRecord(input: CreateFileInput): Promise<FileDocument> {
    try {
      if (!input.s3Key || !input.s3Url) {
        throw new BadRequestError("S3 key and URL are required.");
      }
      const fileRecord = await FileModel.create(input);
      logger.info(
        `File record created for ${input.name} (key: ${input.s3Key})`
      );
      return fileRecord;
    } catch (error) {
      logger.error("Error creating file record:", error);
      throw ErrorHandler.handleError(error);
    }
  }

  /**
   * Retrieves a single file record by its ID.
   * @param id - The ID of the file record.
   * @returns The file document.
   */
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

  /**
   * Retrieves a paginated list of file records based on filters.
   * @param pagination - Pagination options (page, limit).
   * @param options - Filtering and sorting options.
   * @returns A paginated result of file documents.
   */
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

  /**
   * Deletes a file record and the corresponding file from S3.
   * @param id - The ID of the file record to delete.
   * @returns An object indicating the success of the operation.
   */
  async deleteFile(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const fileRecord = await this.getFileById(id);
      if (!fileRecord.s3Key) {
        throw new BadRequestError(
          "File record does not have an S3 key to delete."
        );
      }

      // Delete from S3 first
      await this.s3Service.deleteFile(fileRecord.s3Key);

      // Then delete from the database
      await FileModel.findByIdAndDelete(id);

      logger.info(
        `Successfully deleted file record and S3 object for key: ${fileRecord.s3Key}`
      );
      return { success: true, message: "File deleted successfully." };
    } catch (error) {
      throw ErrorHandler.handleError(error);
    }
  }
}
