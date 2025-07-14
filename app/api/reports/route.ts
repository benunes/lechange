import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { type, details, listingId, questionId, answerId } = body;

    console.log("Données reçues:", {
      type,
      details,
      listingId,
      questionId,
      answerId,
      userId: session.user.id,
    });

    // Valider le type de signalement
    const validTypes = [
      "INAPPROPRIATE_CONTENT",
      "SPAM",
      "HARASSMENT",
      "FAKE_LISTING",
      "SCAM",
      "COPYRIGHT",
      "OTHER",
    ];

    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Type de signalement invalide" },
        { status: 400 },
      );
    }

    // S'assurer qu'au moins un élément est signalé
    if (!listingId && !questionId && !answerId) {
      return NextResponse.json(
        { error: "Aucun élément à signaler spécifié" },
        { status: 400 },
      );
    }

    // Vérifier que l'élément à signaler existe
    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
      });
      if (!listing) {
        return NextResponse.json(
          { error: "Annonce non trouvée" },
          { status: 404 },
        );
      }
    }

    if (questionId) {
      const question = await prisma.question.findUnique({
        where: { id: questionId },
      });
      if (!question) {
        return NextResponse.json(
          { error: "Question non trouvée" },
          { status: 404 },
        );
      }
    }

    if (answerId) {
      const answer = await prisma.answer.findUnique({
        where: { id: answerId },
      });
      if (!answer) {
        return NextResponse.json(
          { error: "Réponse non trouvée" },
          { status: 404 },
        );
      }
    }

    // Créer le signalement
    console.log("Création du signalement...");
    const report = await prisma.report.create({
      data: {
        type: type,
        details: details || null,
        reportedBy: session.user.id,
        listingId: listingId || null,
        questionId: questionId || null,
        answerId: answerId || null,
      },
    });

    console.log("Signalement créé:", report.id);

    // Éviter les notifications pour l'instant si elles causent des erreurs
    // On peut les réactiver plus tard

    return NextResponse.json({
      success: true,
      message: "Signalement créé avec succès",
      reportId: report.id,
    });
  } catch (error) {
    console.error(
      "Erreur détaillée lors de la création du signalement:",
      error,
    );
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    );
  }
}
