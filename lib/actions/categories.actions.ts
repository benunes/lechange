"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import * as z from "zod";

const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est obligatoire")
    .max(50, "Le nom est trop long"),
  description: z.string().optional(),
  icon: z.string().min(1, "L'icône est obligatoire"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Couleur hexadécimale invalide"),
  slug: z
    .string()
    .min(1, "Le slug est obligatoire")
    .regex(
      /^[a-z0-9-]+$/,
      "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets",
    ),
});

export async function createCategory(values: z.infer<typeof categorySchema>) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { error: "Non autorisé." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "MODERATOR" && user?.role !== "ADMIN") {
    return {
      error:
        "Seuls les modérateurs et administrateurs peuvent créer des catégories.",
    };
  }

  const validatedFields = categorySchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Champs invalides." };
  }

  const { name, description, icon, color, slug } = validatedFields.data;

  try {
    // Vérifier l'unicité du nom et du slug
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    });

    if (existingCategory) {
      return { error: "Une catégorie avec ce nom ou ce slug existe déjà." };
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        icon,
        color,
        slug,
        createdById: session.user.id,
      },
    });

    revalidatePath("/forum");
    revalidatePath("/admin/forum");
    revalidatePath("/moderator");

    return {
      success: "Catégorie créée avec succès !",
      categoryId: category.id,
    };
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error);
    return { error: "Une erreur est survenue." };
  }
}

export async function updateCategory(
  id: string,
  values: z.infer<typeof categorySchema>,
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { error: "Non autorisé." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "MODERATOR" && user?.role !== "ADMIN") {
    return {
      error:
        "Seuls les modérateurs et administrateurs peuvent modifier des catégories.",
    };
  }

  const validatedFields = categorySchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Champs invalides." };
  }

  const { name, description, icon, color, slug } = validatedFields.data;

  try {
    // Vérifier l'unicité du nom et du slug (exclure la catégorie actuelle)
    const existingCategory = await prisma.category.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [{ name }, { slug }],
          },
        ],
      },
    });

    if (existingCategory) {
      return { error: "Une catégorie avec ce nom ou ce slug existe déjà." };
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        icon,
        color,
        slug,
      },
    });

    revalidatePath("/forum");
    revalidatePath("/admin/forum");
    revalidatePath("/moderator");

    return { success: "Catégorie mise à jour avec succès !" };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la catégorie:", error);
    return { error: "Une erreur est survenue." };
  }
}

export async function toggleCategoryStatus(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { error: "Non autorisé." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "MODERATOR" && user?.role !== "ADMIN") {
    return {
      error:
        "Seuls les modérateurs et administrateurs peuvent modifier des catégories.",
    };
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!category) {
      return { error: "Catégorie non trouvée." };
    }

    await prisma.category.update({
      where: { id },
      data: {
        isActive: !category.isActive,
      },
    });

    revalidatePath("/forum");
    revalidatePath("/admin/forum");
    revalidatePath("/moderator");

    return {
      success: category.isActive
        ? "Catégorie désactivée."
        : "Catégorie activée.",
    };
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    return { error: "Une erreur est survenue." };
  }
}

export async function deleteCategory(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { error: "Non autorisé." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    return {
      error: "Seuls les administrateurs peuvent supprimer des catégories.",
    };
  }

  try {
    // Vérifier si la catégorie a des questions associées
    const questionsCount = await prisma.question.count({
      where: { categoryId: id },
    });

    if (questionsCount > 0) {
      return {
        error: `Impossible de supprimer cette catégorie. Elle contient ${questionsCount} question(s).`,
      };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/forum");
    revalidatePath("/admin/forum");
    revalidatePath("/moderator");

    return { success: "Catégorie supprimée avec succès." };
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    return { error: "Une erreur est survenue." };
  }
}

export async function getCategories() {
  try {
    return await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return [];
  }
}

export async function getAllCategoriesForAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return [];
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "MODERATOR" && user?.role !== "ADMIN") {
    return [];
  }

  try {
    return await prisma.category.findMany({
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return [];
  }
}
