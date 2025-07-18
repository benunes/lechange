import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withRoleCheck } from "@/lib/middleware/role-middleware";
import { z } from "zod";

const deleteAnswerSchema = z.object({
  reason: z.string().min(1, "La raison est requise"),
});

async function deleteAnswer(
  request: NextRequest,
  currentUser: any,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reason } = deleteAnswerSchema.parse(body);

    // Vérifier que la réponse existe
    const answer = await prisma.answer.findUnique({
      where: { id },
      include: {
        author: {
          select: { name: true, email: true },
        },
        question: {
          select: { title: true },
        },
      },
    });

    if (!answer) {
      return NextResponse.json(
        { error: "Réponse non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer la réponse et les données associées
    await prisma.$transaction([
      // Supprimer les votes
      prisma.answerVote.deleteMany({
        where: { answerId: id },
      }),
      // Supprimer les signalements
      prisma.report.deleteMany({
        where: { answerId: id },
      }),
      // Supprimer les réponses imbriquées
      prisma.answer.deleteMany({
        where: { parentId: id },
      }),
      // Réinitialiser bestAnswer si c'est cette réponse
      prisma.question.updateMany({
        where: { bestAnswerId: id },
        data: { bestAnswerId: null },
      }),
      // Supprimer la réponse
      prisma.answer.delete({
        where: { id },
      }),
      // Logger l'action
      prisma.adminLog.create({
        data: {
          adminId: currentUser.id,
          action: "DELETE_ANSWER",
          details: `Suppression d'une réponse de ${answer.author.name} sur la question "${answer.question.title}". Raison: ${reason}`,
          targetType: "ANSWER",
          targetId: id,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de la réponse:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la réponse" },
      { status: 500 }
    );
  }
}

export const DELETE = withRoleCheck(["ADMIN"], deleteAnswer);
