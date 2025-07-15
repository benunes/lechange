import { prisma } from "../lib/db.js";

async function fixUserRolesProper() {
  try {
    console.log("Correction des rôles utilisateur...");

    // Étape 1: Changer temporairement le type de colonne en TEXT
    await prisma.$executeRaw`ALTER TABLE "user"
      ALTER COLUMN role TYPE TEXT;`;
    console.log("✅ Colonne role convertie en TEXT");

    // Étape 2: Mettre à jour les valeurs
    const updateResult = await prisma.$executeRaw`
      UPDATE "user"
      SET role = CASE
                   WHEN role = 'user' THEN 'USER'
                   WHEN role = 'admin' THEN 'ADMIN'
                   WHEN role = 'moderator' THEN 'MODERATOR'
                   WHEN role = 'suspended' THEN 'SUSPENDED'
                   ELSE role
        END
      WHERE role IN ('user', 'admin', 'moderator', 'suspended');
    `;
    console.log(`✅ ${updateResult} utilisateurs mis à jour`);

    // Étape 3: Remettre le type enum
    await prisma.$executeRaw`ALTER TABLE "user"
      ALTER COLUMN role TYPE "UserRole" USING role::"UserRole";`;
    console.log("✅ Colonne role reconvertie en UserRole");

    // Vérification finale
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

fixUserRolesProper();
