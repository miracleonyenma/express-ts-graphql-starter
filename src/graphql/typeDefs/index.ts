// src/graphql/typeDefs/index.ts

import apiKeyTypeDefs from "../typeDefs/apiKey.js";
import googleAuthTypeDefs from "../typeDefs/google.auth.js";
import otpTypeDefs from "../typeDefs/otp.js";
import passwordResetTypeDefs from "../typeDefs/passwordReset.js";
import roleTypeDefs from "../typeDefs/role.js";
import userTypeDefs from "../typeDefs/user.js";

/**
 * Global type definitions shared across all GraphQL schemas
 * Includes common scalar types, input types, and enums
 */
const globalTypeDefs = `#graphql
  """
  Custom scalar type for JSON data
  Allows passing arbitrary JSON objects in queries and mutations
  """
  scalar JSON

  """
  Input type for pagination parameters
  Used across multiple queries to handle paginated results
  """
  input Pagination {
    """
    Page number to retrieve (starts from 1)
    """
    page: Int
    
    """
    Number of items per page
    """
    limit: Int
  }

  """
  Metadata for paginated responses
  Provides information about the current page and available pages
  """
  type Meta {
    """
    Current page number
    """
    page: Int
    
    """
    Number of items per page
    """
    limit: Int
    
    """
    Total number of pages available
    """
    pages: Int
    
    """
    Total number of items across all pages
    """
    total: Int
    
    """
    Whether there is a next page available
    """
    hasNextPage: Boolean
    
    """
    Whether there is a previous page available
    """
    hasPrevPage: Boolean
  }

  """
  Input type for sorting options
  Allows specifying field and direction for result ordering
  """
  input SortInput {
    """
    Field name to sort by
    """
    by: String
    
    """
    Sort direction (ascending or descending)
    """
    direction: SortDirection
  }

  """
  Enum for sort direction
  """
  enum SortDirection {
    """
    Ascending order (A-Z, 0-9, oldest to newest)
    """
    asc
    
    """
    Descending order (Z-A, 9-0, newest to oldest)
    """
    desc
  }
`;

/**
 * Combine all type definitions into a single schema string
 * The order matters - global types should come first, followed by
 * entity-specific types in an order that respects dependencies
 */
const typeDefs = `
  ${globalTypeDefs}
  ${userTypeDefs}
  ${roleTypeDefs}
  ${otpTypeDefs}
  ${apiKeyTypeDefs}
  ${googleAuthTypeDefs}
  ${passwordResetTypeDefs}
`;

export default typeDefs;
