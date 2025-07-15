import { prisma } from "../lib/db.js";

async function checkAndPromoteUser() {
  try {
    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    console.log("Utilisateurs trouvés:");
    users.forEach((user) => {
      console.log(`- ${user.name} (${user.email}) - Rôle: ${user.role}`);
    });

    if (users.length === 0) {
      console.log("Aucun utilisateur trouvé");
      return;
    }

    // Promouvoir le premier utilisateur en ADMIN s'il n'y en a pas
    const adminUsers = users.filter((user) => user.role === "ADMIN");

    if (adminUsers.length === 0) {
      const firstUser = users[0];
      console.log(`\nPromotion de ${firstUser.name} en ADMIN...`);

      await prisma.user.update({
        where: { id: firstUser.id },
        data: { role: "ADMIN" },
      });

      console.log("✅ Utilisateur promu en ADMIN avec succès!");
    } else {
      console.log(`\n✅ ${adminUsers.length} administrateur(s) trouvé(s)`);
    }
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndPromoteUser();
