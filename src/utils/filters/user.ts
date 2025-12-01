// ./src/utils/filters/user.ts

import { Prisma } from "../../generated/prisma/client.js";
import { Filters, getDateFilter } from "./index.js";

/**
 * Creates filter conditions for User queries
 */
export const UserFilters = ({
  filters = {},
}: {
  filters: Filters.UserFilterOptions;
}): Prisma.UserWhereInput => {
  const constructedFilters: Prisma.UserWhereInput = {
    // ID filters
    ...(filters.id &&
      Array.isArray(filters.id) && {
        id: { in: filters.id },
      }),
    ...(filters.id &&
      typeof filters.id === "string" && {
        id: filters.id,
      }),

    // Regex fields (Prisma uses contains, startsWith, endsWith, or mode: 'insensitive')
    ...(filters.firstName && {
      firstName: { contains: filters.firstName, mode: "insensitive" },
    }),
    ...(filters.lastName && {
      lastName: { contains: filters.lastName, mode: "insensitive" },
    }),
    ...(filters.email && {
      email: { contains: filters.email, mode: "insensitive" },
    }),
    ...(filters.phone && {
      phone: { contains: filters.phone, mode: "insensitive" },
    }),

    // Role filters
    ...(filters.role &&
      (Array.isArray(filters.role)
        ? { roles: { some: { name: { in: filters.role } } } }
        : { roles: { some: { name: filters.role } } })),

    // Email verification
    ...(filters.emailVerified !== undefined && {
      emailVerified: filters.emailVerified,
    }),

    // Status filter
    ...(filters.status && { status: filters.status }),

    // Search term across multiple fields
    ...(filters.search && {
      OR: [
        { firstName: { contains: filters.search, mode: "insensitive" } },
        { lastName: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { phone: { contains: filters.search, mode: "insensitive" } },
      ],
    }),

    // Date filters
    ...(filters.createdAfter && {
      createdAt: { gte: getDateFilter(filters.createdAfter) },
    }),
    ...(filters.createdBefore && {
      createdAt: { lte: getDateFilter(filters.createdBefore) },
    }),
    ...(filters.updatedAfter && {
      updatedAt: { gte: getDateFilter(filters.updatedAfter) },
    }),
    ...(filters.updatedBefore && {
      updatedAt: { lte: getDateFilter(filters.updatedBefore) },
    }),
  };

  return constructedFilters;
};
