"use client";

import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Monitor,
  BookOpen,
  Heart,
  Gamepad2,
  MapPin,
  HelpCircle,
} from "lucide-react";

// Map des icônes pour les catégories
const iconMap = {
  MessageCircle,
  Monitor,
  BookOpen,
  Heart,
  Gamepad2,
  MapPin,
  HelpCircle,
};

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  slug: string;
}

interface CategoryBadgeProps {
  category: Category;
  showCount?: boolean;
  count?: number;
  size?: "sm" | "md" | "lg";
}

export function CategoryBadge({
  category,
  showCount = false,
  count,
  size = "sm",
}: CategoryBadgeProps) {
  const IconComponent =
    iconMap[category.icon as keyof typeof iconMap] || HelpCircle;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 h-5",
    md: "text-sm px-3 py-1 h-6",
    lg: "text-base px-4 py-2 h-8",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <Badge
      className={`
                inline-flex items-center gap-1 border
                ${sizeClasses[size]}
                transition-all duration-200 hover:scale-105
            `}
      style={{
        backgroundColor: `${category.color}15`,
        borderColor: `${category.color}30`,
        color: category.color,
      }}
    >
      <IconComponent className={iconSizes[size]} />
      <span className="font-medium">{category.name}</span>
      {showCount && count !== undefined && (
        <span className="ml-1 text-xs opacity-75">({count})</span>
      )}
    </Badge>
  );
}
