import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { messageBroadcaster } from "@/lib/message-broadcaster";
import { z } from "zod";

const messageSchema = z.object({
  content: z
    .string()
    .min(1, "Le message ne peut pas être vide")
    .max(1000, "Le message est trop long"),
  conversationId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const { content, conversationId } = messageSchema.parse(body);

    // Vérifier que l'utilisateur peut accéder à cette conversation et récupérer tous les participants
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 },
      );
    }

    // Créer le nouveau message
    const newMessage = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        conversationId: conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    console.log(
      `💬 Nouveau message créé par ${session.user.id} dans conversation ${conversationId}`,
    );

    // Récupérer tous les IDs des participants pour le broadcasting
    const participantIds = conversation.participants.map((p) => p.user.id);

    console.log(
      `📡 Broadcasting message à ${participantIds.length} participants:`,
      participantIds,
    );
    console.log(
      `📊 Status des connexions:`,
      messageBroadcaster.getConnectionsStatus(),
    );

    // Broadcaster le nouveau message à tous les participants connectés
    messageBroadcaster.broadcastToUsers(participantIds, {
      type: "new_message",
      conversationId: conversationId,
      message: newMessage,
    });

    return NextResponse.json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.error("Erreur création message:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: error.issues, // Correction: utiliser 'issues' au lieu de 'errors'
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
      },
      { status: 500 },
    );
  }
}
