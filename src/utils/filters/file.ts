// ./src/utils/filters/file.ts

import mongoose from "mongoose";
import { getDateFilter } from "./index.js";

/**
 * Type for all filter options used in the file service
 */
export namespace Filters {
  export interface FileFilterOptions {
    id?: string | string[];
    name?: string;
    type?: string | string[]; // Filter by one or more MIME types
    s3Key?: string;
    user?: string | string[]; // Filter by one or more user IDs
    purpose?: string | string[];
    search?: string; // Generic search on name and purpose
    sizeGreaterThan?: number;
    sizeLessThan?: number;
    createdAfter?: Date | string;
    createdBefore?: Date | string;
    updatedAfter?: Date | string;
    updatedBefore?: Date | string;
  }
}

/**
 * Builds a MongoDB filter query for files based on the provided options.
 * @param {Filters.FileFilterOptions} options - The filter options.
 * @returns {mongoose.FilterQuery<any>} A MongoDB filter query object.
 */
export const buildFileFilters = (
  options: Filters.FileFilterOptions
): mongoose.FilterQuery<any> => {
  const filters: mongoose.FilterQuery<any> = {};

  if (options.id) {
    filters._id = Array.isArray(options.id) ? { $in: options.id } : options.id;
  }

  if (options.user) {
    filters.user = Array.isArray(options.user)
      ? { $in: options.user.map((id) => new mongoose.Types.ObjectId(id)) }
      : new mongoose.Types.ObjectId(options.user);
  }

  if (options.type) {
    filters.type = Array.isArray(options.type)
      ? { $in: options.type }
      : options.type;
  }

  if (options.purpose) {
    filters.purpose = Array.isArray(options.purpose)
      ? { $in: options.purpose }
      : options.purpose;
  }

  if (options.s3Key) {
    filters.s3Key = options.s3Key;
  }

  if (options.search) {
    const searchRegex = new RegExp(options.search, "i");
    filters.$or = [{ name: searchRegex }, { purpose: searchRegex }];
  }

  const sizeFilter: { $gt?: number; $lt?: number } = {};
  if (options.sizeGreaterThan) {
    sizeFilter.$gt = options.sizeGreaterThan;
  }
  if (options.sizeLessThan) {
    sizeFilter.$lt = options.sizeLessThan;
  }
  if (Object.keys(sizeFilter).length > 0) {
    filters.size = sizeFilter;
  }

  const createdAtFilter: { $gte?: Date; $lte?: Date } = {};
  const createdAfter = getDateFilter(options.createdAfter);
  const createdBefore = getDateFilter(options.createdBefore);
  if (createdAfter) {
    createdAtFilter.$gte = createdAfter;
  }
  if (createdBefore) {
    createdAtFilter.$lte = createdBefore;
  }
  if (Object.keys(createdAtFilter).length > 0) {
    filters.createdAt = createdAtFilter;
  }

  return filters;
};
