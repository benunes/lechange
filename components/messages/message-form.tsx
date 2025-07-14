"use client";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {sendMessage} from "@/lib/actions/messages.actions";
import {zodResolver} from "@hookform/resolvers/zod";
import {useTransition} from "react";
import {useForm} from "react-hook-form";
import {Mic, Paperclip, Send, Smile} from "lucide-react";
import {motion} from "framer-motion";
import * as z from "zod";

const formSchema = z.object({
    content: z.string().min(1, "Le message ne peut pas être vide"),
});

interface MessageFormProps {
    conversationId: string;
}

export function MessageForm({conversationId}: MessageFormProps) {
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        startTransition(async () => {
            await sendMessage(conversationId, values.content);
            form.reset();
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            form.handleSubmit(onSubmit)();
        }
    };

    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            className="relative"
        >
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-3">
                {/* Message Input Container */}
                <div className="flex-1 relative">
                    <div
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-400">
                        <div className="flex items-center p-3">
                            {/* Emoji Button */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-purple-100 hover:text-purple-600 transition-colors"
                            >
                                <Smile className="h-4 w-4"/>
                            </Button>

                            {/* Text Input */}
                            <Input
                                {...form.register("content")}
                                placeholder="Écris ton message..."
                                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground/70"
                                onKeyPress={handleKeyPress}
                                disabled={isPending}
                                autoComplete="off"
                            />

                            {/* Attachment Button */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors"
                            >
                                <Paperclip className="h-4 w-4"/>
                            </Button>

                            {/* Voice Message Button */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-green-100 hover:text-green-600 transition-colors"
                            >
                                <Mic className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {form.formState.errors.content && (
                        <motion.p
                            initial={{opacity: 0, y: -10}}
                            animate={{opacity: 1, y: 0}}
                            className="text-xs text-red-500 mt-1 px-4"
                        >
                            {form.formState.errors.content.message}
                        </motion.p>
                    )}
                </div>

                {/* Send Button */}
                <motion.div
                    whileHover={{scale: 1.05}}
                    whileTap={{scale: 0.95}}
                >
                    <Button
                        type="submit"
                        disabled={isPending || !form.watch("content")?.trim()}
                        className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? (
                            <motion.div
                                animate={{rotate: 360}}
                                transition={{duration: 1, repeat: Infinity, ease: "linear"}}
                                className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                            />
                        ) : (
                            <Send className="h-4 w-4"/>
                        )}
                    </Button>
                </motion.div>
            </form>

            {/* Quick Actions */}
            <div className="flex items-center justify-between mt-3 px-1">
                <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Appuie sur Entrée pour envoyer
          </span>
                </div>

                <div className="flex items-center gap-1">
                    <motion.div
                        animate={{opacity: [0.5, 1, 0.5]}}
                        transition={{duration: 2, repeat: Infinity}}
                        className="h-2 w-2 bg-green-500 rounded-full"
                    />
                    <span className="text-xs text-muted-foreground">En ligne</span>
                </div>
            </div>
        </motion.div>
    );
}
