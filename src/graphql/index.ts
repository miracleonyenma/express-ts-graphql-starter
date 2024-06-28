import bookResolvers from "./resolvers/book.resolvers.js";
import bookTypeDefs from "./typeDefs/book.js";

export const typeDefs = `
  ${bookTypeDefs}
`;

export const resolvers = {
  Query: {
    ...bookResolvers.Query,
  },
};
