// ./src/utils/filters/user.ts

import { FilterQuery, Types } from "mongoose";
import { Filters, getDateFilter } from "./index.js";
import { UserDocument } from "../../types/user.js"; // Update if you store types elsewhere

/**
 * Creates filter conditions for User queries
 */
export const UserFilters = ({
  filters = {},
}: {
  filters: Filters.UserFilterOptions;
}): FilterQuery<UserDocument> => {
  const constructedFilters: FilterQuery<UserDocument> = {
    // ID filters
    ...(filters.id &&
      Array.isArray(filters.id) &&
      filters.id.every((id) => Types.ObjectId.isValid(id)) && {
        _id: { $in: filters.id.map((id) => new Types.ObjectId(id)) },
      }),
    ...(filters.id &&
      typeof filters.id === "string" &&
      Types.ObjectId.isValid(filters.id) && {
        _id: new Types.ObjectId(filters.id),
      }),

    // Regex fields
    ...(filters.firstName && {
      firstName: { $regex: filters.firstName, $options: "i" },
    }),
    ...(filters.lastName && {
      lastName: { $regex: filters.lastName, $options: "i" },
    }),
    ...(filters.email && {
      email: { $regex: filters.email, $options: "i" },
    }),
    ...(filters.phone && {
      phone: { $regex: filters.phone, $options: "i" },
    }),

    // Role filters
    ...(filters.role &&
      (Array.isArray(filters.role)
        ? { roles: { $in: filters.role } }
        : { roles: filters.role })),

    // Email verification
    ...(filters.emailVerified !== undefined && {
      emailVerified: filters.emailVerified,
    }),

    // Status filter
    ...(filters.status && { status: filters.status }),

    // Search term across multiple fields
    ...(filters.search && {
      $or: [
        { firstName: { $regex: filters.search, $options: "i" } },
        { lastName: { $regex: filters.search, $options: "i" } },
        { email: { $regex: filters.search, $options: "i" } },
        { phone: { $regex: filters.search, $options: "i" } },
      ],
    }),

    // Date filters
    ...(filters.createdAfter && {
      createdAt: { $gte: getDateFilter(filters.createdAfter) },
    }),
    ...(filters.createdBefore && {
      createdAt: { $lte: getDateFilter(filters.createdBefore) },
    }),
    ...(filters.updatedAfter && {
      updatedAt: { $gte: getDateFilter(filters.updatedAfter) },
    }),
    ...(filters.updatedBefore && {
      updatedAt: { $lte: getDateFilter(filters.updatedBefore) },
    }),
  };

  return constructedFilters;
};
