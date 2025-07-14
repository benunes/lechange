"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, Search, Hash } from "lucide-react";
import { useState, useMemo } from "react";

interface TagFilterProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  questions: any[];
}

export function TagFilter({
  availableTags,
  selectedTags,
  onTagsChange,
  questions,
}: TagFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);

  // Calculer la popularité des tags
  const tagStats = useMemo(() => {
    const stats = new Map<string, number>();
    questions.forEach((question) => {
      question.tags.forEach((tag: string) => {
        stats.set(tag, (stats.get(tag) || 0) + 1);
      });
    });
    return stats;
  }, [questions]);

  // Tags populaires (top 10)
  const popularTags = useMemo(() => {
    return Array.from(tagStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  }, [tagStats]);

  // Tags filtrés par recherche
  const filteredTags = useMemo(() => {
    if (!searchQuery) return showAllTags ? availableTags : popularTags;

    return availableTags
      .filter((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 20); // Limiter à 20 résultats
  }, [availableTags, popularTags, searchQuery, showAllTags]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    onTagsChange(selectedTags.filter((t) => t !== tag));
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Tags sélectionnés */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-muted-foreground">
            Filtré par :
          </span>
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/50 cursor-pointer transition-colors"
              onClick={() => removeTag(tag)}
            >
              #{tag}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          <button
            onClick={clearAllTags}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Tout effacer
          </button>
        </div>
      )}

      {/* Recherche de tags */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Section des tags */}
      <div className="space-y-3">
        {!searchQuery && !showAllTags && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Hash className="h-4 w-4" />
            <span>Tags populaires</span>
          </div>
        )}

        {/* Liste des tags */}
        <div className="flex flex-wrap gap-2">
          {filteredTags.map((tag) => {
            const count = tagStats.get(tag) || 0;
            const isSelected = selectedTags.includes(tag);

            return (
              <Badge
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                  isSelected
                    ? "bg-purple-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                }`}
              >
                #{tag}
                <span className="ml-1 text-xs opacity-75">({count})</span>
              </Badge>
            );
          })}
        </div>

        {/* Bouton pour voir tous les tags */}
        {!searchQuery && !showAllTags && availableTags.length > 10 && (
          <button
            onClick={() => setShowAllTags(true)}
            className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
          >
            Voir tous les tags ({availableTags.length})
          </button>
        )}

        {!searchQuery && showAllTags && (
          <button
            onClick={() => setShowAllTags(false)}
            className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            Voir moins
          </button>
        )}
      </div>

      {/* Aucun résultat */}
      {searchQuery && filteredTags.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucun tag trouvé pour "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
