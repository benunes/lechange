"use server";

import {auth} from "@/lib/auth";
import { prisma } from "@/lib/db";
import {revalidatePath} from "next/cache";
import {headers} from "next/headers";
import * as z from "zod";

const questionSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  tags: z.string().optional(),
  categoryId: z.string().optional(),
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

  const { title, content, tags, categoryId } = validatedFields.data;
  const tagsArray = tags ? tags.split(",").map((tag) => tag.trim()) : [];

    try {
        const question = await prisma.question.create({
          data: {
            title,
            content,
            tags: tagsArray,
            categoryId: categoryId || null,
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
  mentionedUserIds: z.array(z.string()).optional(),
});

export async fuction createAnswer(values: z.infer<typeof answerSchema>) {
    const session = await auth.api.getSession({headers: await headers()});

    if (!session) {
        return {error: "Non autorisé."};
    }

    const validatedFields = answerSchema.safeParse(values);

    if (!validatedFields.success) {
        return {error: "Champs invalides."};
    }

  const { content, questionId, mentionedUserIds = [] } = validatedFields.data;

    try {
      // Créer la réponse
      const answer = await prisma.answer.create({
            data: {
                content,
                questionId,
                authorId: session.user.id,
            },
        });

      // Récupérer la question pour notifier l'auteur
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: {
          author: true,
          followers: true
        }
      });

      if (question) {
        // Notifier l'auteur de la question (si pas lui-même)
        if (question.authorId !== session.user.id) {
          await createNotification(
            question.authorId,
            "NEW_ANSWER",
            "Nouvelle réponse",
            `${session.user.name} a répondu à votre question "${question.title}"`,
            { questionId, answerId: answer.id }
          );
        }

        // Notifier tous les followers de la question
        for (const follower of question.followers) {
          if (follower.userId !== session.user.id && follower.userId !== question.authorId) {
            await createNotification(
              follower.userId,
              "QUESTION_FOLLOWED",
              "Nouvelle réponse sur une question suivie",
              `${session.user.name} a répondu à "${question.title}"`,
              { questionId, answerId: answer.id }
            );
          }
        }

        // Gérer les mentions avec les IDs fournis (approche plus efficace)
        if (mentionedUserIds.length > 0) {
          // Créer des notifications pour chaque utilisateur mentionné
          for (const userId of mentionedUserIds) {
            if (userId !== session.user.id) {
              await createNotification(
                userId,
                "MENTION",
                "Vous avez été mentionné",
                `${session.user.name} vous a mentionné dans une réponse à "${question.title}"`,
                { questionId, answerId: answer.id }
              );
            }
          }
        }
      }

        revalidatePath(`/forum/${questionId}`);
        return {success: "Réponse publiée !"};
    } catch (error) {
      console.error("Erreur lors de la création de la réponse:", error);
        return {error: "Une erreur est survenue."};
    }
}

// Action pour récupérer les statistiques utilisateur
export async function getUserStats(userId: string) {
  const [questionsCount, answersCount, totalUpvotes, bestAnswersCount] = await Promise.all([
    prisma.question.count({ where: { authorId: userId } }),
    prisma.answer.count({ where: { authorId: userId } }),
    prisma.answer.aggregate({
      where: { authorId: userId },
      _sum: { upvotes: true }
    }),
    prisma.question.count({
      where: { bestAnswer: { authorId: userId } }
    })
  ]);

  return {
    questionsCount,
    answersCount,
    totalUpvotes: totalUpvotes._sum.upvotes || 0,
    bestAnswersCount
  };
}

export async function voteAnswer(answerId: string, isUpvote: boolean) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      throw new Error("Vous devez être connecté pour voter");
    }

    // Vérifier si l'utilisateur a déjà voté pour cette réponse
    const existingVote = await prisma.answerVote.findUnique({
      where: {
        userId_answerId: {
          userId: session.user.id,
          answerId: answerId
        }
      }
    });

    if (existingVote) {
      // Si le vote est identique, on le supprime (toggle)
      if (existingVote.isUpvote === isUpvote) {
        await prisma.$transaction([
          // Supprimer le vote
          prisma.answerVote.delete({
            where: { id: existingVote.id }
          }),
          // Mettre à jour les compteurs
          prisma.answer.update({
            where: { id: answerId },
            data: {
              upvotes: {
                decrement: isUpvote ? 1 : 0
              },
              downvotes: {
                decrement: !isUpvote ? 1 : 0
              }
            }
          })
        ]);
      } else {
        // Changer le type de vote
        await prisma.$transaction([
          // Mettre à jour le vote
          prisma.answerVote.update({
            where: { id: existingVote.id },
            data: { isUpvote }
          }),
          // Mettre à jour les compteurs
          prisma.answer.update({
            where: { id: answerId },
            data: {
              upvotes: {
                [isUpvote ? "increment" : "decrement"]: 1
              },
              downvotes: {
                [!isUpvote ? "increment" : "decrement"]: 1
              }
            }
          })
        ]);
      }
    } else {
      // Créer un nouveau vote
      await prisma.$transaction([
        // Créer le vote
        prisma.answerVote.create({
          data: {
            userId: session.user.id,
            answerId: answerId,
            isUpvote
          }
        }),
        // Mettre à jour les compteurs
        prisma.answer.update({
          where: { id: answerId },
          data: {
            upvotes: {
              increment: isUpvote ? 1 : 0
            },
            downvotes: {
              increment: !isUpvote ? 1 : 0
            }
          }
        })
      ]);
    }

    revalidatePath("/forum");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors du vote:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue"
    };
  }
}

export async function markBestAnswer(questionId: string, answerId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Non autorisé." };
  }
  // Vérifier que l'utilisateur est bien l'auteur de la question
  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question || question.authorId !== session.user.id) {
    return { error: "Action non autorisée." };
  }
  try {
    await prisma.question.update({
      where: { id: questionId },
      data: { bestAnswerId: answerId }
    });
    revalidatePath(`/forum/${questionId}`);
    return { success: "Meilleure réponse sélectionnée." };
  } catch (error) {
    return { error: "Erreur lors de la sélection." };
  }
}

// Actions pour les notifications et le suivi
export async function followQuestion(questionId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Non autorisé." };
  }

  try {
    await prisma.questionFollow.create({
      data: {
        userId: session.user.id,
        questionId
      }
    });
    revalidatePath(`/forum/${questionId}`);
    return { success: "Question suivie !" };
  } catch (error) {
    // Si déjà suivi, on ne fait rien
    return { success: "Question suivie !" };
  }
}

export async function unfollowQuestion(questionId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Non autorisé." };
  }

  try {
    await prisma.questionFollow.delete({
      where: {
        userId_questionId: {
          userId: session.user.id,
          questionId
        }
      }
    });
    revalidatePath(`/forum/${questionId}`);
    return { success: "Question non suivie." };
  } catch (error) {
    return { error: "Erreur lors du désabonnement." };
  }
}

export async function followTag(tag: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Non autorisé." };
  }

  try {
    await prisma.tagFollow.create({
      data: {
        userId: session.user.id,
        tag
      }
    });
    revalidatePath("/forum");
    return { success: `Tag #${tag} suivi !` };
  } catch (error) {
    return { success: `Tag #${tag} suivi !` };
  }
}

export async function createNotification(userId: string, type: string, title: string, message: string, data?: any) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: type as any,
        title,
        message,
        data
      }
    });
  } catch (error) {
    console.error("Erreur création notification:", error);
  }
}

export async function markNotificationAsRead(notificationId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Non autorisé." };
  }

  try {
    await prisma.notification.update({
      where: {
        id: notificationId,
        userId: session.user.id // Sécurité : seul le propriétaire peut marquer comme lu
      },
      data: { read: true }
    });
    revalidatePath("/notifications");
    return { success: "Notification marquée comme lue." };
  } catch (error) {
    return { error: "Erreur lors de la mise à jour." };
  }
}

export async function markAllNotificationsAsRead() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Non autorisé." };
  }

  try {
    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false
      },
      data: { read: true }
    });
    revalidatePath("/notifications");
    return { success: "Toutes les notifications marquées comme lues." };
  } catch (error) {
    return { error: "Erreur lors de la mise à jour." };
  }
}

export async function getUserNotifications() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return [];
  }

  return prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20 // Limiter à 20 notifications récentes
  });
}
