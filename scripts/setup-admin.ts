import { prisma } from "@/lib/db";

/**
 * Script pour configurer les premiers administrateurs
 * Usage: npx tsx scripts/setup-admin.ts
 */

async function setupAdministrators() {
  console.log("🛡️ Configuration des administrateurs...");

  // Liste des emails à promouvoir en tant qu'administrateurs
  const adminEmails = [
    "bentk00@gmail.com", // Ton email principal
    "admin@lechange.com", // Email admin de la plateforme
  ];

  try {
    for (const email of adminEmails) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true, role: true },
      });

      if (user) {
        if (user.role !== "ADMIN") {
          await prisma.user.update({
            where: { email },
            data: { role: "ADMIN" },
          });

          console.log(`✅ ${user.name} (${email}) promu(e) administrateur`);

          // Créer un log d'administration
          await prisma.adminLog.create({
            data: {
              adminId: user.id,
              action: "ROLE_SETUP",
              details: `Promotion initiale au rôle ADMIN via script de configuration`,
              targetType: "USER",
              targetId: user.id,
            },
          });
        } else {
          console.log(`ℹ️ ${user.name} (${email}) est déjà administrateur`);
        }
      } else {
        console.log(`❌ Utilisateur non trouvé: ${email}`);
        console.log(
          `💡 Assure-toi que cet utilisateur s'est déjà inscrit sur la plateforme`,
        );
      }
    }

    // Afficher les statistiques
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    const moderatorCount = await prisma.user.count({
      where: { role: "MODERATOR" },
    });

    console.log(`\n📊 Statistiques des rôles:`);
    console.log(`   👑 Administrateurs: ${adminCount}`);
    console.log(`   🛡️ Modérateurs: ${moderatorCount}`);

    console.log(`\n🎉 Configuration terminée !`);
    console.log(`📍 Les administrateurs peuvent maintenant accéder à /admin`);
  } catch (error) {
    console.error("❌ Erreur lors de la configuration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  setupAdministrators();
}

export { setupAdministrators };
