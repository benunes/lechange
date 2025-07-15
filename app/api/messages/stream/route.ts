import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { messageBroadcaster } from "@/lib/message-broadcaster";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return new Response("Missing conversationId", { status: 400 });
  }

  // Vérifier que l'utilisateur a accès à cette conversation
  const hasAccess = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      participants: {
        some: {
          userId: session.user.id,
        },
      },
    },
  });

  if (!hasAccess) {
    return new Response("Forbidden", { status: 403 });
  }

  // Créer un stream SSE
  const stream = new ReadableStream({
    start(controller) {
      console.log(
        `🔗 Nouvelle connexion SSE pour l'utilisateur ${session.user.id} sur conversation ${conversationId}`,
      );

      // Ajouter cette connexion au broadcaster
      messageBroadcaster.addConnection(session.user.id, controller);

      // Envoyer un message de confirmation de connexion
      controller.enqueue(
        `data: ${JSON.stringify({
          type: "connected",
          conversationId,
          userId: session.user.id,
          timestamp: Date.now(),
        })}\n\n`,
      );

      // Nettoyer la connexion quand elle se ferme
      const cleanup = () => {
        console.log(
          `🔌 Fermeture connexion SSE pour l'utilisateur ${session.user.id}`,
        );
        messageBroadcaster.removeConnection(session.user.id, controller);
        try {
          controller.close();
        } catch (e) {
          // Connexion déjà fermée
          console.error("Erreur lors de la fermeture du stream SSE :", e);
        }
      };

      request.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}
