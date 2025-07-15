import { prisma } from "../lib/db.js";

const listingCategories = [
  // Catégories principales avec sous-catégories
  {
    name: "Électronique",
    icon: "📱",
    color: "#3B82F6",
    slug: "electronique",
    subcategories: [
      { name: "Smartphones", icon: "📱", color: "#6366F1" },
      { name: "Ordinateurs", icon: "💻", color: "#8B5CF6" },
      { name: "Tablettes", icon: "📱", color: "#A855F7" },
      { name: "Casques & Audio", icon: "🎧", color: "#C084FC" },
      { name: "Télévisions", icon: "📺", color: "#D946EF" },
      { name: "Consoles de jeu", icon: "🎮", color: "#E879F9" },
      { name: "Appareils photo", icon: "📷", color: "#F0ABFC" },
      { name: "Accessoires", icon: "🔌", color: "#F3E8FF" },
    ],
  },
  {
    name: "Mode & Beauté",
    icon: "👗",
    color: "#EC4899",
    slug: "mode-beaute",
    subcategories: [
      { name: "Vêtements femme", icon: "👗", color: "#F472B6" },
      { name: "Vêtements homme", icon: "👔", color: "#FB7185" },
      { name: "Chaussures", icon: "👠", color: "#FDA4AF" },
      { name: "Sacs & Accessoires", icon: "👜", color: "#FBBF24" },
      { name: "Bijoux", icon: "💍", color: "#FCD34D" },
      { name: "Montres", icon: "⌚", color: "#FDE68A" },
      { name: "Cosmétiques", icon: "💄", color: "#FEF3C7" },
      { name: "Parfums", icon: "🌸", color: "#ECFDF5" },
    ],
  },
  {
    name: "Sports & Loisirs",
    icon: "⚽",
    color: "#10B981",
    slug: "sports-loisirs",
    subcategories: [
      { name: "Équipements fitness", icon: "🏋️", color: "#34D399" },
      { name: "Sports d'équipe", icon: "⚽", color: "#6EE7B7" },
      { name: "Sports nautiques", icon: "🏄", color: "#99F6E4" },
      { name: "Vélos", icon: "🚴", color: "#5EEAD4" },
      { name: "Randonnée", icon: "🥾", color: "#2DD4BF" },
      { name: "Jeux de société", icon: "🎲", color: "#14B8A6" },
      { name: "Instruments de musique", icon: "🎸", color: "#0D9488" },
      { name: "Livres", icon: "📚", color: "#0F766E" },
    ],
  },
  {
    name: "Maison & Jardin",
    icon: "🏠",
    color: "#F59E0B",
    slug: "maison-jardin",
    subcategories: [
      { name: "Meubles", icon: "🪑", color: "#FBBF24" },
      { name: "Décoration", icon: "🖼️", color: "#FCD34D" },
      { name: "Électroménager", icon: "🔌", color: "#FDE68A" },
      { name: "Bricolage", icon: "🔨", color: "#FEF3C7" },
      { name: "Jardinage", icon: "🌱", color: "#D4EDDA" },
      { name: "Cuisine", icon: "🍳", color: "#A7F3D0" },
      { name: "Salle de bain", icon: "🛁", color: "#6EE7B7" },
      { name: "Linge de maison", icon: "🛏️", color: "#34D399" },
    ],
  },
  {
    name: "Transport",
    icon: "🚗",
    color: "#DC2626",
    slug: "transport",
    subcategories: [
      { name: "Voitures", icon: "🚗", color: "#EF4444" },
      { name: "Motos", icon: "🏍️", color: "#F87171" },
      { name: "Vélos électriques", icon: "🚴", color: "#FCA5A5" },
      { name: "Trottinettes", icon: "🛴", color: "#FECACA" },
      { name: "Pièces auto", icon: "🔧", color: "#FEE2E2" },
      { name: "Accessoires auto", icon: "🚘", color: "#DBEAFE" },
    ],
  },
  {
    name: "Éducation",
    icon: "📚",
    color: "#7C3AED",
    slug: "education",
    subcategories: [
      { name: "Manuels scolaires", icon: "📖", color: "#8B5CF6" },
      { name: "Cours particuliers", icon: "👨‍🏫", color: "#A855F7" },
      { name: "Matériel scolaire", icon: "✏️", color: "#C084FC" },
      { name: "Formations en ligne", icon: "💻", color: "#DDD6FE" },
      { name: "Langues", icon: "🗣️", color: "#E9D5FF" },
    ],
  },
];

async function createListingCategoriesSafe() {
  try {
    console.log("🚀 Création des catégories d'annonces...");

    let createdCount = 0;
    let skippedCount = 0;

    for (const categoryData of listingCategories) {
      // Vérifier si la catégorie principale existe déjà
      const existingParent = await prisma.listingCategory.findFirst({
        where: { slug: categoryData.slug },
      });

      let parentCategory;

      if (existingParent) {
        console.log(`⚠️  Catégorie parent "${categoryData.name}" existe déjà`);
        parentCategory = existingParent;
        skippedCount++;
      } else {
        // Créer la catégorie principale
        parentCategory = await prisma.listingCategory.create({
          data: {
            name: categoryData.name,
            description: `Catégorie ${categoryData.name}`,
            icon: categoryData.icon,
            color: categoryData.color,
            slug: categoryData.slug,
            isActive: true,
            order: listingCategories.indexOf(categoryData),
            createdById: "IJuu2BmIxzFbh4dWmImclJLHnbxn5Mt0", // Votre ID admin
          },
        });

        console.log(`✅ Catégorie parent créée: ${categoryData.name}`);
        createdCount++;
      }

      // Créer les sous-catégories
      for (const subcat of categoryData.subcategories) {
        const subcatSlug = `${categoryData.slug}-${subcat.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")}`;

        const existingSub = await prisma.listingCategory.findFirst({
          where: { slug: subcatSlug },
        });

        if (existingSub) {
          console.log(`⚠️  Sous-catégorie "${subcat.name}" existe déjà`);
          skippedCount++;
        } else {
          await prisma.listingCategory.create({
            data: {
              name: subcat.name,
              description: `${subcat.name} dans ${categoryData.name}`,
              icon: subcat.icon,
              color: subcat.color,
              slug: subcatSlug,
              isActive: true,
              order: categoryData.subcategories.indexOf(subcat),
              parentId: parentCategory.id,
              createdById: "IJuu2BmIxzFbh4dWmImclJLHnbxn5Mt0", // Votre ID admin
            },
          });

          console.log(`  ✅ Sous-catégorie créée: ${subcat.name}`);
          createdCount++;
        }
      }
    }

    console.log(`\n🎉 Terminé !`);
    console.log(`✅ ${createdCount} catégories créées`);
    console.log(`⚠️  ${skippedCount} catégories ignorées (déjà existantes)`);

    // Afficher le résumé final
    const totalCategories = await prisma.listingCategory.count();
    console.log(`📊 Total des catégories dans la base: ${totalCategories}`);
  } catch (error) {
    console.error("❌ Erreur lors de la création des catégories:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createListingCategoriesSafe();
