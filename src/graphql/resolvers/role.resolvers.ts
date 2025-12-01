import prisma from "../../config/prisma.js";

const roleResolvers = {
  Query: {
    roles: async () => {
      return await prisma.role.findMany();
    },
  },
  Mutation: {
    createRole: async (_, { name }) => {
      const role = await prisma.role.create({
        data: { name },
      });
      return role;
    },
    deleteRole: async (_, { id }) => {
      return await prisma.role.delete({ where: { id } });
    },
  },
};

export default roleResolvers;
