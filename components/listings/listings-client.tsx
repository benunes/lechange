"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Grid3X3,
  Heart,
  List,
  Search,
  SlidersHorizontal,
  Sparkles,
  Filter,
} from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number | null;
  condition: string | null;
  location: string | null;
  images: string[];
  createdAt: Date;
  createdBy: {
    id: string;
    name: string | null;
    image: string | null;
  };
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
    parent?: {
      id: string;
      name: string;
      icon: string;
      color: string;
    } | null;
  };
}

interface ListingCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  parentId: string | null;
  parent?: {
    id: string;
    name: string;
  } | null;
  _count: {
    listings: number;
  };
}

interface ListingsClientProps {
  listings: Listing[];
  categories: ListingCategory[];
}

export function ListingsClient({ listings, categories }: ListingsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Filtrage et tri des annonces
  const filteredListings = useMemo(() => {
    let filtered = [...listings];

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(query) ||
          listing.description.toLowerCase().includes(query) ||
          listing.category.name.toLowerCase().includes(query),
      );
    }

    // Filtre par catégorie
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (listing) => listing.category.id === selectedCategory,
      );
    }

    // Filtre par prix
    if (priceFilter !== "all") {
      switch (priceFilter) {
        case "free":
          filtered = filtered.filter(
            (listing) => !listing.price || listing.price === 0,
          );
          break;
        case "under50":
          filtered = filtered.filter(
            (listing) => listing.price && listing.price < 50,
          );
          break;
        case "50to100":
          filtered = filtered.filter(
            (listing) =>
              listing.price && listing.price >= 50 && listing.price <= 100,
          );
          break;
        case "over100":
          filtered = filtered.filter(
            (listing) => listing.price && listing.price > 100,
          );
          break;
      }
    }

    // Tri
    switch (sortBy) {
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        break;
      case "price_low":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price_high":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "alphabetical":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  }, [listings, searchQuery, selectedCategory, priceFilter, sortBy]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceFilter("all");
    setSortBy("newest");
  };

  const activeFiltersCount = [
    searchQuery.trim() ? 1 : 0,
    selectedCategory !== "all" ? 1 : 0,
    priceFilter !== "all" ? 1 : 0,
    sortBy !== "newest" ? 1 : 0,
  ].reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="container mx-auto px-4">
      {/* Barre de filtres */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-white/20 p-6 mb-8 shadow-lg"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une annonce..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-purple-200/50 focus:border-purple-400 transition-all duration-300"
            />
          </div>

          {/* Boutons d'actions */}
          <div className="flex gap-2 items-center">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtres
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="h-5 w-5 p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            <div className="h-6 w-px bg-border mx-2" />

            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filtres avancés */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-border/50"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Catégorie
                  </label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Prix</label>
                  <Select value={priceFilter} onValueChange={setPriceFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les prix</SelectItem>
                      <SelectItem value="free">Gratuit</SelectItem>
                      <SelectItem value="under50">Moins de 50€</SelectItem>
                      <SelectItem value="50to100">50€ - 100€</SelectItem>
                      <SelectItem value="over100">Plus de 100€</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Trier par
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Plus récent</SelectItem>
                      <SelectItem value="oldest">Plus ancien</SelectItem>
                      <SelectItem value="price_low">Prix croissant</SelectItem>
                      <SelectItem value="price_high">
                        Prix décroissant
                      </SelectItem>
                      <SelectItem value="alphabetical">Alphabétique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="w-full"
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Catégories rapides - Affichage des plus populaires uniquement */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge
              variant={selectedCategory === "all" ? "default" : "secondary"}
              className="cursor-pointer hover:bg-purple-100 hover:text-purple-700 transition-colors"
              onClick={() => setSelectedCategory("all")}
            >
              Toutes ({listings.length})
            </Badge>
            {categories
              .map((category) => ({
                ...category,
                count: listings.filter((l) => l.category.id === category.id)
                  .length,
              }))
              .filter((category) => category.count > 0) // Seulement les catégories avec des annonces
              .sort((a, b) => b.count - a.count) // Trier par popularité (plus d'annonces d'abord)
              .slice(0, 13) // Limiter à 7 catégories les plus populaires
              .map((category) => (
                <Badge
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  className="cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name} ({category.count})
                </Badge>
              ))}
            {/* Bouton pour voir toutes les catégories si il y en a plus */}
            {categories.filter((cat) =>
              listings.some((l) => l.category.id === cat.id),
            ).length > 7 && (
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors border-dashed"
                onClick={() => setShowFilters(true)}
              >
                +{" "}
                {categories.filter((cat) =>
                  listings.some((l) => l.category.id === cat.id),
                ).length - 7}{" "}
                autres
              </Badge>
            )}
          </div>
        )}
      </motion.div>

      {/* Résultats */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-muted-foreground">
          {filteredListings.length} annonce
          {filteredListings.length > 1 ? "s" : ""} trouvée
          {filteredListings.length > 1 ? "s" : ""}
          {filteredListings.length !== listings.length &&
            ` sur ${listings.length}`}
        </p>
      </div>

      {/* Grille des annonces */}
      {filteredListings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="h-24 w-24 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Filter className="h-12 w-12 text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Aucune annonce trouvée</h3>
          <p className="text-muted-foreground mb-6">
            Essaie de modifier tes filtres ou lance une nouvelle recherche
          </p>
          <Button variant="outline" onClick={resetFilters}>
            Réinitialiser les filtres
          </Button>
        </motion.div>
      ) : (
        <motion.div
          layout
          className={`grid gap-6 ${
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          <AnimatePresence>
            {filteredListings.map((listing, index) => (
              <motion.div
                key={listing.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm ${
                    viewMode === "list" ? "flex flex-row" : ""
                  }`}
                >
                  <CardHeader
                    className={`p-0 ${viewMode === "list" ? "w-48 flex-shrink-0" : ""}`}
                  >
                    {listing.images.length > 0 ? (
                      <div
                        className={`relative overflow-hidden ${viewMode === "list" ? "h-full w-full rounded-l-lg" : "h-48 w-full rounded-t-lg"}`}
                      >
                        <Image
                          src={listing.images[0]}
                          alt={listing.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-3 right-3">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-full bg-white/80 hover:bg-white/90 backdrop-blur-sm"
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center ${viewMode === "list" ? "h-full w-full rounded-l-lg" : "h-48 w-full rounded-t-lg"}`}
                      >
                        <Sparkles className="h-12 w-12 text-purple-400" />
                      </div>
                    )}
                  </CardHeader>

                  <div
                    className={`flex flex-col ${viewMode === "list" ? "flex-1" : ""}`}
                  >
                    <div className="p-4 pb-2">
                      <CardTitle
                        className={`group-hover:text-purple-600 transition-colors ${viewMode === "list" ? "text-xl" : "text-lg line-clamp-2"}`}
                      >
                        {listing.title}
                      </CardTitle>
                    </div>

                    <CardContent className="px-4 py-2 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="secondary"
                          className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                        >
                          {listing.category.name}
                        </Badge>
                        {listing.price && (
                          <Badge variant="outline" className="font-semibold">
                            {listing.price}€
                          </Badge>
                        )}
                      </div>

                      {listing.description && (
                        <p
                          className={`text-sm text-muted-foreground ${viewMode === "list" ? "line-clamp-3" : "line-clamp-2"}`}
                        >
                          {listing.description}
                        </p>
                      )}
                    </CardContent>

                    <CardFooter className="px-4 py-3 pt-0">
                      <Button
                        asChild
                        variant="outline"
                        className="w-full group-hover:bg-purple-50 group-hover:border-purple-300 transition-colors"
                      >
                        <Link
                          href={`/listings/${listing.id}`}
                          className="flex items-center justify-center gap-2"
                        >
                          Voir l'annonce
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
