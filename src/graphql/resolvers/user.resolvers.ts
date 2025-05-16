// ./src/graphql/resolvers/user.resolvers.ts

import { UserService } from "../../services/user.services.js";
import { ErrorHandler } from "../../services/error.services.js";

const userResolvers = {
  User: {
    roles: async (parent, args, context, info) => {
      try {
        const userService = new UserService({
          userId: context?.user?.data?.id,
        });

        return await userService.getUserRoles(parent.roles);
      } catch (error) {
        console.log("User.roles error", error);
        throw ErrorHandler.handleError(error);
      }
    },
  },
  Query: {
    users: async (parent, args, context, info) => {
      try {
        const userService = new UserService({
          userId: context?.user?.data?.id,
        });

        const pagination = args.pagination || {};
        const filters = args.filters || {};
        const sort = args.sort || { by: "createdAt", direction: "desc" };

        return await userService.getFilteredUsers({
          filters,
          pagination,
          sort,
        });
      } catch (error) {
        console.log("Query.users error", error);
        throw ErrorHandler.handleError(error);
      }
    },
    user: async (parent, args, context, info) => {
      try {
        const userService = new UserService({
          userId: context?.user?.data?.id,
        });

        return await userService.getUserById(args.id);
      } catch (error) {
        console.log("Query.user error", error);
        throw ErrorHandler.handleError(error);
      }
    },
    me: async (parent, args, context, info) => {
      try {
        const userService = new UserService({
          userId: context?.user?.data?.id,
        });

        return await userService.getCurrentUser();
      } catch (error) {
        console.log("Query.me error", error);
        throw ErrorHandler.handleError(error);
      }
    },
  },
  Mutation: {
    register: async (parent, args, context, info) => {
      try {
        const userService = new UserService({});
        return await userService.registerUser(args.input);
      } catch (error) {
        console.log("Mutation.register error", error);
        throw ErrorHandler.handleError(error);
      }
    },
    login: async (parent, args, context, info) => {
      try {
        const userService = new UserService({});
        return await userService.loginUser(args.input);
      } catch (error) {
        console.log("Mutation.login error", error);
        throw ErrorHandler.handleError(error);
      }
    },
    refreshToken: async (parent, { token }, context, info) => {
      try {
        const userService = new UserService({});
        return await userService.refreshToken(token);
      } catch (error) {
        console.log("Mutation.refreshToken error", error);
        throw ErrorHandler.handleError(error);
      }
    },
    updateUser: async (parent, args, context, info) => {
      try {
        const userService = new UserService({
          userId: context?.user?.data?.id,
        });

        return await userService.updateUser(args.input);
      } catch (error) {
        console.log("Mutation.updateUser error", error);
        throw ErrorHandler.handleError(error);
      }
    },
    deleteUser: async (parent, args, context, info) => {
      try {
        const userService = new UserService({
          userId: context?.user?.data?.id,
        });

        return await userService.deleteUser(args.id);
      } catch (error) {
        console.log("Mutation.deleteUser error", error);
        throw ErrorHandler.handleError(error);
      }
    },
  },
};

export default userResolvers;
