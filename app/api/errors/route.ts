import { NextRequest, NextResponse } from "next/server";
import {
  apiErrors,
  validateApiParams,
  withErrorHandler,
} from "@/lib/api-error-handler";

interface ErrorLogData {
  type: string;
  message: string;
  details?: string;
  context?: string;
  userAgent?: string;
  url?: string;
}

export const POST = withErrorHandler(async (req: NextRequest) => {
  try {
    const body = await req.json();

    // Valider les données
    const errorData = validateApiParams<ErrorLogData>(
      body,
      {
        type: (value) =>
          typeof value === "string" &&
          [
            "network",
            "permission",
            "validation",
            "server",
            "client",
            "unknown",
          ].includes(value),
        message: (value) => typeof value === "string" && value.length > 0,
        details: (value) => !value || typeof value === "string",
        context: (value) => !value || typeof value === "string",
        userAgent: (value) => !value || typeof value === "string",
        url: (value) => !value || typeof value === "string",
      },
      ["type", "message"],
    );

    // En production, on pourrait stocker les erreurs en base
    if (process.env.NODE_ENV === "production") {
      // Optionnel : stocker les erreurs critiques en base pour analyse
      if (["server", "network"].includes(errorData.type)) {
        try {
          // Note: ErrorLog n'est pas encore dans le schéma Prisma
          // await prisma.errorLog?.create({
          //   data: {
          //     type: errorData.type,
          //     message: errorData.message,
          //     details: errorData.details,
          //     context: errorData.context,
          //     userAgent: req.headers.get('user-agent'),
          //     url: errorData.url || req.url,
          //     timestamp: new Date()
          //   }
          // });
        } catch {
          // Ignorer silencieusement les erreurs de logging
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Erreur enregistrée",
    });
  } catch (error) {
    throw apiErrors.server("Impossible d'enregistrer l'erreur");
  }
});

export const GET = withErrorHandler(async (req: NextRequest) => {
  // Endpoint pour récupérer les statistiques d'erreurs (admin seulement)
  throw apiErrors.notFound("Endpoint non disponible");
});
