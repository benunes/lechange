import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserStats } from "@/lib/actions/forum.actions";
import { getUserBadge } from "@/lib/utils/user-badges";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Trophy,
  MessageCircle,
  HelpCircle,
  TrendingUp,
  Calendar,
} from "lucide-react";

async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
      questions: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          createdAt: true,
          _count: { select: { answers: true } },
        },
      },
      answers: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          question: {
            select: { id: true, title: true },
          },
        },
      },
    },
  });

  if (!user) return null;

  const stats = await getUserStats(userId);
  return { user, stats };
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>; // Correction: Promise<{ id: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { id } = await params; // Correction: await params
  const result = await getUserProfile(id);

  if (!result) {
    notFound();
  }

  const { user, stats } = result;
  const userBadge = getUserBadge(stats);
  const isOwnProfile = session?.user.id === user.id;

  return (
    <div className="min-h-screen py-8">
      {/* Header avec breadcrumb */}
      <div className="mb-8">
        <Button
          asChild
          variant="ghost"
          className="mb-6 hover:bg-purple-50 hover:text-purple-600"
        >
          <Link href="/forum" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour au forum
          </Link>
        </Button>
      </div>

      {/* Profil utilisateur */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Carte profil */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center">
              <div className="relative mx-auto mb-4">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "Avatar"}
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-20 w-20 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto">
                    <User className="h-10 w-10 text-purple-500" />
                  </div>
                )}
              </div>

              <CardTitle className="text-2xl mb-2">{user.name}</CardTitle>

              <Badge
                className={`${userBadge.color} text-white mb-4`}
                title={userBadge.description}
              >
                {userBadge.name}
              </Badge>

              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Membre depuis{" "}
                  {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </CardHeader>
          </Card>

          {/* Statistiques */}
          <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.questionsCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Questions</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.answersCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Réponses</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.totalUpvotes}
                  </div>
                  <div className="text-xs text-muted-foreground">Upvotes</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.bestAnswersCount}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Meilleures
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activité récente */}
        <div className="lg:col-span-2 space-y-6">
          {/* Questions récentes */}
          <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-purple-500" />
                Questions récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.questions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucune question posée
                </p>
              ) : (
                <div className="space-y-3">
                  {user.questions.map((question) => (
                    <div
                      key={question.id}
                      className="p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <Link href={`/forum/${question.id}`} className="block">
                        <h4 className="font-medium hover:text-purple-600 transition-colors mb-2">
                          {question.title}
                        </h4>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>
                              {question._count.answers} réponse
                              {question._count.answers !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <span>
                            {new Date(question.createdAt).toLocaleDateString(
                              "fr-FR",
                            )}
                          </span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Réponses récentes */}
          <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                Réponses récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.answers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucune réponse donnée
                </p>
              ) : (
                <div className="space-y-3">
                  {user.answers.map((answer) => (
                    <div
                      key={answer.id}
                      className="p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <Link
                        href={`/forum/${answer.question.id}`}
                        className="block"
                      >
                        <h4 className="font-medium hover:text-blue-600 transition-colors mb-2">
                          Réponse à : {answer.question.title}
                        </h4>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>
                              {answer.upvotes - answer.downvotes} votes
                            </span>
                          </div>
                          <span>
                            {new Date(answer.createdAt).toLocaleDateString(
                              "fr-FR",
                            )}
                          </span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
