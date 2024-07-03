import { Types } from "mongoose";
import User from "../../models/user.model.js";
import pkg from "jsonwebtoken";
import { config } from "dotenv";

const { sign } = pkg;
config();

const JWT_SECRET = process.env.JWT_SECRET;

const createToken = (
  data: any | { id: Types.ObjectId },
  // defualt 3 days
  dur = 3 * 24 * 60 * 60
) => {
  return sign({ data }, JWT_SECRET, {
    expiresIn: dur,
  });
};

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

        throw new Error(error);
      }
    },
    user: async (parent, args, context, info) => {
      try {
        return await User.findById(args.id).populate("roles");
      } catch (error) {
        console.log("Query.user error", error);
        throw new Error(error);
      }
    },
    me: async (parent, args, context, info) => {
      try {
        return await User.findById(context.user.id).populate("roles");
      } catch (error) {
        console.log("Query.me error", error);
        throw new Error(error);
      }
    },
  },
  Mutation: {
    register: async (parent, args, context, info) => {
      try {
        const user = (await User.registerUser(args.input)).populate("roles");
        const token = createToken({ id: (await user).id });
        return { token, user };
      } catch (error) {
        console.log("Mutation.register error", error);
        throw new Error(error);
      }
    },
    login: async (parent, args, context, info) => {
      try {
        const user = await User.loginUser(args.input);
        const token = createToken({ id: user._id });
        return { token, user };
      } catch (error) {
        console.log("Mutation.login error", error);
        throw new Error(error);
      }
    },
    updateUser: async (parent, args, context, info) => {
      try {
        return await User.findByIdAndUpdate(context.user.id, args.input, {
          new: true,
        });
      } catch (error) {
        console.log("Mutation.updateUser error", error);
        throw new Error(error);
      }
    },
    deleteUser: async (parent, args, context, info) => {
      try {
        const id = args.id || context.user.id;
        return await User.findByIdAndDelete(id);
      } catch (error) {
        console.log("Mutation.deleteUser error", error);
        throw new Error(error);
      }
    },
  },
};

export default userResolvers;
