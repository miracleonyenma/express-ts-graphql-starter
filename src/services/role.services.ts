// setupRoles.ts

import Role from "../models/role.model.js";

const setupRoles = async () => {
  const roles = ["user", "developer", "admin"];

  for (const roleName of roles) {
    const roleExists = await Role.findOne({ name: roleName });

    if (!roleExists) {
      const role = new Role({ name: roleName });
      await role.save();
      console.log(`${roleName} role created.`);
    }
  }

  console.log("Roles setup completed.");
};

export default setupRoles;
