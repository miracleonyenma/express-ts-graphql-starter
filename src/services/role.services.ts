import prisma from "../config/prisma.js";

const setupRoles = async () => {
  const roles = ["user", "developer", "admin"];

  for (const roleName of roles) {
    const roleExists = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!roleExists) {
      await prisma.role.create({
        data: { name: roleName },
      });
      console.log(`${roleName} role created.`);
    }
  }

  console.log("Roles setup completed.");
};

export default setupRoles;
