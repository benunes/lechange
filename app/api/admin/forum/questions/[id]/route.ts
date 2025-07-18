import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withRoleCheck } from "@/lib/middleware/role-middleware";
import { z } from "zod";

const deleteQuestionSchema = z.object({
  reason: z.string().min(1, "La raison est requise"),
});

async function deleteQuestion(
  request: NextRequest,
  currentUser: any,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reason } = deleteQuestionSchema.parse(body);

    // Vérifier que la question existe
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer la question et les données associées
    await prisma.$transaction([
      // Supprimer les votes des réponses
      prisma.answerVote.deleteMany({
        where: {
          answer: {
            questionId: id,
          },
        },
      }),
      // Supprimer les signalements des réponses
      prisma.report.deleteMany({
        where: {
          answer: {
            questionId: id,
          },
        },
      }),
      // Supprimer les réponses
      prisma.answer.deleteMany({
        where: { questionId: id },
      }),
      // Supprimer les suivis de la question
      prisma.questionFollow.deleteMany({
        where: { questionId: id },
      }),
      // Supprimer les signalements de la question
      prisma.report.deleteMany({
        where: { questionId: id },
      }),
      // Supprimer la question
      prisma.question.delete({
        where: { id },
      }),
      // Logger l'action
      prisma.adminLog.create({
        data: {
          adminId: currentUser.id,
          action: "DELETE_QUESTION",
          details: `Suppression de la question "${question.title}" de ${question.author.name}. Raison: ${reason}`,
          targetType: "QUESTION",
          targetId: id,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de la question:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la question" },
      { status: 500 }
    );
  }
}

export const DELETE = withRoleCheck(["ADMIN"], deleteQuestion);
