import { FileService } from "../../services/file.service.js";
import { UnauthorizedError } from "../../services/error.services.js";

const fileService = new FileService();

const fileResolvers = {
  Query: {
    getFile: async (_: any, { id }: { id: string }, context: any) => {
      // Check auth if strictly required, or let service handle ownership check?
      // Service getFileById just fetches. Route handled ownership.
      // Here usually we want to allow user to see their own file.
      if (!context.user) throw new UnauthorizedError("Not authenticated");

      const file = await fileService.getFileById(id);

      // Ownership check
      if (file.user && file.user.toString() !== context.user.data.id) {
        throw new UnauthorizedError("Access denied");
      }
      return file;
    },
    getFiles: async (
      _: any,
      { page, limit }: { page: number; limit: number },
      context: any
    ) => {
      if (!context.user) throw new UnauthorizedError("Not authenticated");

      const result = await fileService.getFiles(
        { page: page || 1, limit: limit || 10 },
        { filter: { user: context.user.data.id } }
      );

      // Convert to Relay-style connection structure if needed or just specific Pagination structure
      // Type def is: edges: [FileEdge!]!, pageInfo, totalCount
      // Service returns { data: [], meta: { ... } }

      return {
        totalCount: result.meta.total,
        edges: result.data.map((file) => ({
          cursor: file.id, // Simple cursor
          node: file,
        })),
        pageInfo: {
          hasNextPage: result.meta.hasNextPage,
          hasPreviousPage: result.meta.hasPrevPage,
          startCursor: result.data.length > 0 ? result.data[0].id : null,
          endCursor:
            result.data.length > 0
              ? result.data[result.data.length - 1].id
              : null,
        },
      };
    },
  },
  Mutation: {
    deleteFile: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) throw new UnauthorizedError("Not authenticated");

      const file = await fileService.getFileById(id);
      if (file.user && file.user.toString() !== context.user.data.id) {
        throw new UnauthorizedError("Access denied");
      }

      return await fileService.deleteFile(id);
    },
  },
  File: {
    // Populate user if typically just ID
    user: async (parent: any) => {
      // If already populated
      if (parent.user && parent.user.firstName) return parent.user;
      // Else invoke userService? Or assume populate was called?
      // Service getFiles populates user.
      return parent.user;
    },
  },
};

export default fileResolvers;
