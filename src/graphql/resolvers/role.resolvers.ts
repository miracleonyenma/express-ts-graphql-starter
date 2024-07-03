import Role from "../../models/role.model.js";

const roleResolvers = {
  Query: {
    roles: async () => {
      return await Role.find();
    },
  },
  Mutation: {
    createRole: async (_, { name }) => {
      const role = new Role({ name });
      await role.save();
      return role;
    },
    deleteRole: async (_, { id }) => {
      return await Role.findByIdAndDelete(id);
    },
  },
};

export default roleResolvers;
