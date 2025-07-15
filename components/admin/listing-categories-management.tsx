"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Hash,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

// Icônes disponibles
const AVAILABLE_ICONS = [
  "Smartphone",
  "Laptop",
  "Tablet",
  "Gamepad2",
  "Headphones",
  "Camera",
  "Shirt",
  "Watch",
  "Sparkles",
  "Trophy",
  "Dumbbell",
  "Bike",
  "Book",
  "Music",
  "Home",
  "Palette",
  "Zap",
  "TreePine",
  "Wrench",
  "Car",
  "Users",
  "GraduationCap",
  "Calendar",
  "MoreHorizontal",
  "Heart",
  "Gem",
  "Search",
  "Settings",
  "Folder",
  "Tag",
  "Package",
  "ShoppingBag",
  "Gift",
];

// Couleurs disponibles
const AVAILABLE_COLORS = [
  "#3B82F6",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6B7280",
  "#14B8A6",
  "#F43F5E",
  "#8B5A2B",
  "#7C3AED",
  "#DC2626",
];

interface ListingCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  slug: string;
  isActive: boolean;
  parentId: string | null;
  order: number;
  createdAt: Date;
  subcategories?: ListingCategory[];
  _count: {
    listings: number;
    subcategories: number;
  };
}

interface Props {
  categories: ListingCategory[];
  onUpdate: () => void;
}

export function ListingCategoriesManagement({ categories, onUpdate }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<ListingCategory | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "Folder",
    color: "#3B82F6",
    parentId: "",
    isActive: true,
  });

  const handleOpenDialog = (category?: ListingCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        icon: category.icon,
        color: category.color,
        parentId: category.parentId || "",
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        icon: "Folder",
        color: "#3B82F6",
        parentId: "",
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Le nom de la catégorie est requis");
      return;
    }

    startTransition(async () => {
      try {
        const url = editingCategory
          ? `/api/admin/listing-categories/${editingCategory.id}`
          : "/api/admin/listing-categories";

        const method = editingCategory ? "PATCH" : "POST";

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast.success(
            editingCategory
              ? "Catégorie modifiée avec succès"
              : "Catégorie créée avec succès",
          );
          setIsDialogOpen(false);
          onUpdate();
        } else {
          const error = await response.text();
          toast.error(error || "Une erreur est survenue");
        }
      } catch (error) {
        toast.error("Erreur lors de la sauvegarde");
      }
    });
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/listing-categories/${categoryId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        toast.success("Catégorie supprimée avec succès");
        onUpdate();
      } else {
        const error = await response.text();
        toast.error(error || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategory = (category: ListingCategory, level = 0) => {
    const hasSubcategories =
      category.subcategories && category.subcategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const IconComponent = level === 0 ? FolderOpen : Hash;

    return (
      <motion.div
        key={category.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${level > 0 ? "ml-6 border-l-2 border-gray-200 pl-4" : ""}`}
      >
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {hasSubcategories && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(category.id)}
                    className="h-8 w-8 p-0"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}

                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: category.color + "20" }}
                >
                  <IconComponent
                    className="h-5 w-5"
                    style={{ color: category.color }}
                  />
                </div>

                <div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    {category.description}
                    <Badge
                      variant={category.isActive ? "default" : "secondary"}
                    >
                      {category.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {category._count.listings} annonce
                  {category._count.listings > 1 ? "s" : ""}
                </Badge>
                {hasSubcategories && (
                  <Badge variant="outline">
                    {category._count.subcategories} sous-catégorie
                    {category._count.subcategories > 1 ? "s" : ""}
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDialog(category)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <AnimatePresence>
          {isExpanded && hasSubcategories && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {category.subcategories!.map((subcategory) =>
                renderCategory(subcategory, level + 1),
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Organiser les catégories par hiérarchie
  const parentCategories = categories
    .filter((cat) => !cat.parentId)
    .sort((a, b) => a.order - b.order)
    .map((parent) => ({
      ...parent,
      subcategories: categories
        .filter((cat) => cat.parentId === parent.id)
        .sort((a, b) => a.order - b.order),
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Gestion des Catégories d'Annonces
          </h2>
          <p className="text-muted-foreground">
            Gérez les catégories et sous-catégories pour organiser les annonces
          </p>
        </div>

        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle catégorie
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Catégories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Catégories Principales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parentCategories.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Sous-catégories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.filter((cat) => cat.parentId).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Catégories Actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.filter((cat) => cat.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des catégories */}
      <div>
        {parentCategories.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune catégorie</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par créer votre première catégorie d'annonces
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une catégorie
              </Button>
            </CardContent>
          </Card>
        ) : (
          parentCategories.map((category) => renderCategory(category))
        )}
      </div>

      {/* Dialog de création/édition */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom de la catégorie</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Technologie"
                />
              </div>

              <div>
                <Label htmlFor="parent">Catégorie parent (optionnel)</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parentId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      Aucune (catégorie principale)
                    </SelectItem>
                    {parentCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
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
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description de la catégorie..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="icon">Icône</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) =>
                    setFormData({ ...formData, icon: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {AVAILABLE_ICONS.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="color">Couleur</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {AVAILABLE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`h-8 w-8 rounded-full border-2 ${
                        formData.color === color
                          ? "border-gray-900"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isPending}
          >
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending
              ? "Sauvegarde..."
              : editingCategory
                ? "Modifier"
                : "Créer"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
