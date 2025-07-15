"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  MessageCircle,
  Monitor,
  BookOpen,
  Heart,
  Gamepad2,
  MapPin,
  HelpCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Code,
  Lightbulb,
  Music,
  Palette,
  Camera,
  Briefcase,
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

// Map des icônes pour les catégories - synchronisé avec le composant admin
const iconMap = {
  MessageCircle,
  Monitor,
  BookOpen,
  Heart,
  Gamepad2,
  MapPin,
  HelpCircle,
  Code,
  Lightbulb,
  Music,
  Palette,
  Camera,
  Briefcase,
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

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  slug: string;
  description?: string | null; // Correction: accepter null aussi
  _count: { questions: number };
}

interface CategorySelectionProps {
  categories: Category[];
  stats: {
    questionsCount: number;
    answersCount: number;
  };
}

export function CategorySelection({
  categories,
  stats,
}: CategorySelectionProps) {
  return (
    <div className="min-h-screen py-8">
      {/* Header Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 rounded-3xl p-8 mb-8 text-center overflow-hidden relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-purple-500 animate-spin" />
            <span className="text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Forum communautaire
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Explore le Forum
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Choisis une catégorie pour découvrir des discussions passionnantes
            et partager tes connaissances ! 🚀
          </p>

          {/* Stats animées */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center group">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-1 group-hover:scale-110 transition-transform duration-300">
                {stats.questionsCount}
              </div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl md:text-4xl font-bold text-pink-600 mb-1 group-hover:scale-110 transition-transform duration-300">
                {stats.answersCount}
              </div>
              <div className="text-sm text-muted-foreground">Réponses</div>
            </div>
          </div>

          <Button
            asChild
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Link href="/forum/new" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Poser une question
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Titre de sélection */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Choisis ta catégorie
          </span>
        </h2>
        <p className="text-muted-foreground">
          Sélectionne un domaine qui t'intéresse pour commencer ton exploration
        </p>
      </div>

      {/* Grille des catégories avec animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => {
          const IconComponent =
            iconMap[category.icon as keyof typeof iconMap] || HelpCircle;

          return (
            <Link
              key={category.id}
              href={`/forum?category=${category.slug}`}
              className="block"
            >
              <Card className="h-full transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm group overflow-hidden relative">
                {/* Effet de brillance au hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                <CardContent className="p-6 text-center relative z-10">
                  {/* Grande icône avec animation */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-xl group-hover:shadow-2xl relative overflow-hidden"
                    style={{
                      backgroundColor: category.color,
                      boxShadow: `0 8px 32px ${category.color}40`,
                    }}
                  >
                    {/* Effet de particules brillantes */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full animate-ping"></div>
                      <div className="absolute top-3 right-2 w-0.5 h-0.5 bg-white rounded-full animate-ping delay-300"></div>
                      <div className="absolute bottom-2 left-3 w-0.5 h-0.5 bg-white rounded-full animate-ping delay-700"></div>
                    </div>

                    <IconComponent className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300 relative z-10" />

                    {/* Effet de pulsation */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(circle, ${category.color} 0%, transparent 70%)`,
                        animation: `pulse 1s infinite ${index * 0.2}s`,
                      }}
                    ></div>
                  </div>

                  {/* Nom de la catégorie */}
                  <h3 className="text-xl font-bold mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300">
                    {category.name}
                  </h3>

                  {/* Description */}
                  {category.description && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  {/* Badge avec nombre de questions */}
                  <div className="flex items-center justify-center gap-2">
                    <Badge
                      className="transition-all duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: `${category.color}15`,
                        borderColor: `${category.color}30`,
                        color: category.color,
                      }}
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {category._count.questions} question
                      {category._count.questions !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  {/* Flèche d'action */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="h-5 w-5 mx-auto text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Section d'encouragement */}
      <div className="mt-12 text-center">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Pas encore trouvé ta catégorie ?
            </span>
          </h3>
          <p className="text-muted-foreground mb-6">
            Commence par "Général" ou pose directement ta question !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              variant="outline"
              className="hover:scale-105 transition-transform duration-300"
            >
              <Link href="/forum?category=general">
                <MessageCircle className="h-4 w-4 mr-2" />
                Voir Général
              </Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white hover:scale-105 transition-transform duration-300"
            >
              <Link href="/forum/new">
                <Sparkles className="h-4 w-4 mr-2" />
                Poser ma question
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
