// src/graphql/resolvers/index.ts

import userResolvers from "./user.resolvers.js";
import roleResolvers from "./role.resolvers.js";
import otpResolvers from "./otp.resolvers.js";
import apiKeyResolvers from "./apiKey.resolvers.js";
import googleAuthResolvers from "./google.auth.resolvers.js";
import magicLinkResolvers from "./magicLink.resolvers.js";
import passwordResetResolvers from "./passwordReset.resolvers.js";
import fileResolvers from "./file.resolvers.js";

/**
 * Combine all resolvers into a single resolver map
 *
 * The resolvers are merged in a way that allows them to work together.
 * Each resolver module can define:
 * - Query resolvers (for fetching data)
 * - Mutation resolvers (for modifying data)
 * - Type resolvers (for resolving fields on custom types)
 *
 * Note: If multiple resolvers define the same Query or Mutation,
 * they will be merged. Later resolvers will override earlier ones
 * for the same field name.
 */
const resolvers = {
  /**
   * Query resolvers from all modules
   * Handles all read operations in the GraphQL API
   */
  Query: {
    ...userResolvers.Query,
    ...roleResolvers.Query,
    ...otpResolvers.Query,
    ...apiKeyResolvers.Query,
    ...fileResolvers.Query,
  },

  /**
   * Mutation resolvers from all modules
   * Handles all write operations in the GraphQL API
   */
  Mutation: {
    ...userResolvers.Mutation,
    ...roleResolvers.Mutation,
    ...otpResolvers.Mutation,
    ...apiKeyResolvers.Mutation,
    ...googleAuthResolvers.Mutation,
    ...magicLinkResolvers.Mutation,
    ...passwordResetResolvers.Mutation,
    ...fileResolvers.Mutation,
  },

  /**
   * Type-specific resolvers
   * These handle field resolution for custom GraphQL types
   * Each type can have custom logic for computing or fetching field values
   */
  User: userResolvers.User,
  File: fileResolvers.File,
  // Add other type resolvers as needed
};

export default resolvers;
