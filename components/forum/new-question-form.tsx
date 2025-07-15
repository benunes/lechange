"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createQuestion } from "@/lib/actions/forum.actions";
import { getCategories } from "@/lib/actions/categories.actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import {
  BookOpen,
  Code,
  Lightbulb,
  Gamepad2,
  Music,
  Palette,
  Camera,
  Briefcase,
  Heart,
  Zap,
  Star,
  Globe,
  Cpu,
  Smartphone,
  Car,
  Home,
  ShoppingBag,
  Coffee,
} from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  content: z.string().min(1, "Le contenu est requis."),
  tags: z.string().optional(),
  categoryId: z.string().optional(), // Correction: caegoryId -> categoryId
});

type FormValues = z.infer<typeof formSchema>;

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  _count: { questions: number };
}

// Mapping des icônes
const iconMap = {
  BookOpen,
  Code,
  Lightbulb,
  Gamepad2,
  Music,
  Palette,
  Camera,
  Briefcase,
  Heart,
  Zap,
  Star,
  Globe,
  Cpu,
  Smartphone,
  Car,
  Home,
  ShoppingBag,
  Coffee,
};

export function NewQuestionForm() {
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: "",
      categoryId: "", // On définira une catégorie par défaut une fois les catégories chargées
    },
  });

  // Charger les catégories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);

        // Sélectionner automatiquement la première catégorie par défaut
        if (data.length > 0 && !form.watch("categoryId")) {
          form.setValue("categoryId", data[0].id);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des catégories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, [form]);

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || BookOpen;
  };

  const onSubmit = async (values: FormValues) => {
    startTransition(() => {
      createQuestion(values).then((data) => {
        if (data.error) {
          toast.error(data.error);
        }
        if (data.success && data.questionId) {
          toast.success(data.success);
          router.push(`/forum/${data.questionId}`);
        }
      });
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Sélection de catégorie */}
        <div className="space-y-2">
          <Label htmlFor="category">Catégorie</Label>
          <Select
            value={form.watch("categoryId") || "none"}
            onValueChange={(value) =>
              form.setValue("categoryId", value === "none" ? "" : value)
            }
            disabled={isPending || loadingCategories}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisissez une catégorie">
                {form.watch("categoryId") &&
                  (() => {
                    const selectedCategory = categories.find(
                      (c) => c.id === form.watch("categoryId"),
                    );
                    if (selectedCategory) {
                      const IconComponent = getIconComponent(
                        selectedCategory.icon,
                      );
                      return (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded flex items-center justify-center text-white"
                            style={{ backgroundColor: selectedCategory.color }}
                          >
                            <IconComponent className="h-3 w-3" />
                          </div>
                          <span>{selectedCategory.name}</span>
                        </div>
                      );
                    }
                  })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucune catégorie</SelectItem>
              {categories.map((category) => {
                const IconComponent = getIconComponent(category.icon);
                return (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        <IconComponent className="h-3 w-3" />
                      </div>
                      <span>{category.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        ({category._count.questions})
                      </span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {form.formState.errors.categoryId && (
            <p className="text-sm text-destructive">
              {form.formState.errors.categoryId.message}
            </p>
          )}
        </div>

        {/* Titre */}
        <div className="space-y-2">
          <Label htmlFor="title">Titre de la question *</Label>
          <Input
            id="title"
            {...form.register("title")}
            disabled={isPending}
            placeholder="Décrivez votre question en quelques mots..."
            className="text-base"
          />
          {form.formState.errors.title && (
            <p className="text-sm text-red-500">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        {/* Contenu */}
        <div className="space-y-2">
          <Label htmlFor="content">Description détaillée *</Label>
          <Textarea
            id="content"
            {...form.register("content")}
            rows={12}
            disabled={isPending}
            placeholder="Décrivez votre problème en détail. Plus vous donnez d'informations, meilleures seront les réponses..."
            className="text-base resize-none"
          />
          {form.formState.errors.content && (
            <p className="text-sm text-red-500">
              {form.formState.errors.content.message}
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (optionnel)</Label>
          <Input
            id="tags"
            {...form.register("tags")}
            disabled={isPending}
            placeholder="javascript, react, css (séparés par des virgules)"
          />
          <p className="text-xs text-muted-foreground">
            Ajoutez des tags pour aider les autres à trouver votre question
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={
              isPending || !form.watch("title") || !form.watch("content")
            }
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            {isPending ? "Publication..." : "Publier la question"}
          </Button>
        </div>
      </form>
    </div>
  );
}
