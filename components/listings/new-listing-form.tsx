"use client";

import { Button } from "@/components/ui/button";
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
import { UploadButton } from "@/components/uploadthing";
import { createListing } from "@/lib/actions/listings.actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import Image from "next/image";

const formSchema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  description: z.string().min(1, "La description est requise."),
  categoryId: z.string().min(1, "La catégorie est requise."),
  condition: z.string().optional(),
  location: z.string().optional(),
  price: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ListingCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  parentId: string | null;
  subcategories?: ListingCategory[];
}

const CONDITIONS = [
  { value: "neuf", label: "Neuf" },
  { value: "tres-bon", label: "Très bon état" },
  { value: "bon", label: "Bon état" },
  { value: "correct", label: "État correct" },
];

export function NewListingForm() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [categories, setCategories] = useState<ListingCategory[]>([]);
  const [selectedParentCategory, setSelectedParentCategory] =
    useState<string>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      condition: "",
      location: "",
      price: "",
    },
  });

  // Charger les catégories au montage du composant
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/listing-categories");
        if (response.ok) {
          const data = await response.json();

          // Organiser les catégories par hiérarchie
          const parentCategories = data
            .filter((cat: ListingCategory) => !cat.parentId)
            .map((parent: ListingCategory) => ({
              ...parent,
              subcategories: data.filter(
                (cat: ListingCategory) => cat.parentId === parent.id,
              ),
            }));

          setCategories(parentCategories);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des catégories:", error);
        toast.error("Impossible de charger les catégories");
      }
    };

    fetchCategories();
  }, []);

  const onSubmit = async (values: FormValues) => {
    if (imageUrls.length === 0) {
      toast.error("Veuillez ajouter au moins une image");
      return;
    }

    startTransition(() => {
      const listingData = {
        ...values,
        images: imageUrls,
        price: values.price || undefd, // Garder comme string au lieu de convertir en number
      };

      createListing(listingData).then((data) => {
        if (data.error) {
          toast.error(data.error);
        }
        if (data.success) {
          toast.success(data.success);
          router.push("/listings");
        }
      });
    });
  };

  const removeImage = (indexToRemove: number) => {
    setImageUrls((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // Obtenir les sous-catégories de la catégorie parent sélectionnée
  const availableSubcategories = selectedParentCategory
    ? categories.find((cat) => cat.id === selectedParentCategory)
        ?.subcategories || []
    : [];

  // Réinitialiser la sous-catégorie quand on change de catégorie parent
  const handleParentCategoryChange = (parentId: string) => {
    setSelectedParentCategory(parentId);
    form.setValue("categoryId", "");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Titre */}
        <div>
          <Label htmlFor="title" className="text-base font-medium">
            Titre de l'annonce *
          </Label>
          <Input
            id="title"
            {...form.register("title")}
            placeholder="Ex: iPhone 14 Pro en excellent état"
            className="mt-2"
          />
          {form.formState.errors.title && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="text-base font-medium">
            Description *
          </Label>
          <Textarea
            id="description"
            {...form.register("description")}
            placeholder="Décrivez votre article en détail..."
            rows={4}
            className="mt-2"
          />
          {form.formState.errors.description && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>

        {/* Catégories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-base font-medium">
              Catégorie principale *
            </Label>
            <Select
              value={selectedParentCategory}
              onValueChange={handleParentCategoryChange}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choisir une catégorie..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-base font-medium">Sous-catégorie *</Label>
            <Select
              value={form.watch("categoryId")}
              onValueChange={(value) => form.setValue("categoryId", value)}
              disabled={!selectedParentCategory}
            >
              <SelectTrigger className="mt-2">
                <SelectValue
                  placeholder={
                    selectedParentCategory
                      ? "Choisir une sous-catégorie..."
                      : "Sélectionnez d'abord une catégorie"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableSubcategories.map((subcategory) => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.categoryId && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.categoryId.message}
              </p>
            )}
          </div>
        </div>

        {/* État et Prix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-base font-medium">État de l'article</Label>
            <Select
              value={form.watch("condition")}
              onValueChange={(value) => form.setValue("condition", value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Sélectionner l'état..." />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((condition) => (
                  <SelectItem key={condition.value} value={condition.value}>
                    {condition.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="price" className="text-base font-medium">
              Prix (€)
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              {...form.register("price")}
              placeholder="Laisser vide si gratuit"
              className="mt-2"
            />
          </div>
        </div>

        {/* Localisation */}
        <div>
          <Label htmlFor="location" className="text-base font-medium">
            Localisation (optionnelle)
          </Label>
          <Input
            id="location"
            {...form.register("location")}
            placeholder="Ex: Paris 15e, Lyon, Marseille..."
            className="mt-2"
          />
        </div>

        {/* Images */}
        <div>
          <Label className="text-base font-medium">Photos *</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Ajoutez au moins une photo de votre article
          </p>

          {/* Images uploadées */}
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border">
                    <Image
                      src={url}
                      alt={`Image ${index + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  {index === 0 && (
                    <Badge className="absolute bottom-2 left-2 bg-blue-600">
                      Photo principale
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Bouton d'upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <UploadButton
              endpoint="listingImage"
              onClientUploadComplete={(res) => {
                if (res) {
                  const newUrls = res.map((file) => file.url);
                  setImageUrls((prev) => [...prev, ...newUrls]);
                  toast.success("Images uploadées avec succès !");
                }
              }}
              onUploadError={(error) => {
                toast.error("Erreur lors de l'upload : " + error.message);
              }}
              appearance={{
                button: "bg-purple-600 hover:bg-purple-700",
                allowedContent: "text-sm text-muted-foreground",
              }}
            />
          </div>
        </div>

        {/* Bouton de soumission */}
        <div className="flex gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isPending || imageUrls.length === 0}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isPending ? "Publication..." : "Publier l'annonce"}
          </Button>
        </div>
      </form>
    </div>
  );
}
