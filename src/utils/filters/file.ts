// ./src/utils/filters/file.ts

import { Prisma } from "../../generated/prisma/client.js";
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
 * Builds a Prisma filter query for files based on the provided options.
 * @param {Filters.FileFilterOptions} options - The filter options.
 * @returns {Prisma.FileWhereInput} A Prisma filter query object.
 */
export const buildFileFilters = (
  options: Filters.FileFilterOptions
): Prisma.FileWhereInput => {
  const filters: Prisma.FileWhereInput = {};

  if (options.id) {
    filters.id = Array.isArray(options.id) ? { in: options.id } : options.id;
  }

  if (options.user) {
    filters.userId = Array.isArray(options.user)
      ? { in: options.user }
      : options.user;
  }

  if (options.type) {
    filters.type = Array.isArray(options.type)
      ? { in: options.type }
      : options.type;
  }

  if (options.purpose) {
    filters.purpose = Array.isArray(options.purpose)
      ? { in: options.purpose }
      : options.purpose;
  }

  if (options.s3Key) {
    filters.s3Key = options.s3Key;
  }

  if (options.search) {
    filters.OR = [
      { name: { contains: options.search, mode: "insensitive" } },
      { purpose: { contains: options.search, mode: "insensitive" } },
    ];
  }

  if (options.sizeGreaterThan) {
    const currentSizeFilter = (filters.size as Prisma.IntFilter) || {};
    filters.size = { ...currentSizeFilter, gt: options.sizeGreaterThan };
  }

  if (options.sizeLessThan) {
    const currentSizeFilter = (filters.size as Prisma.IntFilter) || {};
    filters.size = { ...currentSizeFilter, lt: options.sizeLessThan };
  }

  if (options.createdAfter) {
    const createdAfter = new Date(options.createdAfter);
    const currentCreatedAtFilter =
      (filters.createdAt as Prisma.DateTimeFilter) || {};
    filters.createdAt = { ...currentCreatedAtFilter, gte: createdAfter };
  }

  if (options.createdBefore) {
    const createdBefore = new Date(options.createdBefore);
    const currentCreatedAtFilter =
      (filters.createdAt as Prisma.DateTimeFilter) || {};
    filters.createdAt = { ...currentCreatedAtFilter, lte: createdBefore };
  }

  return filters;
};
