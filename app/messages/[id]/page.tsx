import {ChatView} from "@/components/messages/chat-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {auth} from "@/lib/auth";
import { prisma } from "@/lib/db";
import {headers} from "next/headers";
import {notFound, redirect} from "next/navigation";
import {ArrowLeft, MessageCircle, MoreVertical, Phone, User, Video,} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

async function getConversation(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findUnique({
        where: {id: conversationId},
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
                    id: true,
                    title: true,
                    price: true,
                    category: true,
                    images: true,
                    description: true,
                },
            },
            messages: {
                orderBy: {
                    createdAt: "asc",
                },
                include: {
                    sender: {
                        select: {id: true, name: true, image: true},
                    },
                },
            },
        },
    });

    // Ensure the current user is a participant
    if (!conversation?.participants.some((p) => p.userId === userId)) {
        return null;
    }

    return conversation;
}

export default async function ConversationPage({
                                                   params,
                                               }: {
    params: { id: string };
}) {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session) {
        redirect("/login");
    }

    const conversation = await getConversation(params?.id, session.user.id);

    if (!conversation) {
        notFound();
    }

    const otherParticipant = conversation.participants.find(
        (p) => p.user.id !== session.user.id
    )?.user;

    return (
        <div className="h-screen flex flex-col">
            {/* Header Navigation */}
            <div className="flex-shrink-0 p-4 border-b bg-background/95 backdrop-blur-sm">
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="hover:bg-blue-50 hover:text-blue-600"
                >
                    <Link href="/messages" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4"/>
                        Retour aux messages
                    </Link>
                </Button>
            </div>

            {/* Conversation Header */}
            <div className="flex-shrink-0 border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                {otherParticipant?.image ? (
                                    <Image
                                        src={otherParticipant.image}
                                        alt={otherParticipant.name || ""}
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
                                <div
                                    className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                            </div>

                            <div className="min-w-0">
                                <h2 className="font-semibold text-lg truncate">
                                    {otherParticipant?.name || "Utilisateur inconnu"}
                                </h2>

                                {conversation.listing && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                            variant="outline"
                                            className="text-xs border-purple-300 text-purple-600"
                                        >
                                            <MessageCircle className="h-3 w-3 mr-1"/>
                                            {conversation.listing.title}
                                        </Badge>
                                        {conversation.listing.price && (
                                            <Badge
                                                variant="secondary"
                                                className="text-xs bg-green-100 text-green-700"
                                            >
                                                {conversation.listing.price} €
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Phone className="h-4 w-4"/>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Video className="h-4 w-4"/>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Container - Prend tout l'espace restant */}
            <div className="flex-1 min-h-0">
                <ChatView
                    initialMessages={conversation.messages}
                    conversationId={conversation.id}
                    currentUserId={session.user.id}
                />
            </div>

            {/* Info Annonce - Position fixe en bas si présente */}
            {conversation.listing && (
                <div
                    className="flex-shrink-0 border-t bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-950/20 dark:to-pink-950/20 backdrop-blur-sm">
                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                    <MessageCircle className="h-4 w-4 text-white"/>
                                </div>
                                <div>
                                    <h3 className="font-medium text-sm">
                                        {conversation.listing.title}
                                    </h3>
                                    {conversation.listing.price && (
                                        <p className="text-sm font-semibold text-green-600">
                                            {conversation.listing.price} €
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="hover:bg-purple-50"
                            >
                                <Link href={`/listings/${conversation.listing.id}`}>
                                    Voir l'annonce
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
