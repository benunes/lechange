import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withRoleCheck } from "@/lib/middleware/role-middleware";
import { z } from "zod";

const settingsSchema = z.object({
  general: z.object({
    appName: z.string().min(1),
    appDescription: z.string(),
    appLogo: z.string(),
    contactEmail: z.string().email(),
    maintenanceMode: z.boolean(),
  }),
  moderation: z.object({
    autoModeration: z.boolean(),
    bannedWords: z.array(z.string()),
    maxReportsBeforeSuspension: z.number().min(1).max(20),
    requireApprovalForNewUsers: z.boolean(),
  }),
  notifications: z.object({
    emailNotifications: z.boolean(),
    pushNotifications: z.boolean(),
    dailyDigest: z.boolean(),
    weeklyReport: z.boolean(),
  }),
  upload: z.object({
    maxImageSize: z.number().min(1).max(50),
    allowedFormats: z.array(z.string()),
    maxImagesPerListing: z.number().min(1).max(20),
    imageQuality: z.number().min(10).max(100),
  }),
  security: z.object({
    sessionDuration: z.number().min(1).max(365),
    maxLoginAttempts: z.number().min(1).max(10),
    requireEmailVerification: z.boolean(),
    twoFactorAuth: z.boolean(),
  }),
  forum: z.object({
    maxQuestionsPerDay: z.number().min(1).max(50),
    maxAnswersPerQuestion: z.number().min(1).max(200),
    pointsSystem: z.boolean(),
    allowAnonymousQuestions: z.boolean(),
  }),
  listings: z.object({
    listingDuration: z.number().min(1).max(365),
    maxPrice: z.number().min(1).max(100000),
    requireApproval: z.boolean(),
    autoDeleteExpired: z.boolean(),
  }),
});

async function saveSettings(
  request: NextRequest,
  currentUser: any
) {
  try {
    const body = await request.json();
    const settings = settingsSchema.parse(body);

    // Sauvegarder les paramètres dans la base de données
    // Pour l'instant, on va créer une table settings ou utiliser un système de clé-valeur
    const settingsData = {
      data: JSON.stringify(settings),
      updatedBy: currentUser.id,
      updatedAt: new Date(),
    };

    // Essayer de trouver un enregistrement existant
    const existingSettings = await prisma.appSettings.findFirst();

    if (existingSettings) {
      await prisma.appSettings.update({
        where: { id: existingSettings.id },
        data: settingsData,
      });
    } else {
      await prisma.appSettings.create({
        data: {
          ...settingsData,
          id: 'default',
        },
      });
    }

    // Logger l'action
    await prisma.adminLog.create({
      data: {
        adminId: currentUser.id,
        action: "UPDATE_SETTINGS",
        details: "Mise à jour des paramètres de l'application",
        targetType: "SETTINGS",
        targetId: "default",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Paramètres sauvegardés avec succès"
    });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des paramètres:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde des paramètres" },
      { status: 500 }
    );
  }
}

async function getSettings(
  request: NextRequest,
  currentUser: any
) {
  try {
    const settings = await prisma.appSettings.findFirst();

    if (!settings) {
      // Retourner les paramètres par défaut si aucun n'est trouvé
      return NextResponse.json({
        general: {
          appName: "LeChange",
          appDescription: "Plateforme d'échange pour les jeunes",
          appLogo: "/logo.png",
          contactEmail: "contact@lechange.com",
          maintenanceMode: false,
        },
        moderation: {
          autoModeration: true,
          bannedWords: ["spam", "arnaque", "fake"],
          maxReportsBeforeSuspension: 5,
          requireApprovalForNewUsers: false,
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          dailyDigest: true,
          weeklyReport: true,
        },
        upload: {
          maxImageSize: 5,
          allowedFormats: ["jpg", "jpeg", "png", "webp"],
          maxImagesPerListing: 8,
          imageQuality: 80,
        },
        security: {
          sessionDuration: 30,
          maxLoginAttempts: 5,
          requireEmailVerification: true,
          twoFactorAuth: false,
        },
        forum: {
          maxQuestionsPerDay: 10,
          maxAnswersPerQuestion: 50,
          pointsSystem: true,
          allowAnonymousQuestions: false,
        },
        listings: {
          listingDuration: 90,
          maxPrice: 10000,
          requireApproval: false,
          autoDeleteExpired: true,
        },
      });
    }

    return NextResponse.json(JSON.parse(settings.data));
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des paramètres" },
      { status: 500 }
    );
  }
}

export const POST = withRoleCheck(["ADMIN"], saveSettings);
export const GET = withRoleCheck(["ADMIN"], getSettings);
