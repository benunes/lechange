"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Send } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  content: z
    .string()
    .min(1, "Le message ne peut pas être vide")
    .max(1000, "Message trop long"),
});

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

interface MessageFormProps {
  conversationId: string;
  onMessageSent?: (message: Message) => void;
}

export function MessageForm({
  conversationId,
  onMessageSent,
}: MessageFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        // Mise à jour optimiste - afficher le message immédiatement
        const optimisticMessage: Message = {
          id: `temp-${Date.now()}`,
          content: values.content,
          createdAt: new Date(),
          sender: {
            id: "current-user", // Sera remplacé par les vraies données
            name: "Vous",
            image: null,
          },
        };

        // Afficher le message optimiste
        onMessageSent?.(optimisticMessage);

        // Vider le formulaire immédiatement
        form.reset();

        // Envoyer le message au serveur
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: values.content,
            conversationI, // Correction: conversationId au lieu de conversationId
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de l'envoi du message");
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Erreur lors de l'envoi");
        }
      } catch (error) {
        console.error("Erreur envoi message:", error);
        toast.error("Impossible d'envoyer le message");

        // En cas d'erreur, remettre le contenu dans le formulaire
        form.setValue("content", values.content);
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isPending && form.watch("content").trim()) {
        form.handleSubmit(onSubmit)();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-end gap-3"
      >
        {/* Message Input Container */}
        <div className="flex-1 relative">
          <Input
            {...form.register("content")}
            placeholder="Écrivez votre message..."
            onKeyDown={handleKeyPress}
            disabled={isPending}
            className="pr-12 py-3 text-base bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl transition-all duration-200"
            autoComplete="off"
          />

          {/* Character count */}
          <div className="absolute bottom-1 right-12 text-xs text-gray-400">
            {form.watch("content")?.length || 0}/1000
          </div>
        </div>

        {/* Send Button */}
        <Button
          type="submit"
          disabled={isPending || !form.watch("content")?.trim()}
          className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>

      {/* Error display */}
      {form.formState.errors.content && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 mt-2"
        >
          {form.formState.errors.content.message}
        </motion.p>
      )}
    </motion.div>
  );
}
