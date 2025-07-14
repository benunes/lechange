"use server";

import {auth} from "@/lib/auth";
import {PrismaClient} from "@/lib/generated/prisma";
import {revalidatePath} from "next/cache";
import {headers} from "next/headers";
import * as z from "zod";

const prisma = new PrismaClient();

const questionSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    tags: z.string().optional(),
});

export async function createQuestion(values: z.infer<typeof questionSchema>) {
    const session = await auth.api.getSession({headers: await headers()});

    if (!session) {
        return {error: "Non autorisé."};
    }

    const validatedFields = questionSchema.safeParse(values);

    if (!validatedFields.success) {
        return {error: "Champs invalides."};
    }

    const {title, content, tags} = validatedFields.data;
    const tagsArray = tags ? tags.split(",").map((tag) => tag.trim()) : [];

    try {
        const question = await prisma.question.create({
            data: {
                title,
                content,
                tags: tagsArray,
                authorId: session.user.id,
            },
        });

        revalidatePath("/forum");
        return {success: "Question publiée !", questionId: question.id};
    } catch (error) {
        console.error(error);
        return {error: "Une erreur est survenue."};
    }
}

const answerSchema = z.object({
    content: z.string().min(1),
    questionId: z.string(),
});

export async function createAnswer(values: z.infer<typeof answerSchema>) {
    const session = await auth.api.getSession({headers: await headers()});

    if (!session) {
        return {error: "Non autorisé."};
    }

    const validatedFields = answerSchema.safeParse(values);

    if (!validatedFields.success) {
        return {error: "Champs invalides."};
    }

    const {content, questionId} = validatedFields.data;

    try {
        await prisma.answer.create({
            data: {
                content,
                questionId,
                authorId: session.user.id,
            },
        });

        revalidatePath(`/forum/${questionId}`);
        return {success: "Réponse publiée !"};
    } catch (error) {
        console.error(error);
        return {error: "Une erreur est survenue."};
    }
}
