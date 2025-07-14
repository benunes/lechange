"use client";

import { useEffect, useRef } from "react";
import {MessageForm} from "./message-form";
import {Badge} from "@/components/ui/badge";
import { CheckCheck, User, Wifi, WifiOff } from "lucide-react";
import {AnimatePresence, motion} from "framer-motion";
import { useRealtimeMessages } from "@/lib/hooks/use-realtime-messages";

type Message = {
    id: string;
    content: string;
    createdAt: Date;
    sender: {
        id: string;
        name: string | null;
        image: string | null;
    };
};

interface ChatViewProps {
    initialMessages: Message[];
    conversationId: string;
    currentUserId: string;
}

export function ChatView({
                             initialMessages,
                             conversationId,
                             currentUserId,
                         }: ChatViewProps) {
  const { messages, isConnected, addMessageOptimistically } =
    useRealtimeMessages({
      conversationId,
      initialMessages,
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(date));
    };

    const isSameDay = (date1: Date, date2: Date) => {
        return date1.toDateString() === date2.toDateString();
    };

    const formatDate = (date: Date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (isSameDay(date, today)) {
            return "Aujourd'hui";
        } else if (isSameDay(date, yesterday)) {
            return "Hier";
        } else {
            return new Intl.DateTimeFormat("fr-FR", {
                day: "numeric",
                month: "long",
            }).format(date);
        }
    };

    return (
      <div className="flex flex-col h-full">
        {/* Indicateur de connexion temps réel */}
        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 border-b">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">
                  Temps réel actif
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-orange-600 dark:text-orange-400">
                  Reconnexion...
                </span>
              </>
            )}
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-slate-50/50 to-blue-50/50 dark:from-slate-900/50 dark:to-blue-950/50">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center">
                <div className="h-16 w-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Commencez la conversation !
                </h3>
                <p className="text-muted-foreground text-sm">
                  Envoyez votre premier message pour démarrer l'échange
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((message, index) => {
                  const isCurrentUser = message.sender.id === currentUserId;
                  const showDateSeparator =
                    index === 0 ||
                    !isSameDay(
                      new Date(messages[index - 1].createdAt),
                      new Date(message.createdAt),
                    );

                  return (
                    <div key={message.id}>
                      {/* Date Separator */}
                      {showDateSeparator && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-center my-4"
                        >
                          <Badge variant="outline" className="text-xs">
                            {formatDate(new Date(message.createdAt))}
                          </Badge>
                        </motion.div>
                      )}

                      {/* Message */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex gap-3 ${
                          isCurrentUser ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {message.sender.image ? (
                            <Image
                              src={message.sender.image}
                              alt={message.sender.name || "Avatar"}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                isCurrentUser
                                  ? "bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20"
                                  : "bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20"
                              }`}
                            >
                              <User
                                className={`h-4 w-4 ${
                                  isCurrentUser
                                    ? "text-purple-500"
                                    : "text-blue-500"
                                }`}
                              />
                            </div>
                          )}
                        </div>

                        {/* Message Content */}
                        <div
                          className={`flex flex-col max-w-[70%] ${
                            isCurrentUser ? "items-end" : "items-start"
                          }`}
                        >
                          {!isCurrentUser && (
                            <span className="text-xs text-muted-foreground mb-1 px-2">
                              {message.sender.name}
                            </span>
                          )}

                          {/* Message Bubble */}
                          <div
                            className={`
                            inline-block px-3 py-2 rounded-2xl text-sm max-w-full break-words
                            ${
                              isCurrentUser
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md"
                                : "bg-white dark:bg-gray-700 text-foreground border shadow-sm rounded-bl-md"
                            }
                          `}
                          >
                            {message.content}
                          </div>

                          {/* Time and Status */}
                          <div
                            className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                              isCurrentUser ? "flex-row-reverse" : "flex-row"
                            }`}
                          >
                            <span>
                              {formatTime(new Date(message.createdAt))}
                            </span>
                            {isCurrentUser && (
                              <CheckCheck className="h-3 w-3 text-blue-500" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Form - Position fixe en bas */}
        <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur-sm p-4">
          <MessageForm
            conversationId={conversationId}
            onMessageSent={addMessageOptimistically}
          />
        </div>
      </div>
    );
}
