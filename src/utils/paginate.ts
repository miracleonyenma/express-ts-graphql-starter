// ./src/utils/paginate.ts

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

// Removed Mongoose specific implementation.
// Pagination should be handled by the service using Prisma directly or a new helper.
// For now, we just export the interfaces.

export default {};
