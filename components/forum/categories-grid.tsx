"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CategoryBadge } from "./category-badge";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  slug: string;
  description?: string;
  _count?: { questions: number };
}

interface CategoriesGridProps {
  categories: Category[];
  className?: string;
}

export function CategoriesGrid({
  categories,
  className = "",
}: CategoriesGridProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
    >
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/forum?category=${category.slug}`}
          className="block"
        >
          <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer border-0 bg-white/80 dark:bg-gray-900/70">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${category.color}15` }}
                >
                  <CategoryBadge category={category} size="md" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  {category._count && (
                    <div className="text-xs text-muted-foreground">
                      {category._count.questions} question
                      {category._count.questions !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export { CategoryBadge };
