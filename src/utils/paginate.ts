import { Model } from "mongoose";

interface Pagination {
  page?: number;
  limit?: number;
}

interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const paginateCollection = async <T>(
  collection: Model<T>,
  pagination: Pagination,
  options?: {
    filter?: any;
  }
): Promise<PaginatedResult<T>> => {
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;
  const data = await collection
    .find(options.filter || {})
    .skip(skip)
    .limit(limit);
  const total = await collection.countDocuments();
  const pages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      pages,
    },
  };
};

export default paginateCollection;
