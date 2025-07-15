import { prisma } from "../lib/db";

const listingCategories = [
  // TECHNOLOGIE
  {
    name: "Technologie",
    description: "Appareils électroniques, informatique et gadgets",
    icon: "Smartphone",
    color: "#3B82F6",
    slug: "technologie",
    order: 1,
    subcategories: [
      {
        name: "Smartphones & Téléphones",
        description: "Téléphones portables, smartphones et accessoires",
        icon: "Smartphone",
        color: "#3B82F6",
        slug: "smartphones-telephones",
        order: 1,
      },
      {
        name: "Ordinateurs & Laptops",
        description: "PC de bureau, ordinateurs portables, composants",
        icon: "Laptop",
        color: "#3B82F6",
        slug: "ordinateurs-laptops",
        order: 2,
      },
      {
        name: "Tablettes & E-readers",
        description: "Tablettes, iPad, liseuses numériques",
        icon: "Tablet",
        color: "#3B82F6",
        slug: "tablettes-ereaders",
        order: 3,
      },
      {
        name: "Gaming & Consoles",
        description: "Consoles de jeux, jeux vidéo, accessoires gaming",
        icon: "Gamepad2",
        color: "#3B82F6",
        slug: "gaming-consoles",
        order: 4,
      },
      {
        name: "Audio & Son",
        description: "Casques, écouteurs, enceintes, équipements audio",
        icon: "Headphones",
        color: "#3B82F6",
        slug: "audio-son",
        order: 5,
      },
      {
        name: "Photo & Vidéo",
        description: "Appareils photo, caméras, drones, accessoires",
        icon: "Camera",
        color: "#3B82F6",
        slug: "photo-video",
        order: 6,
      },
    ],
  },

  // MODE & BEAUTÉ
  {
    name: "Mode & Beauté",
    description: "Vêtements, chaussures, accessoires et cosmétiques",
    icon: "Shirt",
    color: "#EC4899",
    slug: "mode-beaute",
    order: 2,
    subcategories: [
      {
        name: "Vêtements Femme",
        description: "Robes, tops, pantalons, vestes pour femmes",
        icon: "Shirt",
        color: "#EC4899",
        slug: "vetements-femme",
        order: 1,
      },
      {
        name: "Vêtements Homme",
        description: "Chemises, pantalons, vestes pour hommes",
        icon: "Shirt",
        color: "#EC4899",
        slug: "vetements-homme",
        order: 2,
      },
      {
        name: "Chaussures",
        description: "Baskets, bottes, sandales, chaussures de sport",
        icon: "ShirtIcon",
        color: "#EC4899",
        slug: "chaussures",
        order: 3,
      },
      {
        name: "Accessoires",
        description: "Sacs, bijoux, montres, lunettes",
        icon: "Watch",
        color: "#EC4899",
        slug: "accessoires",
        order: 4,
      },
      {
        name: "Cosmétiques & Soins",
        description: "Maquillage, parfums, produits de soins",
        icon: "Sparkles",
        color: "#EC4899",
        slug: "cosmetiques-soins",
        order: 5,
      },
    ],
  },

  // LOISIRS & SPORTS
  {
    name: "Loisirs & Sports",
    description: "Équipements sportifs, jeux et activités de loisir",
    icon: "Trophy",
    color: "#10B981",
    slug: "loisirs-sports",
    order: 3,
    subcategories: [
      {
        name: "Sports & Fitness",
        description: "Équipements de sport, fitness, musculation",
        icon: "Dumbbell",
        color: "#10B981",
        slug: "sports-fitness",
        order: 1,
      },
      {
        name: "Vélos & Trottinettes",
        description: "Vélos, VTT, trottinettes électriques",
        icon: "Bike",
        color: "#10B981",
        slug: "velos-trottinettes",
        order: 2,
      },
      {
        name: "Jeux & Jouets",
        description: "Jeux de société, jouets, puzzles",
        icon: "Gamepad2",
        color: "#10B981",
        slug: "jeux-jouets",
        order: 3,
      },
      {
        name: "Livres & BD",
        description: "Romans, BD, mangas, livres scolaires",
        icon: "Book",
        color: "#10B981",
        slug: "livres-bd",
        order: 4,
      },
      {
        name: "Musique & Instruments",
        description: "Instruments de musique, partitions, accessoires",
        icon: "Music",
        color: "#10B981",
        slug: "musique-instruments",
        order: 5,
      },
    ],
  },

  // MAISON & JARDIN
  {
    name: "Maison & Jardin",
    description: "Mobilier, décoration et équipements pour la maison",
    icon: "Home",
    color: "#F59E0B",
    slug: "maison-jardin",
    order: 4,
    subcategories: [
      {
        name: "Mobilier",
        description: "Tables, chaises, canapés, lits, rangements",
        icon: "Home",
        color: "#F59E0B",
        slug: "mobilier",
        order: 1,
      },
      {
        name: "Décoration",
        description: "Tableaux, luminaires, coussins, rideaux",
        icon: "Palette",
        color: "#F59E0B",
        slug: "decoration",
        order: 2,
      },
      {
        name: "Électroménager",
        description: "Réfrigérateurs, machines à laver, micro-ondes",
        icon: "Zap",
        color: "#F59E0B",
        slug: "electromenager",
        order: 3,
      },
      {
        name: "Jardin & Extérieur",
        description: "Plantes, outils de jardinage, mobilier extérieur",
        icon: "TreePine",
        color: "#F59E0B",
        slug: "jardin-exterieur",
        order: 4,
      },
      {
        name: "Bricolage & Outils",
        description: "Outils, matériaux, équipements de bricolage",
        icon: "Wrench",
        color: "#F59E0B",
        slug: "bricolage-outils",
        order: 5,
      },
    ],
  },

  // VÉHICULES
  {
    name: "Véhicules",
    description: "Voitures, motos, vélos et accessoires automobiles",
    icon: "Car",
    color: "#EF4444",
    slug: "vehicules",
    order: 5,
    subcategories: [
      {
        name: "Voitures",
        description: "Voitures d'occasion, pièces détachées",
        icon: "Car",
        color: "#EF4444",
        slug: "voitures",
        order: 1,
      },
      {
        name: "Motos & Scooters",
        description: "Motos, scooters, équipements motard",
        icon: "Bike",
        color: "#EF4444",
        slug: "motos-scooters",
        order: 2,
      },
      {
        name: "Pièces & Accessoires",
        description: "Pièces détachées, accessoires automobiles",
        icon: "Settings",
        color: "#EF4444",
        slug: "pieces-accessoires",
        order: 3,
      },
    ],
  },

  // SERVICES
  {
    name: "Services",
    description: "Prestations de services et compétences",
    icon: "Users",
    color: "#8B5CF6",
    slug: "services",
    order: 6,
    subcategories: [
      {
        name: "Cours & Formation",
        description: "Cours particuliers, formations, tutorat",
        icon: "GraduationCap",
        color: "#8B5CF6",
        slug: "cours-formation",
        order: 1,
      },
      {
        name: "Services à la personne",
        description: "Baby-sitting, ménage, jardinage",
        icon: "Users",
        color: "#8B5CF6",
        slug: "services-personne",
        order: 2,
      },
      {
        name: "Événements",
        description: "Organisation d'événements, animation",
        icon: "Calendar",
        color: "#8B5CF6",
        slug: "evenements",
        order: 3,
      },
      {
        name: "Créatif & Design",
        description: "Graphisme, photographie, création",
        icon: "Palette",
        color: "#8B5CF6",
        slug: "creatif-design",
        order: 4,
      },
    ],
  },

  // AUTRES
  {
    name: "Autres",
    description: "Tout ce qui ne rentre pas dans les autres catégories",
    icon: "MoreHorizontal",
    color: "#6B7280",
    slug: "autres",
    order: 7,
    subcategories: [
      {
        name: "Animaux",
        description: "Accessoires pour animaux, services vétérinaires",
        icon: "Heart",
        color: "#6B7280",
        slug: "animaux",
        order: 1,
      },
      {
        name: "Artisanat & Vintage",
        description: "Objets artisanaux, vintage, collection",
        icon: "Gem",
        color: "#6B7280",
        slug: "artisanat-vintage",
        order: 2,
      },
      {
        name: "Recherché",
        description: "Je cherche quelque chose de spécifique",
        icon: "Search",
        color: "#6B7280",
        slug: "recherche",
        order: 3,
      },
    ],
  },
];

async function createSystemUser() {
  console.log("👤 Création de l'utilisateur système...");

  // Vérifier si l'utilisateur système existe déjà
  let systemUser = await prisma.user.findFirst({
    where: { email: "system@lechange.app" },
  });

  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        id: "system-user-id",
        name: "Système LeChange",
        email: "system@lechange.app",
        role: "ADMIN",
        emailVerified: true,
      },
    });
    console.log("✅ Utilisateur système créé");
  } else {
    console.log("✅ Utilisateur système existant trouvé");
  }

  return systemUser;
}

async function createListingCategories() {
  console.log("🔄 Suppression des anciennes catégories d'annonces...");

  // Supprimer les anciennes catégories (en cascade)
  await prisma.listingCategory.deleteMany({});

  console.log("✅ Anciennes catégories supprimées");

  // Créer ou récupérer l'utilisateur système
  const systemUser = await createSystemUser();

  for (const category of listingCategories) {
    const { subcategories, ...categoryData } = category;

    console.log(`📁 Création de la catégorie: ${category.name}`);

    // Créer la catégorie parent
    const parentCategory = await prisma.listingCategory.create({
      data: {
        ...categoryData,
        createdById: systemUser.id,
      },
    });

    // Créer les sous-catégories
    if (subcategories && subcategories.length > 0) {
      for (const subcategory of subcategories) {
        console.log(
          `  └── 📂 Création de la sous-catégorie: ${subcategory.name}`,
        );

        await prisma.listingCategory.create({
          data: {
            ...subcategory,
            parentId: parentCategory.id,
            createdById: systemUser.id,
          },
        });
      }
    }
  }

  console.log(
    "🎉 Toutes les catégories d'annonces ont été créées avec succès !",
  );
}

async function main() {
  try {
    await createListingCategories();
  } catch (error) {
    console.error("❌ Erreur lors de la création des catégories:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
