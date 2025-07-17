"use client";

import { Button } from "@/components/ui/button";
import { MentionInput } from "@/components/forum/mention-input";
import { createAnswer } from "@/lib/actions/forum.actions";
import { getMentionedUserIds, MentionUser } from "@/lib/utils/mentions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Send, Users } from "lucide-react";
import * as z from "zod";

const formSchema = z.object({
  content: z
    .string()
    .min(10, "La réponse doit contenir au moins 10 caractères."),
});

type FormValues = z.infer<typeof formSchema>;

interface NewAnswerFormProps {
  questionId: string;
}

export function NewAnswerForm({ questionId }: NewAnswerFormProps) {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState("");
  const [users, setUsers] = useState<MentionUser[]>([]);
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  // Charger la liste des utilisateurs pour les mentions
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const usersData = await response.json();
          setUsers(
            usersData.map((user: any) => ({
              id: user.id,
              name: user.name,
              image: user.image, // Correction: imae -> image
            })),
          );
        }
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs:", error);
        toast.error("Erreur lors du chargement des utilisateurs");
      }
    };

    fetchUsers();
  }, []);

  // Mettre à jour les utilisateurs mentionnés en temps réel
  useEffect(() => {
    const mentioned = getMentionedUserIds(content, users);
    setMentionedUsers(mentioned);
  }, [content, users]);

  const onSubmit = async (values: FormValues) => {
    try {
      startTransition(async () => {
        const result = await createAnswer({
          content: values.content,
          questionId,
          mentionedUserIds: mentionedUsers, // Correction: mentionedUses -> mentionedUsers
        });

        if (result.error) {
          toast.error(result.error);
        } else if (result.success) {
          toast.success(result.success);
          form.reset();
          setContent("");
          setMentionedUsers([]);
        }
      });
    } catch (error) {
      toast.error("Une erreur inattendue s'est produite");
      console.error("Erreur lors de la création de la réponse:", error);
    }
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    form.setValue("content", value, { shouldValidate: true });
  };

  const isFormValid = content.trim().length >= 10;

  return (
    <div className="space-y-6">
      {/* En-tête moderne */}
      <div className="flex items-center gap-3 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border border-purple-200 dark:border-purple-700">
        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <Send className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Ajouter une réponse
          </h3>
          <p className="text-sm text-muted-foreground">
            Partagez vos connaissances et aidez la communauté
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <MentionInput
            value={content}
            onChange={handleContentChange}
            placeholder="✍️ Écrivez votre réponse ici...

💡 Conseils :
• Soyez précis et détaillé
• Utilisez @nom pour mentionner quelqu'un
• Ajoutez des exemples si possible"
            users={users}
            className="min-h-[150px] resize-none text-base"
          />

          {/* Indicateur de caractères */}
          <div className="flex items-center justify-between text-xs">
            <div
              className={`${
                content.length < 10
                  ? "text-red-500"
                  : content.length < 50
                    ? "text-yellow-500"
                    : "text-green-500"
              }`}
            >
              {content.length} caractères{" "}
              {content.length < 10 && `(minimum 10)`}
            </div>

            {mentionedUsers.length > 0 && (
              <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                <Users className="h-3 w-3" />
                <span>
                  {mentionedUsers.length} mention
                  {mentionedUsers.length > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {/* Erreurs de validation */}
          {form.formState.errors.content && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {form.formState.errors.content.message}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">💡 Astuce :</span> Utilisez @ pour
            mentionner un utilisateur
          </div>

          <Button
            type="submit"
            disabled={isPending || !isFormValid}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Publication...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Publier la réponse
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
