import { generateApiKey } from "../../utils/token.js";
import ApiKey from "../../models/apiKey.model.js";
import User from "../../models/user.model.js";
import Role from "../../models/role.model.js";

const checkIfAuthorized = async (context) => {
  const contextUser = context?.user?.data;

  if (!contextUser?.id) {
    throw new Error("Unauthorized");
  }

  const user = await User.findById(contextUser?.id).populate("roles");
  if (!user) {
    throw new Error("User not found");
  }

  const roles = await Role.find({ _id: { $in: user.roles } });

  if (!roles.find((role) => role.name === "admin")) {
    throw new Error("Unauthorized: Admin access required");
  }

  return user;
};

const ApiKeyResolvers = {
  Query: {
    apiKeys: async (parent, args, context, info) => {
      try {
        await checkIfAuthorized(context);

        const apiKeys = await ApiKey.find({}).populate("owner");
        return apiKeys;
      } catch (error) {
        console.log("Query.apiKeys error", error);
        throw new Error(error);
      }
    },
    apiKey: async (parent, args, context, info) => {
      try {
        await checkIfAuthorized(context);

        return await ApiKey.findById(args.id).populate("owner");
      } catch (error) {
        console.log("Query.apiKey error", error);
        throw new Error(error);
      }
    },
  },
  Mutation: {
    generateApiKey: async (parent, args, context, info) => {
      try {
        const user = await checkIfAuthorized(context);

        const apiKey = generateApiKey();

        const newApiKey = await ApiKey.create({
          key: apiKey,
          owner: user._id,
        });

        return await newApiKey.populate("owner");
      } catch (error) {
        console.log("Mutation.generateApiKey error", error);
        throw new Error(error);
      }
    },
    revokeApiKey: async (parent, args, context, info) => {
      try {
        await checkIfAuthorized(context);

        const apiKey = await ApiKey.findById(args.id);
        if (!apiKey) {
          throw new Error("Api Key not found");
        }

        await apiKey.deleteOne();
        return "Api Key revoked successfully";
      } catch (error) {
        console.log("Mutation.revokeApiKey error", error);
        throw new Error(error);
      }
    },
  },
};

export default ApiKeyResolvers;
