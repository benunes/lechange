import {NewAnswerForm} from "@/components/forum/new-answer-form";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {auth} from "@/lib/auth";
import {PrismaClient} from "@/lib/generated/prisma";
import {headers} from "next/headers";
import Image from "next/image";
import Link from "next/link";
import {notFound} from "next/navigation";
import {ArrowLeft, Clock, HelpCircle, MessageCircle, Reply, ThumbsUp, User,} from "lucide-react";

const prisma = new PrismaClient();

async function getQuestion(id: string) {
    const question = await prisma.question.findUnique({
        where: {id},
        include: {
            author: {
                select: {
                    name: true,
                    image: true,
                },
            },
            answers: {
                include: {
                    author: {
                        select: {
                            name: true,
                            image: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "asc",
                },
            },
        },
    });
    return question;
}

export default async function QuestionPage({
                                               params,
                                           }: {
    params: { id: string };
}) {
    const session = await auth.api.getSession({headers: await headers()});
    const question = await getQuestion(params.id);

    if (!question) {
        notFound();
    }

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
                        <ArrowLeft className="h-4 w-4"/>
                        Retour au forum
                    </Link>
                </Button>
            </div>

            {/* Question Card */}
            <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl mb-8">
                <CardHeader className="pb-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/20 rounded-full px-4 py-2">
                            <HelpCircle className="h-4 w-4 text-purple-500"/>
                            <span
                                className="text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Question
              </span>
                        </div>
                    </div>

                    <CardTitle className="text-2xl md:text-3xl font-bold leading-tight mb-4">
                        {question.title}
                    </CardTitle>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                            {question.author.image ? (
                                <Image
                                    src={question.author.image}
                                    alt={question.author.name || "Avatar"}
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                />
                            ) : (
                                <div
                                    className="h-8 w-8 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-purple-500"/>
                                </div>
                            )}
                            <span className="font-medium">{question.author.name}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4"/>
                            <span>
                {new Date(question.createdAt).toLocaleDateString("fr-FR")}
              </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4"/>
                            <span>
                {question.answers.length} réponse
                                {question.answers.length !== 1 ? "s" : ""}
              </span>
                        </div>
                    </div>

                    {question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {question.tags.map((tag) => (
                                <Badge
                                    key={tag}
                                    className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardHeader>

                <CardContent>
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                            {question.content}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Réponses Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <MessageCircle className="h-6 w-6 text-purple-500"/>
                        {question.answers.length} Réponse
                        {question.answers.length !== 1 ? "s" : ""}
                    </h2>
                </div>

                {question.answers.length === 0 ? (
                    <Card
                        className="border-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/10 dark:to-pink-950/10 backdrop-blur-sm">
                        <CardContent className="text-center py-12">
                            <div
                                className="h-16 w-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Reply className="h-8 w-8 text-purple-500"/>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                Aucune réponse pour le moment
                            </h3>
                            <p className="text-muted-foreground">
                                Sois le premier à aider en répondant à cette question !
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {question.answers.map((answer, index) => (
                            <Card
                                key={answer.id}
                                className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                            >
                                <CardContent className="p-6">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            {answer.author.image ? (
                                                <Image
                                                    src={answer.author.image}
                                                    alt={answer.author.name || "Avatar"}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-full"
                                                />
                                            ) : (
                                                <div
                                                    className="h-10 w-10 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
                                                    <User className="h-5 w-5 text-blue-500"/>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-foreground">
                          {answer.author.name}
                        </span>
                                                <Badge variant="outline" className="text-xs">
                                                    Réponse #{index + 1}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                          {new Date(answer.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                                            </div>

                                            <div className="prose prose-gray dark:prose-invert max-w-none">
                                                <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                                                    {answer.content}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4 mt-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 text-muted-foreground hover:text-purple-600"
                                                >
                                                    <ThumbsUp className="h-4 w-4 mr-1"/>
                                                    Utile
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Formulaire de réponse */}
                {session && (
                    <Card
                        className="border-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/10 dark:to-pink-950/10 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Reply className="h-5 w-5 text-purple-500"/>
                                Ajouter une réponse
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Partage tes connaissances pour aider la communauté !
                            </p>
                        </CardHeader>
                        <CardContent>
                            <NewAnswerForm questionId={question.id}/>
                        </CardContent>
                    </Card>
                )}

                {!session && (
                    <Card
                        className="border-0 bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-950/10 dark:to-red-950/10 backdrop-blur-sm">
                        <CardContent className="text-center py-8">
                            <h3 className="text-lg font-semibold mb-2">
                                Connecte-toi pour répondre
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                Tu dois être connecté pour pouvoir aider la communauté
                            </p>
                            <Button
                                asChild
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                            >
                                <Link href="/login">Se connecter</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
