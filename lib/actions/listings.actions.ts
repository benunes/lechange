"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import * as z from "zod";

const listingSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  categoryId: z.string().min(1), // Changer category en categoryId
  price: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  condition: z.string().optional(),
  location: z.string().optional(),
});

export async function createListing(values: z.infer<typeof listingSchema>) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { error: "Non autorisé. Vous devez être connecté." };
  }

  const validatedFields = listingSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Champs invalides." };
  }

  const { title, description, categoryId, price, images, condition, location } =
    validatedFields.data;

  try {
    await prisma.listing.create({
      data: {
        title,
        description,
        categoryId, // Utiliser categoryId au lieu de category
        price: price ? parseFloat(price) : null,
        images: images || [],
        condition,
        location,
        createdById: session.user.id,
      },
    });

    revalidatePath("/");
    return { success: "Annonce créée avec succès !" };
  } catch (error) {
    console.error(error);
    return {
      error: "Une erreur est survenue lors de la création de l'ann",
    };
  }
}
