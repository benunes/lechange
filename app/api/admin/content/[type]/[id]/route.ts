import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { type: string; id: string } },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est modérateur ou admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!["ADMIN", "MODERATOR"].includes(user?.role || "")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { type, id } = params;

    // Supprimer le contenu selon le type
    switch (type.toLowerCase()) {
      case "annonce":
      case "listing":
      case "listings":
        await prisma.listing.delete({
          where: { id },
        });
        break;

      case "question":
      case "questions":
        // Supprimer d'abord les réponses liées
        await prisma.answer.deleteMany({
          where: { questionId: id },
        });
        // Puis supprimer la question
        await prisma.question.delete({
          where: { id },
        });
        break;

      case "réponse":
      case "answer":
      case "answers":
        // Supprimer les réponses enfants d'abord
        await prisma.answer.deleteMany({
          where: { parentId: id },
        });
        // Puis supprimer la réponse
        await prisma.answer.delete({
          where: { id },
        });
        break;

      case "message":
      case "messages":
        await prisma.message.delete({
          where: { id },
        });
        break;

      default:
        return NextResponse.json(
          { error: "Type de contenu invalide" },
          { status: 400 },
        );
    }

    // Créer un log d'administration
    await prisma.adminLog
      .create({
        data: {
          adminId: session.user.id,
          action: "DELETE_CONTENT",
          details: `Suppression de ${type} avec l'ID ${id}`,
          targetType: type.toUpperCase(),
          targetId: id,
        },
      })
      .catch(() => {
        // Ignorer si la table AdminLog n'existe pas encore
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du contenu:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
