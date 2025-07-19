import { NextRequest, NextResponse } from "next/server";
import { settingsService } from "@/lib/services/settings-service";

/**
 * Middleware pour vérifier le mode maintenance
 */
export async function withMaintenanceCheck(request: NextRequest) {
  const isMaintenanceMode = await settingsService.isMaintenanceMode();

  if (isMaintenanceMode) {
    // Permettre l'accès aux admins et aux routes d'administration
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') ||
                        request.nextUrl.pathname.startsWith('/api/admin');

    if (!isAdminRoute) {
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }
  }

  return NextResponse.next();
}

/**
 * Middleware pour vérifier les limites d'upload
 */
export function withUploadLimits(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      const uploadLimits = await settingsService.getUploadLimits();

      // Ajouter les limites au contexte de la requête
      (request as any).uploadLimits = uploadLimits;

      return await handler(request, ...args);
    } catch (error) {
      console.error("Erreur lors de la vérification des limites d'upload:", error);
      return NextResponse.json(
        { error: "Erreur de configuration" },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware pour vérifier les limites du forum
 */
export function withForumLimits(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      const forumLimits = await settingsService.getForumLimits();

      // Ajouter les limites au contexte de la requête
      (request as any).forumLimits = forumLimits;

      return await handler(request, ...args);
    } catch (error) {
      console.error("Erreur lors de la vérification des limites du forum:", error);
      return NextResponse.json(
        { error: "Erreur de configuration" },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware pour la modération automatique
 */
export function withAutoModeration(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      const isAutoModerationEnabled = await settingsService.isAutoModerationEnabled();
      const bannedWords = await settingsService.getBannedWords();

      // Ajouter les paramètres de modération au contexte
      (request as any).moderation = {
        enabled: isAutoModerationEnabled,
        bannedWords,
      };

      return await handler(request, ...args);
    } catch (error) {
      console.error("Erreur lors de la vérification de la modération:", error);
      return NextResponse.json(
        { error: "Erreur de configuration" },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware pour valider le contenu contre les mots interdits
 */
export async function validateContent(content: string): Promise<{ isValid: boolean; blockedWords: string[] }> {
  try {
    const bannedWords = await settingsService.getBannedWords();
    const blockedWords: string[] = [];

    const contentLower = content.toLowerCase();

    for (const word of bannedWords) {
      if (contentLower.includes(word.toLowerCase())) {
        blockedWords.push(word);
      }
    }

    return {
      isValid: blockedWords.length === 0,
      blockedWords,
    };
  } catch (error) {
    console.error("Erreur lors de la validation du contenu:", error);
    return { isValid: true, blockedWords: [] };
  }
}

/**
 * Middleware pour vérifier les limites quotidiennes
 */
export async function checkDailyLimit(
  userId: string,
  action: 'question' | 'listing' | 'message',
  customLimit?: number
): Promise<{ allowed: boolean; currentCount: number; limit: number }> {
  try {
    const settings = await settingsService.getSettings();

    let limit: number;
    switch (action) {
      case 'question':
        limit = customLimit ?? settings.forum.maxQuestionsPerDay;
        break;
      case 'listing':
        limit = customLimit ?? 10; // Valeur par défaut, à configurer si nécessaire
        break;
      case 'message':
        limit = customLimit ?? 100; // Valeur par défaut, à configurer si nécessaire
        break;
      default:
        return { allowed: true, currentCount: 0, limit: 0 };
    }

    // Calculer le début de la journée
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Compter les actions aujourd'hui (implémentation basique, à améliorer avec Redis)
    let currentCount = 0;

    switch (action) {
      case 'question':
        const { PrismaClient } = await import('@/lib/generated/prisma');
        const prisma = new PrismaClient();
        currentCount = await prisma.question.count({
          where: {
            authorId: userId,
            createdAt: {
              gte: startOfDay,
            },
          },
        });
        await prisma.$disconnect();
        break;
      // Ajouter d'autres cas selon les besoins
    }

    return {
      allowed: currentCount < limit,
      currentCount,
      limit,
    };
  } catch (error) {
    console.error("Erreur lors de la vérification des limites quotidiennes:", error);
    return { allowed: true, currentCount: 0, limit: 0 };
  }
}

/**
 * Middleware pour valider les prix selon les paramètres
 */
export async function validatePrice(price: number): Promise<{ isValid: boolean; maxPrice: number }> {
  try {
    const settings = await settingsService.getSettings();
    // Utilisation d'une valeur par défaut raisonnable puisqu'il n'y a plus de maxPrice dans les paramètres
    // On peut utiliser featuredListingPrice * 1000 comme limite haute ou une valeur fixe
    const maxPrice = 50000; // Valeur par défaut de 50,000€

    return {
      isValid: price <= maxPrice && price >= 0,
      maxPrice,
    };
  } catch (error) {
    console.error("Erreur lors de la validation du prix:", error);
    return { isValid: true, maxPrice: 50000 };
  }
}

/**
 * Fonction utilitaire pour combiner plusieurs middlewares
 */
export function combineMiddlewares(...middlewares: Function[]) {
  return (handler: Function) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}
