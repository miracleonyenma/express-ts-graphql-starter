import User from "../../models/user.model.js";
import pkg from "jsonwebtoken";
import { config } from "dotenv";
import {
  accessTokenData,
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../../utils/token.js";

const { sign } = pkg;
config();

const userResolvers = {
  Query: {
    users: async (parent, args, context, info) => {
      try {
        const pagination = args.pagination || {};
        let { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;
        const users = await User.find()
          .skip(skip)
          .limit(limit)
          .populate("roles");
        const count = await User.countDocuments();
        const pages = Math.ceil(count / limit);

        return {
          data: users,
          meta: {
            page,
            limit,
            pages,
            total: count,
          },
        };
      } catch (error) {
        console.log("Query.users error", error);

        throw error;
      }
    },
    user: async (parent, args, context, info) => {
      try {
        return await User.findById(args.id).populate("roles");
      } catch (error) {
        console.log("Query.user error", error);
        throw error;
      }
    },
    me: async (parent, args, context, info) => {
      const id = context?.user?.data?.id;

      if (!id) {
        throw new Error("Unable to authenticate user");
      }

      try {
        return await User.findById(id).populate("roles");
      } catch (error) {
        console.log("Query.me error", error);
        throw error;
      }
    },
  },
  Mutation: {
    register: async (parent, args, context, info) => {
      try {
        const user = (await User.registerUser(args.input)).populate("roles");
        return { user };
      } catch (error) {
        console.log("Mutation.register error", error);
        throw error;
      }
    },
    login: async (parent, args, context, info) => {
      try {
        const user = await User.loginUser(args.input);
        const accessToken = createAccessToken(accessTokenData(user));
        const refreshToken = createRefreshToken({ id: user._id });
        return { accessToken, refreshToken, user };
      } catch (error) {
        console.log("Mutation.login error", error);
        throw error;
      }
    },
    refreshToken: async (parent, { token }, context, info) => {
      try {
        const decoded = verifyRefreshToken(token);
        console.log({ decoded });

        const user = await User.findById(decoded.data.id);
        const accessToken = createAccessToken(accessTokenData(user));
        return { accessToken };
      } catch (error) {
        throw new Error("Invalid refresh token");
      }
    },
    updateUser: async (parent, args, context, info) => {
      try {
        return await User.findByIdAndUpdate(context.user.id, args.input, {
          new: true,
        });
      } catch (error) {
        console.log("Mutation.updateUser error", error);
        throw error;
      }
    },
    deleteUser: async (parent, args, context, info) => {
      try {
        const id = args.id || context.user.id;
        return await User.findByIdAndDelete(id);
      } catch (error) {
        console.log("Mutation.deleteUser error", error);
        throw error;
      }
    },
  },
};

export default userResolvers;
