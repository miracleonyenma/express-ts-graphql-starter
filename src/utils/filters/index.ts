// src/utils/filters.ts
import mongoose from "mongoose";

/**
 * Type for all filter options used in the wallet service
 */
export namespace Filters {
  export interface UserFilterOptions {
    id?: string | string[];
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    search?: string;
    role?: string | string[];
    emailVerified?: boolean;
    status?: string;
    createdAfter?: Date | string;
    createdBefore?: Date | string;
    updatedAfter?: Date | string;
    updatedBefore?: Date | string;
  }
}

/**
 * Helper function to check if a string is a valid MongoDB ObjectId
 */
const isValidObjectId = (id?: string): boolean => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Helper function to convert string dates to Date objects
 */
export const getDateFilter = (dateString?: Date | string): Date | undefined => {
  if (!dateString) return undefined;
  return dateString instanceof Date ? dateString : new Date(dateString);
};

export * from "./file.js";
