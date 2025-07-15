"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryBadge } from "@/components/forum/categories-grid";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  HelpCircle,
  MessageCircle,
  Plus,
  Search,
  TrendingUp,
} from "lucide-react";
import { getUserBadge } from "@/lib/utils/user-badges";
import { TagFilter } from "@/components/forum/tag-filter";
import { CategorySelection } from "@/components/forum/category-selection";

type Question = {
  id: string;
  title: string;
  content: string | null;
  tags: string[];
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    _count: {
      questions: number;
      answers: number;
    };
    answers: {
      upvotes: number;
    }[];
  };
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
    slug: string;
  } | null;
  _count: {
    answers: number;
  };
};

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string | null; // Correction: accepter null comme dans Prisma
  slug: string;
  _count: { questions: number };
};

type ForumStats = {
  questionsCount: number;
  answersCount: number;
};

interface ForumClientPageProps {
  initialQuestions: Question[];
  initialStats: ForumStats;
  categories: Category[];
  selectedCategory?: Category | null;
  showCategorySelection?: boolean;
}

export default function ForumClientPage({
  initialQuestions,
  initialStats,
  categories,
  selectedCategory,
  showCategorySelection = false,
}: ForumClientPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("all");
  const [badgeFilter] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState("all");

  // Extraire tous les tags uniques des questions
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    initialQuestions.forEach((q) => q.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [initialQuestions]);

  // Filtrage et tri des questions amélioré
  const filteredQuestions = useMemo(() => {
    const filtered = initialQuestions.filter((question) => {
      const matchesSearch =
        question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "answered" && question._count.answers > 0) ||
        (filterBy === "unanswered" && question._count.answers === 0);

      // Filtre par badge
      let matchesBadge = true;
      if (badgeFilter !== "all") {
        const totalUpvotes = question.author.answers.reduce(
          (sum, answer) => sum + answer.upvotes,
          0,
        );
        const userBadge = getUserBadge({
          questionsCount: question.author._count.questions,
          answersCount: question.author._count.answers,
          totalUpvotes,
          bestAnswersCount: 0,
        });
        matchesBadge = userBadge.name.toLowerCase() === badgeFilter;
      }

      // Nouveau système de filtre par tags (plusieurs tags possibles)
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => question.tags.includes(tag));

      // Filtre par période
      let matchesTime = true;
      if (timeFilter !== "all") {
        const questionDate = new Date(question.createdAt);
        const now = new Date();
        const daysDiff = Math.floor(
          (now.getTime() - questionDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        switch (timeFilter) {
          case "today":
            matchesTime = daysDiff === 0;
            break;
          case "week":
            matchesTime = daysDiff <= 7;
            break;
          case "month":
            matchesTime = daysDiff <= 30;
            break;
        }
      }

      // Filtre par catégorie
      const matchesCategory =
        !selectedCategory || question.category?.id === selectedCategory.id;

      return (
        matchesSearch &&
        matchesFilter &&
        matchesBadge &&
        matchesTags &&
        matchesTime &&
        matchesCategory
      );
    });

    // Tri
    if (sortBy === "recent") {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (sortBy === "popular") {
      filtered.sort((a, b) => b._count.answers - a._count.answers);
    } else if (sortBy === "oldest") {
      filtered.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }

    return filtered;
  }, [
    initialQuestions,
    searchQuery,
    sortBy,
    filterBy,
    badgeFilter,
    selectedTags,
    timeFilter,
    selectedCategory,
  ]);

  // Si on doit afficher la sélection de catégories, on affiche le composant dédié
  if (showCategorySelection) {
    return <CategorySelection categories={categories} stats={initialStats} />;
  }

  return (
    <div className="min-h-screen py-8">
      {/* Header Section avec catégorie sélectionnée */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 rounded-3xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            {/* Breadcrumb avec catégorie */}
            <div className="flex items-center gap-2 mb-3">
              <Link
                href="/forum"
                className="text-sm text-muted-foreground hover:text-purple-600 transition-colors"
              >
                Forum
              </Link>
              {selectedCategory && (
                <>
                  <span className="text-muted-foreground">/</span>
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={selectedCategory} size="sm" />
                    <span className="text-sm font-medium">
                      {selectedCategory.name}
                    </span>
                  </div>
                </>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                {selectedCategory ? selectedCategory.name : "Forum"}
              </span>
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base max-w-xl">
              {selectedCategory?.description ||
                "Pose tes questions, partage tes connaissances et aide la communauté !"}
            </p>

            {/* Stats pour la catégorie */}
            <div className="flex gap-4 mt-4 justify-center lg:justify-start">
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">
                  {filteredQuestions.length}
                </div>
                <div className="text-xs text-muted-foreground">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-pink-600">
                  {initialStats.answersCount}
                </div>
                <div className="text-xs text-muted-foreground">Réponses</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              className="hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-950/20"
            >
              <Link href="/forum" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Toutes les catégories
              </Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/forum/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Poser une question
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Première ligne : Recherche et filtres principaux */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Recherche */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une question, tag, ou mot-clé..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>

              {/* Filtres principaux */}
              <div className="flex gap-2 flex-wrap">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px] bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Plus récent
                      </div>
                    </SelectItem>
                    <SelectItem value="popular">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Populaire
                      </div>
                    </SelectItem>
                    <SelectItem value="oldest">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Plus ancien
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-[120px] bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="answered">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Répondues
                      </div>
                    </SelectItem>
                    <SelectItem value="unanswered">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        Sans réponse
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-[120px] bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les périodes</SelectItem>
                    <SelectItem value="today">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Aujourd'hui
                      </div>
                    </SelectItem>
                    <SelectItem value="week">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Cette semaine
                      </div>
                    </SelectItem>
                    <SelectItem value="month">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Ce mois-ci
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Deuxième ligne : Système de tags moderne */}
            <div className="border-t pt-4">
              <TagFilter
                availableTags={availableTags}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                questions={initialQuestions}
              />
            </div>
          </div>

          {/* Résultats de recherche */}
          {(searchQuery || selectedTags.length > 0) && (
            <div className="mt-3 text-sm text-muted-foreground border-t pt-3">
              {filteredQuestions.length} résultat
              {filteredQuestions.length !== 1 ? "s" : ""} trouvé
              {filteredQuestions.length !== 1 ? "s" : ""}
              {searchQuery && ` pour "${searchQuery}"`}
              {selectedTags.length > 0 &&
                ` avec les tags: ${selectedTags.map((tag) => `#${tag}`).join(", ")}`}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des questions - Format compact */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <Card className="border-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/10 dark:to-pink-950/10 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <div className="h-16 w-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery
                  ? "Aucun résultat trouvé"
                  : "Aucune question pour le moment"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Essaie avec d'autres mots-clés ou pose ta propre question !"
                  : "Sois le premier à poser une question et lance la discussion !"}
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Link href="/forum/new">Poser une question</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredQuestions.map((question) => {
            // Calcul des stats utilisateur pour le badge
            const totalUpvotes = question.author.answers.reduce(
              (sum, answer) => sum + answer.upvotes,
              0,
            );
            const userBadge = getUserBadge({
              questionsCount: question.author._count.questions,
              answersCount: question.author._count.answers,
              totalUpvotes,
              bestAnswersCount: 0, // À implémenter plus tard avec une requête spécifique
            });

            return (
              <Card
                key={question.id}
                className="transition-all duration-300 border-0 bg-white/90 dark:bg-gray-900/90 shadow-md hover:shadow-2xl hover:scale-[1.02] group cursor-pointer overflow-hidden backdrop-blur-sm relative"
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    {/* Section gauche : Auteur, titre et tags */}
                    <div className="flex-1 min-w-0 pr-4">
                      {/* Header avec auteur et badge */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                            {question.author?.name?.charAt(0)?.toUpperCase() ||
                              "A"}
                          </div>
                          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                            {question.author?.name || "Anonyme"}
                          </span>
                        </div>
                        <Badge
                          className={`${userBadge.color} text-white text-xs px-2 py-1 shadow-sm`}
                          title={userBadge.description}
                        >
                          {userBadge.name}
                        </Badge>
                      </div>

                      {/* Titre de la question */}
                      <Link
                        href={`/forum/${question.id}`}
                        className="block group-hover:underline mb-3"
                      >
                        <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 via-purple-700 to-pink-700 dark:from-gray-100 dark:via-purple-300 dark:to-pink-300 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300 line-clamp-2">
                          {question.title}
                        </h3>
                      </Link>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {question.tags.map((tag) => (
                          <Badge
                            key={tag}
                            className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-200 border border-purple-200 dark:border-purple-700 text-xs px-3 py-1 hover:scale-105 transition-transform duration-200"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Section droite : Stats et date */}
                    <div className="flex flex-col items-end gap-3 min-w-[120px]">
                      {/* Nombre de réponses */}
                      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-3 py-2 rounded-full border border-blue-200/50 dark:border-blue-700/50">
                        <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                          {question._count.answers}
                        </span>
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          {question._count.answers > 1 ? "réponses" : "réponse"}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        <time className="font-medium">
                          {new Date(question.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            },
                          )}
                        </time>
                      </div>

                      {/* Indicateur de catégorie si disponible */}
                      {question.category && (
                        <div className="mt-1">
                          <CategoryBadge
                            category={question.category}
                            size="sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Barre de progression hover */}
                  <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
