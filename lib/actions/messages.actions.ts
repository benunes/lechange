"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function startOrGetConversation(listingId: string, sellerId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Non autorisé.");
  }

  const buyerId = session.user.id;

  // Find existing conversation with these two participants for this listing
  let conversation = await prisma.conversation.findFirst({
    where: {
      listingId,
      participants: {
        every: {
          userId: {
            in: [buyerId, sellerId],
          },
        },
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        listingId,
        participants: {
          create: [{ userId: buyerId }, { userId: sellerd }],
        },
      },
    });
  }

  redirect(`/messages/${conversation.id}`);
}

export async function sendMessage(conversationId: string, content: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Non autorisé.");
  }

  const senderId = session.user.id;

  // Verify that the user is a participant of the conversation
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      userId_conversationId: {
        userId: senderId,
        conversationId,
      },
    },
  });

  if (!participant) {
    throw new Error("Vous ne faites pas partie de cette conversation.");
  }

  await prisma.message.create({
    data: {
      content,
      conversationId,
      senderId,
    },
  });

  revalidatePath(`/messages/${conversationId}`);
}

export async function getNewerMessages(
  conversationId: string,
  lastMessageDate: string,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      createdAt: {
        gt: new Date(lastMessageDate),
      },
    },
    include: {
      sender: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return messages;
}
