import { PrismaClient } from "@/lib/generated/prisma";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function createDefaultCategories() {
  try {
    // Vérifier si des catégories existent déjà
    const existingCategories = await prisma.category.count();

    if (existingCategories > 0) {
      console.log("Des catégories existent déjà dans la base de données.");
      return;
    }

    // Créer un utilisateur admin temporaire pour les catégories
    let adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!adminUser) {
      console.log("Aucun admin trouvé. Création d'un admin temporaire...");
      adminUser = await prisma.user.create({
        data: {
          id: randomUUID(),
          email: "admin@lechange.com",
          name: "Admin",
          role: "ADMIN",
        },
      });
    }

    const defaultCategories = [
      {
        name: "Général",
        description: "Questions générales et discussions ouvertes",
        icon: "MessageCircle",
        color: "#3B82F6",
      },
      {
        name: "Technologie",
        description: "Questions sur la tech, programmation, informatique",
        icon: "Monitor",
        color: "#10B981",
      },
      {
        name: "Éducation",
        description: "Aide aux devoirs, cours, études",
        icon: "BookOpen",
        color: "#F59E0B",
      },
      {
        name: "Lifestyle",
        description: "Mode de vie, santé, bien-être",
        icon: "Heart",
        color: "#EF4444",
      },
      {
        name: "Loisirs",
        description: "Jeux, sport, divertissement",
        icon: "Gamepad2",
        color: "#8B5CF6",
      },
      {
        name: "Voyages",
        description: "Conseils de voyage, destinations",
        icon: "MapPin",
        color: "#06B6D4",
      },
    ];

    for (const category of defaultCategories) {
      await prisma.category.create({
        data: {
          id: randomUUID(),
          name: category.name,
          slug: createSlug(category.name),
          description: category.description,
          icon: category.icon,
          color: category.color,
          createdById: adminUser.id,
        },
      });
      console.log(`Catégorie "${category.name}" créée avec succès`);
    }

    console.log("Toutes les catégories par défaut ont été créées !");
  } catch (error) {
    console.error("Erreur lors de la création des catégories:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultCategories();
