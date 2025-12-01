// ./src/services/file.service.ts

import prisma from "../config/prisma.js";
import { File as FileModel } from "../generated/prisma/client.js";
import {
  NotFoundError,
  ErrorHandler,
  BadRequestError,
} from "./error.services.js";
import { S3UploadService } from "./s3.service.js";
import { PaginatedResult, Pagination, SortOptions } from "../utils/paginate.js";
import { Filters, buildFileFilters } from "../utils/filters/file.js";
import { logger } from "@untools/logger";

export interface CreateFileInput {
  name: string;
  type: string;
  size: number;
  s3Key: string;
  s3Url: string;
  user?: string; // ID
  purpose?: string;
  cloudinaryId?: string;
  cloudinaryUrl?: string;
  pinataId?: string;
  pinataUrl?: string;
  supabaseId?: string;
  supabaseUrl?: string;
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
  async createFileRecord(input: CreateFileInput): Promise<FileModel> {
    try {
      if (!input.s3Key || !input.s3Url) {
        throw new BadRequestError("S3 key and URL are required.");
      }

      const data: any = { ...input };
      if (input.user) {
        data.user = { connect: { id: input.user } };
      }

      const fileRecord = await prisma.file.create({
        data,
      });

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
  async getFileById(id: string): Promise<FileModel> {
    try {
      const fileRecord = await prisma.file.findUnique({
        where: { id },
        include: { user: true },
      });

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
      sort?: SortOptions;
    }
  ): Promise<PaginatedResult<FileModel>> {
    try {
      const where = buildFileFilters(options?.filter || {});
      const page = pagination.page || 1;
      const limit = pagination.limit || 10;
      const skip = (page - 1) * limit;
      const orderBy = options?.sort
        ? { [options.sort.by as string]: options.sort.direction }
        : { createdAt: "desc" as const };

      const [data, total] = await Promise.all([
        prisma.file.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: { user: true },
        }),
        prisma.file.count({ where }),
      ]);

      return {
        data,
        meta: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      };
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
      await prisma.file.delete({ where: { id } });

      logger.info(
        `Successfully deleted file record and S3 object for key: ${fileRecord.s3Key}`
      );
      return { success: true, message: "File deleted successfully." };
    } catch (error) {
      throw ErrorHandler.handleError(error);
    }
  }
}
