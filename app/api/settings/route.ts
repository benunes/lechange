import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { settingsService, DEFAULT_SETTINGS } from "@/lib/services/settings-service";

/**
 * Récupérer les paramètres de l'application
 */
export async function GET(request: NextRequest) {
  try {
    const settings = await settingsService.getSettings();

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération des paramètres",
        data: DEFAULT_SETTINGS,
      },
      { status: 500 },
    );
  }
}

/**
 * Mettre à jour les paramètres (admin uniquement)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 },
      );
    }

    // Récupérer le rôle de l'utilisateur depuis la base de données
    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Accès non autorisé - Droits administrateur requis",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { settings: newSettings } = body;

    if (!newSettings) {
      return NextResponse.json(
        { success: false, error: "Paramètres manquants" },
        { status: 400 },
      );
    }

    // Utiliser le service pour mettre à jour les paramètres
    const updatedSettings = await settingsService.updateSettings(
      newSettings,
      session.user.id,
    );

    // Logger l'action admin
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: "UPDATE_SETTINGS",
        details: "Mise à jour des paramètres de l'application",
        targetId: "default",
        targetType: "SETTINGS",
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedSettings,
    });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des paramètres:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la sauvegarde des paramètres" },
      { status: 500 },
    );
  }
}

/**
 * Gérer les requêtes OPTIONS (preflight CORS)
 */
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
  });
}
