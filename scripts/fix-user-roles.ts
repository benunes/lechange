import { prisma } from "../lib/db.js";

async function fixUserRoles() {
  try {
    console.log("Correction des rôles utilisateur...");

    // Mettre à jour tous les utilisateurs avec rôle en minuscules
    const result = await prisma.$executeRaw`
      UPDATE "user"
      SET role = CASE
                   WHEN role = 'user' THEN 'USER'::UserRole
                   WHEN role = 'admin' THEN 'ADMIN'::UserRole
                   WHEN role = 'moderator' THEN 'MODERATOR'::UserRole
                   WHEN role = 'suspended' THEN 'SUSPENDED'::UserRole
                   ELSE role
        END
      WHERE role IN ('user', 'admin', 'moderator', 'suspended')
    `;

    console.log(`✅ ${result} utilisateurs mis à jour`);

    // Vérifier les rôles après mise à jour
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    console.log("\nUtilisateurs après correction:");
    users.forEach((user) => {
      console.log(`- ${user.name} (${user.email}) - Rôle: ${user.role}`);
    });
  } catch (error) {
    console.error("Erreur lors de la correction:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserRoles();
