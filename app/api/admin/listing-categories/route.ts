import { prisma } from "@/lib/db";
import { withRoleCheck } from "@/lib/middleware/role-middleware";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const createCategorySchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  icon: z.string().min(1, "L'icône est requise"),
  color: z.string().min(1, "La couleur est requise"),
  parentId: z.string().nullable().optional()
});

async function getCategories() {
  try {
    const categories = await prisma.listingCategory.findMany({
      orderBy: [{ parentId: "asc" }, { order: "asc" }],
      include: {
        subcategories: {
          orderBy: { order: "asc" },
          include: {
            _count: {
              select: { listings: true


        },
        _count: {
          select: {
            listings: true,
          },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des catégories" },
      { status: 500 },
    );
  }
}

    async function createCategory(request: NextRequest, currentUser: any) {
  try {
    const body = await request.json();
    const { name, description, icon, color, parentId } = createCategorySchema.parse(
      body
    );

    // Générer un slug unique
    const baseSlug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let slug = baseSlug;
    let counter = 1;

    while (await prisma.listingCategory.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Déterminer l'ordre
    const maxOrder = await prisma.listingCategory.findFirst({
      where: { parentId: parentId || null },
      orderBy: { order: "desc" },
      select: { order: true }
    });

    const order = (maxOrder?.order || 0) + 1;

    const category = await prisma.listingCategory.create({
      data: {
        name,
        description: description || null,
        icon,
        color,
        slug,
        parentId: parentId || null,
        order,
        createdById: currentUser.id
      },
      include: {
        subcategories: true,
        _count: {
          select: { listings: true }
        }
      }
    });

    // Log de l'action admin
    await prisma.adminLog.create({
      data: {
        adminId: currentUser.id,
        action: "CREATE_LISTING_CATEGORY",
        details: `Création de la catégorie d'annonce: ${name}`,
        targetId: category.id,
        targetType: "LISTING_CATEGORY"
      },
    });

    return NextResponse.json({
      success: true,
      message: "Catégorie créée avec succès",
      category
    });
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}

// GET route - accessible aux admins seulement
    export const GET = withRoleCheck("ADMIN", getCategories);

// POST route - accessible aux admins seulement
    export const POST = withRoleCheck("ADMIN", createCategory);
