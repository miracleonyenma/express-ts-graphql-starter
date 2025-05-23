// ./src/utils/paginate.ts
import { Model, FilterQuery, SortOrder, PopulateOptions } from "mongoose";

export interface Pagination {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SortOptions<T = any> {
  by?: keyof T | string;
  direction?: "asc" | "desc";
}

// Corrected PopulateType to match Mongoose's expected types
export type PopulateType =
  | string
  | PopulateOptions
  | (string | PopulateOptions)[];

const getSort = <T>(sort?: SortOptions<T>): { [key: string]: SortOrder } => {
  if (!sort) return { createdAt: -1 }; // Default to sorting by `createdAt` in descending order
  const { by = "createdAt", direction = "desc" } = sort;
  return { [by.toString()]: direction === "asc" ? 1 : -1 };
};

const paginateCollection = async <T>(
  collection: Model<T>,
  pagination: Pagination,
  options?: {
    filter?: FilterQuery<T>;
    sort?: SortOptions<T>;
    populate?: PopulateType;
  }
): Promise<PaginatedResult<T>> => {
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;

  const sort = getSort(options?.sort);

  // Create the base query
  let query = collection
    .find(options?.filter || {})
    .skip(skip)
    .limit(limit)
    .sort(sort);

  // Apply population if provided
  if (options?.populate) {
    const populateArg =
      typeof options.populate === "string"
        ? [options.populate]
        : options.populate;
    query = query.populate(populateArg);
  }

  // Execute the query
  const data = await query;

  const total = await collection.countDocuments(options?.filter || {});
  const pages = Math.ceil(total / limit);
  const hasNextPage = page < pages;
  const hasPrevPage = page > 1;

  return {
    data,
    meta: {
      page,
      limit,
      total,
      pages,
      hasNextPage,
      hasPrevPage,
    },
  };
};

export default paginateCollection;
