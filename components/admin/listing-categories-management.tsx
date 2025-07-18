"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Edit2, Eye, EyeOff, FolderOpen, Package, Plus } from "lucide-react";

interface ListingCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  slug: string;
  isActive: boolean;
  order: number;
  parentId: string | null;
  subcategories?: ListingCategory[];
  _count: {
    listings: number;
  };
}

interface ListingCategoriesManagementProps {
  categories: ListingCategory[];
}

const ICON_OPTIONS = [
  "📱",
  "💻",
  "🎮",
  "🎧",
  "📺",
  "📷",
  "🔌",
  "⌚",
  "👗",
  "👔",
  "👠",
  "👜",
  "💍",
  "💄",
  "🌸",
  "👓",
  "⚽",
  "🏋️",
  "🚴",
  "🏄",
  "🥾",
  "🎲",
  "🎸",
  "📚",
  "🏠",
  "🪑",
  "🖼️",
  "🔨",
  "🌱",
  "🍳",
  "🛁",
  "🛏️",
  "🚗",
  "🏍️",
  "🛴",
  "🔧",
  "🚘",
  "⛽",
  "🛞",
  "🔋",
  "📖",
  "👨‍🏫",
  "✏️",
  "🎓",
  "🗣️",
  "🌍",
  "💡",
  "🔬",
];

const COLOR_OPTIONS = [
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
];

export function ListingCategoriesManagement({
  categories: initialCategories,
}: ListingCategoriesManagementProps) {
  const [categories] = useState(initialCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<ListingCategory | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Séparer les catégories principales et sous-catégories
  const parentCategories = categories.filter((cat) => !cat.parentId);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "📱",
    color: "#3B82F6",
    parentId: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "📱",
      color: "#3B82F6",
      parentId: "",
    });
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const method = editingCategory ? "PUT" : "POST";
        const url = editingCategory
          ? `/api/admin/listing-categories/${editingCategory.id}`
          : "/api/admin/listing-categories";

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            parentId: formData.parentId || null,
          }),
        });

        if (response.ok) {
          toast.success(
            editingCategory ? "Catégorie modifiée !" : "Catégorie créée",
          );
          setIsDialogOpen(false);
          resetForm();
          router.refresh();
        } else {
          const error = await response.json();
          toast.error(error.message || "Une erreur s'est produite");
        }
      } catch (error) {
        toast.error("Erreur lors de la sauvegarde");
      }
    });
  };

  const handleEdit = (category: ListingCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon,
      color: category.color,
      parentId: category.parentId || "",
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (category: ListingCategory) => {
    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/admin/listing-categories/${category.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !category.isActive }),
          },
        );
        if (response.ok) {
          toast.success(
            `Catégorie ${category.isActive ? "désactivée" : "activée"} !`,
          );
          router.refresh();
        } else {
          toast.error("Erreur lors de la modification");
        }
      } catch (error) {
        toast.error("Erreur lors de la modification");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header avec bouton d'ajout */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Catégories d'Annonces</h2>
          <p className="text-muted-foreground">
            {parentCategories.length} catégories principales
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetForm}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Catégorie
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCategory
                  ? "Modifier la catégorie"
                  : "Nouvelle catégorie"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Ex: Électronique"
                    required
                  />
                </div>

                <div>
                  <Label>Catégorie parent</Label>
                  <Select
                    value={formData.parentId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        parentId: value === "none" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Catégorie principale" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Catégorie principale</SelectItem>
                      {parentCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <span style={{ color: cat.color }}>{cat.icon}</span>
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Description de la catégorie..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Icône</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, icon: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {ICON_OPTIONS.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          <span className="text-xl">{icon}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Couleur</Label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, color: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_OPTIONS.map((color) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            {color}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isPending
                    ? "Sauvegarde..."
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
      <div className="grid gap-6">
        {parentCategories.map((category) => (
          <Card
            key={category.id}
            className="border-l-4"
            style={{ borderLeftColor: category.color }}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" style={{ color: category.color }}>
                    {category.icon}
                  </span>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {category.name}
                      <Badge
                        variant={category.isActive ? "default" : "secondary"}
                      >
                        {category.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Package className="h-3 w-3" />
                    {category._count.listings}
                  </Badge>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(category)}
                  >
                    {category.isActive ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {category.subcategories && category.subcategories.length > 0 && (
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {category.subcategories.map((subcat) => (
                    <div
                      key={subcat.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span style={{ color: subcat.color }}>
                          {subcat.icon}
                        </span>
                        <span className="text-sm font-medium">
                          {subcat.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {subcat._count.listings}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(subcat)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {parentCategories.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune catégorie</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par créer votre première catégorie d'annonces
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une catégorie
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
