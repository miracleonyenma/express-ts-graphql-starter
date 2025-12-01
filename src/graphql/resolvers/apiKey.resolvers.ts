import { generateApiKey } from "../../utils/token.js";
import prisma from "../../config/prisma.js";

const checkIfAuthorized = async (context) => {
  const contextUser = context?.user?.data;

  if (!contextUser?.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: contextUser.id },
    include: { roles: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.roles.find((role) => role.name === "admin")) {
    throw new Error("Unauthorized: Admin access required");
  }

  return user;
};

const ApiKeyResolvers = {
  Query: {
    apiKeys: async (parent, args, context, info) => {
      try {
        await checkIfAuthorized(context);

        const apiKeys = await prisma.apiKey.findMany({
          include: { owner: true },
        });
        return apiKeys;
      } catch (error) {
        console.log("Query.apiKeys error", error);
        throw new Error(error);
      }
    },
    apiKey: async (parent, args, context, info) => {
      try {
        await checkIfAuthorized(context);

        return await prisma.apiKey.findUnique({
          where: { id: args.id },
          include: { owner: true },
        });
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

        const newApiKey = await prisma.apiKey.create({
          data: {
            key: apiKey,
            owner: { connect: { id: user.id } },
          },
          include: { owner: true },
        });

        return newApiKey;
      } catch (error) {
        console.log("Mutation.generateApiKey error", error);
        throw new Error(error);
      }
    },
    revokeApiKey: async (parent, args, context, info) => {
      try {
        await checkIfAuthorized(context);

        const apiKey = await prisma.apiKey.findUnique({
          where: { id: args.id },
        });
        if (!apiKey) {
          throw new Error("Api Key not found");
        }

        await prisma.apiKey.delete({ where: { id: args.id } });
        return "Api Key revoked successfully";
      } catch (error) {
        console.log("Mutation.revokeApiKey error", error);
        throw new Error(error);
      }
    },
  },
};

export default ApiKeyResolvers;
