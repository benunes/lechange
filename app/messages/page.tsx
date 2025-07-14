import {auth} from "@/lib/auth";
import {PrismaClient} from "@/lib/generated/prisma";
import {headers} from "next/headers";
import Image from "next/image";
import Link from "next/link";
import {redirect} from "next/navigation";
import {Card, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {ArrowRight, Clock, Inbox, MessageCircle, User,} from "lucide-react";

const prisma = new PrismaClient();

async function getConversations(userId: string) {
    const conversations = await prisma.conversation.findMany({
        where: {
            participants: {
                some: {
                    userId,
                },
            },
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: {id: true, name: true, image: true},
                    },
                },
            },
            listing: {
                select: {
                    title: true,
                },
            },
            messages: {
                take: 1,
                orderBy: {
                    createdAt: "desc",
                },
                select: {
                    content: true,
                    createdAt: true,
                },
            },
        },
        orderBy: {
            updatedAt: "desc",
        },
    });
    return conversations;
}

export default async function MessagesPage() {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session) {
        redirect("/login");
    }

    const conversations = await getConversations(session.user.id);

    return (
        <div className="min-h-screen py-8">
            {/* Header Section */}
            <div
                className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 rounded-3xl p-8 mb-8">
                <div className="text-center md:text-left">
                    <div
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/20 rounded-full px-4 py-2 mb-4">
                        <MessageCircle className="h-4 w-4 text-blue-500"/>
                        <span
                            className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Centre de messagerie
            </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Mes{" "}
                        <span
                            className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Messages
            </span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Gère tes conversations avec les autres membres de la communauté
                    </p>

                    {/* Stats */}
                    <div className="flex gap-6 mt-6 justify-center md:justify-start">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {conversations.length}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Conversation
                                {conversations.length !== 1 ? "s" : ""}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conversations List */}
            <div className="space-y-6">
                {conversations.length === 0 ? (
                    <div className="text-center py-16">
                        <div
                            className="h-24 w-24 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Inbox className="h-12 w-12 text-blue-500"/>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Aucune conversation</h3>
                        <p className="text-muted-foreground mb-6">
                            Tes conversations apparaîtront ici quand tu contacteras un vendeur ou
                            qu'on te contactera !
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {conversations.map((conversation) => {
                            const otherParticipant = conversation.participants.find(
                                (p) => p.user.id !== session.user.id
                            )?.user;
                            const lastMessage = conversation.messages[0];

                            return (
                                <Card
                                    key={conversation.id}
                                    className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                                >
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="relative">
                                                    {otherParticipant?.image ? (
                                                        <Image
                                                            src={otherParticipant.image}
                                                            alt={otherParticipant.name || ""}
                                                            width={48}
                                                            height={48}
                                                            className="rounded-full"
                                                        />
                                                    ) : (
                                                        <div
                                                            className="h-12 w-12 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
                                                            <User className="h-6 w-6 text-blue-500"/>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <CardTitle
                                                        className="text-lg group-hover:text-blue-600 transition-colors mb-1">
                                                        <Link
                                                            href={`/messages/${conversation.id}`}
                                                            className="hover:underline"
                                                        >
                                                            {otherParticipant?.name || "Utilisateur inconnu"}
                                                        </Link>
                                                    </CardTitle>

                                                    {conversation.listing && (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-purple-300 text-purple-600 dark:border-purple-600/30 dark:text-purple-400 mb-2"
                                                        >
                                                            {conversation.listing.title}
                                                        </Badge>
                                                    )}

                                                    {lastMessage && (
                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                            {lastMessage.content}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                {lastMessage && (
                                                    <div
                                                        className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3"/>
                                                        <span>
                              {new Date(lastMessage.createdAt).toLocaleDateString(
                                  "fr-FR"
                              )}
                            </span>
                                                    </div>
                                                )}
                                                <ArrowRight
                                                    className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors"/>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
