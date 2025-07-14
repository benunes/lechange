"use server";

import {auth} from "@/lib/auth";
import {PrismaClient} from "@/lib/generated/prisma";
import {revalidatePath} from "next/cache";
import {headers} from "next/headers";
import * as z from "zod";

const prisma = new PrismaClient();

const listingSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    category: z.string().min(1),
    price: z.string().optional(),
    images: z.array(z.string().url()).optional(),
});

export async function createListing(values: z.infer<typeof listingSchema>) {
    const session = await auth.api.getSession({headers: await headers()});

    if (!session) {
        return {error: "Non autorisé. Vous devez être connecté."};
    }

    const validatedFields = listingSchema.safeParse(values);

    if (!validatedFields.success) {
        return {error: "Champs invalides."};
    }

    const {title, description, category, price, images} = validatedFields.data;

    try {
        await prisma.listing.create({
            data: {
                title,
                description,
                category,
                price: price ? parseFloat(price) : null,
                images: images || [],
                createdById: session.user.id,
            },
        });

        revalidatePath("/");
        return {success: "Annonce créée avec succès !"};
    } catch (error) {
        console.error(error);
        return {
            error: "Une erreur est survenue lors de la création de l'annonce.",
        };
    }
}
