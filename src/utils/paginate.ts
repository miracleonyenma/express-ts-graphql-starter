import { Model, FilterQuery, SortOrder } from "mongoose";

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

export interface SortOptions {
  by?: "createdAt" | "updatedAt" | "name";
  direction?: "asc" | "desc";
}

const getSort = (sort?: SortOptions): { [key: string]: SortOrder } => {
  if (!sort) return { createdAt: -1 }; // Default to sorting by `createdAt` in descending order
  const { by = "createdAt", direction = "desc" } = sort;
  return { [by]: direction === "asc" ? 1 : -1 };
};

const paginateCollection = async <T>(
  collection: Model<T>,
  pagination: Pagination,
  options?: {
    filter?: FilterQuery<T>;
    sort?: SortOptions;
    populate?: string;
  }
): Promise<PaginatedResult<T>> => {
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;

  const sort = getSort(options?.sort);

  const data = await collection
    .find(options?.filter || {})
    .skip(skip)
    .limit(limit)
    .populate(options?.populate || "")
    .sort(sort);

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
