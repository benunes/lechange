import { prisma } from "@/lib/db";

/**
 * Script pour promouvoir un utilisateur au rôle d'administrateur
 * Usage: npx tsx scripts/promote-user.ts
 */

async function promoteUser() {
  console.log("🛡️ Promotion d'utilisateur...");

  try {
    // Afficher tous les utilisateurs existants
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("\n👥 Utilisateurs existants:");
    console.log("=".repeat(80));

    if (users.length === 0) {
      console.log("❌ Aucun utilisateur trouvé dans la base de données");
      console.log("💡 Inscris-toi d'abord sur la plateforme via /register");
      return;
    }

    users.forEach((user, index) => {
      const roleColor =
        user.role === "ADMIN" ? "👑" : user.role === "MODERATOR" ? "🛡️" : "👤";
      console.log(
        `${index + 1}. ${roleColor} ${user.name || "Sans nom"} (${user.email}) - ${user.role}`,
      );
      console.log(
        `   ID: ${user.id} | Inscrit le: ${user.createdAt.toLocaleDateString("fr-FR")}`,
      );
    });

    console.log(
      "\n📝 Pour promouvoir un utilisateur, modifie le script avec l'email souhaité",
    );
    console.log("💡 Ou utilise le dashboard admin une fois connecté !");

    // Statistiques
    const stats = {
      total: users.length,
      admins: users.filter((u) => u.role === "ADMIN").length,
      moderators: users.filter((u) => u.role === "MODERATOR").length,
      users: users.filter((u) => u.role === "USER").length,
    };

    console.log(`\n📊 Statistiques:`);
    console.log(`   👥 Total: ${stats.total}`);
    console.log(`   👑 Administrateurs: ${stats.admins}`);
    console.log(`   🛡️ Modérateurs: ${stats.moderators}`);
    console.log(`   👤 Utilisateurs: ${stats.users}`);
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  promoteUser();
}

export { promoteUser };
