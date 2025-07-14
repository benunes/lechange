"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
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
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  createdBy: {
    name: string | null;
    email: string | null;
  };
  _count: {
    questions: number;
  };
}

interface CategoriesManagementProps {
  categories: Category[];
  onUpdate: () => void;
}

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est obligatoire")
    .max(50, "Le nom est trop long"),
  description: z.string().optional(),
  icon: z.string().min(1, "L'icône est obligatoire"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Couleur hexadécimale invalide"),
  slug: z
    .string()
    .min(1, "Le slug est obligatoire")
    .regex(
      /^[a-z0-9-]+$/,
      "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets",
    ),
});

type FormValues = z.infer<typeof formSchema>;

// Icônes disponibles avec leurs noms
const availableIcons = [
  { name: "BookOpen", icon: BookOpen, label: "Livre" },
  { name: "Code", icon: Code, label: "Code" },
  { name: "Lightbulb", icon: Lightbulb, label: "Idée" },
  { name: "Gamepad2", icon: Gamepad2, label: "Jeux" },
  { name: "Music", icon: Music, label: "Musique" },
  { name: "Palette", icon: Palette, label: "Art" },
  { name: "Camera", icon: Camera, label: "Photo" },
  { name: "Briefcase", icon: Briefcase, label: "Business" },
  { name: "Heart", icon: Heart, label: "Santé" },
  { name: "Zap", icon: Zap, label: "Énergie" },
  { name: "Star", icon: Star, label: "Étoile" },
  { name: "Globe", icon: Globe, label: "Monde" },
  { name: "Cpu", icon: Cpu, label: "Tech" },
  { name: "Smartphone", icon: Smartphone, label: "Mobile" },
  { name: "Car", icon: Car, label: "Auto" },
  { name: "Home", icon: Home, label: "Maison" },
  { name: "ShoppingBag", icon: ShoppingBag, label: "Shopping" },
  { name: "Coffee", icon: Coffee, label: "Café" },
];

// Couleurs prédéfinies
const predefinedColors = [
  "#8B5CF6",
  "#EC4899",
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#6366F1",
  "#8B5A2B",
  "#059669",
  "#DC2626",
];

export function CategoriesManagement({
  categories,
  onUpdate,
}: CategoriesManagementProps) {
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "BookOpen",
      color: "#8B5CF6",
      slug: "",
    },
  });

  const getIconComponent = (iconName: string) => {
    const iconData = availableIcons.find((i) => i.name === iconName);
    return iconData ? iconData.icon : BookOpen;
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleSubmit = async (values: FormValues) => {
    startTransition(async () => {
      try {
        if (editingCategory) {
          // Mode édition
          const { updateCategory } = await import(
            "@/lib/actions/categories.actions"
          );
          const result = await updateCategory(editingCategory.id, values);

          if (result.error) {
            toast.error(result.error);
          } else {
            toast.success(result.success || "Catégorie modifiée avec succès");
            setIsDialogOpen(false);
            setEditingCategory(null);
            form.reset();
            onUpdate();
          }
        } else {
          // Mode création
          const { createCategory } = await import(
            "@/lib/actions/categories.actions"
          );
          const result = await createCategory(values);

          if (result.error) {
            toast.error(result.error);
          } else {
            toast.success(result.success || "Catégorie créée avec succès");
            setIsDialogOpen(false);
            setEditingCategory(null);
            form.reset();
            onUpdate();
          }
        }
      } catch (error) {
        console.error("Erreur lors de la soumission:", error);
        toast.error("Une erreur inattendue s'est produite");
      }
    });
  };

  const handleToggleStatus = async (id: string) => {
    startTransition(async () => {
      try {
        const { toggleCategoryStatus } = await import(
          "@/lib/actions/categories.actions"
        );
        const result = await toggleCategoryStatus(id);

        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(result.success);
          onUpdate();
        }
      } catch (error) {
        toast.error("Une erreur inattendue s'est produite");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      return;
    }

    startTransition(async () => {
      try {
        const { deleteCategory } = await import(
          "@/lib/actions/categories.actions"
        );
        const result = await deleteCategory(id);

        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(result.success);
          onUpdate();
        }
      } catch (error) {
        toast.error("Une erreur inattendue s'est produite");
      }
    });
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      description: category.description || "",
      icon: category.icon,
      color: category.color,
      slug: category.slug,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingCategory(null);
    form.reset();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton de création */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Gestion des catégories
          </h2>
          <p className="text-muted-foreground mt-1">
            Organisez les questions par catégories pour une meilleure navigation
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openCreateDialog}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle catégorie
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCategory
                  ? "Modifier la catégorie"
                  : "Créer une nouvelle catégorie"}
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="ex: Programmation"
                    onChange={(e) => {
                      form.setValue("name", e.target.value);
                      if (!editingCategory) {
                        form.setValue("slug", generateSlug(e.target.value));
                      }
                    }}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    {...form.register("slug")}
                    placeholder="programmation"
                  />
                  {form.formState.errors.slug && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.slug.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Description de la catégorie..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icône *</Label>
                  <Select
                    value={form.watch("icon")}
                    onValueChange={(value) => form.setValue("icon", value)}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const IconComponent = getIconComponent(
                              form.watch("icon"),
                            );
                            return <IconComponent className="h-4 w-4" />;
                          })()}
                          <span>
                            {
                              availableIcons.find(
                                (i) => i.name === form.watch("icon"),
                              )?.label
                            }
                          </span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {availableIcons.map((iconData) => {
                        const IconComponent = iconData.icon;
                        return (
                          <SelectItem key={iconData.name} value={iconData.name}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" />
                              <span>{iconData.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.icon && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.icon.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Couleur *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      {...form.register("color")}
                      className="w-20 h-10 p-1 rounded"
                    />
                    <div className="flex flex-wrap gap-1 flex-1">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                          style={{ backgroundColor: color }}
                          onClick={() => form.setValue("color", color)}
                        />
                      ))}
                    </div>
                  </div>
                  {form.formState.errors.color && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.color.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Prévisualisation */}
              <div className="p-4 border rounded-lg bg-muted/30">
                <Label className="text-sm font-medium mb-2 block">
                  Prévisualisation
                </Label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: form.watch("color") }}
                  >
                    {(() => {
                      const IconComponent = getIconComponent(
                        form.watch("icon"),
                      );
                      return <IconComponent className="h-5 w-5" />;
                    })()}
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {form.watch("name") || "Nom de la catégorie"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {form.watch("description") ||
                        "Description de la catégorie"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isPending}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {isPending
                    ? "Enregistrement..."
                    : editingCategory
                      ? "Modifier"
                      : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des catégories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const IconComponent = getIconComponent(category.icon);

          return (
            <Card key={category.id} className="card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
                      style={{ backgroundColor: category.color }}
                    >
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={category.isActive ? "default" : "secondary"}
                        >
                          {category.isActive ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Actif
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Inactif
                            </>
                          )}
                        </Badge>
                        <Badge variant="outline">
                          {category._count.questions} question
                          {category._count.questions !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {category.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {category.description}
                  </p>
                )}

                <div className="text-xs text-muted-foreground mb-4">
                  <p>
                    Créé par{" "}
                    {category.createdBy.name || category.createdBy.email}
                  </p>
                  <p>Slug: {category.slug}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(category)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Modifier
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleStatus(category.id)}
                    disabled={isPending}
                  >
                    {category.isActive ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>

                  {category._count.questions === 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(category.id)}
                      disabled={isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {categories.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Aucune catégorie</h3>
            <p className="text-muted-foreground mb-4">
              Créez votre première catégorie pour organiser les questions du
              forum.
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une catégorie
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
