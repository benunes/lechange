import { NextRequest, NextResponse } from "next/server";
import { AppError, ErrorLogger } from "@/lib/errors";

// Wrapper pour les API routes avec gestion d'erreur automatique
export function withErrorHandler(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    const logger = ErrorLogger.getInstance();

    try {
      return await handler(req, context);
    } catch (error) {
      const appError =
        error instanceof AppError
          ? error
          : new AppError(
              error instanceof Error
                ? error.message
                : "Une erreur inconnue s'est produite",
              "server",
            );

      // Log l'erreur
      logger.log(appError, `API Route: ${req.url}`);

      // Retourner une réponse d'erreur appropriée
      return NextResponse.json(
        {
          error: true,
          message: appError.message,
          type: appError.type,
          digest: appError.digest,
          ...(process.env.NODE_ENV === "development" && {
            details: appError.details,
            stack: appError.stack,
          }),
        },
        {
          status: getStatusCodeFromError(appError),
        },
      );
    }
  };
}

// Détermine le code de statut HTTP basé sur le type d'erreur
function getStatusCodeFromError(error: AppError): number {
  switch (error.type) {
    case "permission":
      return error.message.includes("Unauthorized") ? 401 : 403;
    case "validation":
      return 400;
    case "client":
      return 404;
    case "network":
      return 503;
    case "server":
      return 500;
    default:
      return 500;
  }
}

// Middleware pour capturer les erreurs non gérées dans les API routes
export async function errorMiddleware(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
): Promise<NextResponse> {
  return withErrorHandler(handler)(req);
}

// Utilitaire pour créer des erreurs standardisées dans les API routes
export const apiErrors = {
  unauthorized: (message = "Non autorisé") =>
    new AppError(message, "permission", 401),
  forbidden: (message = "Accès interdit") =>
    new AppError(message, "permission", 403),
  notFound: (message = "Ressource introuvable") =>
    new AppError(message, "client", 404),
  validation: (message = "Données invalides") =>
    new AppError(message, "validation", 400),
  server: (message = "Erreur serveur interne") =>
    new AppError(message, "server", 500),
  database: (message = "Erreur de base de données") =>
    new AppError(message, "server", 500),
  network: (message = "Erreur de réseau") =>
    new AppError(message, "network", 503),
};

// Helper pour valider les paramètres d'API
export function validateApiParams<T>(
  data: any,
  schema: { [K in keyof T]: (value: any) => boolean },
  requiredFields: (keyof T)[],
): T {
  const errors: string[] = [];

  // Vérifier les champs requis
  for (const field of requiredFields) {
    if (!data[field]) {
      errors.push(`Le champ '${String(field)}' est requis`);
    }
  }

  // Valider les types
  for (const [field, validator] of Object.entries(schema) as [
    string,
    (value: any) => boolean,
  ][]) {
    if (data[field] && !validator(data[field])) {
      errors.push(`Le champ '${field}' a un format invalide`);
    }
  }

  if (errors.length > 0) {
    throw apiErrors.validation(errors.join(", "));
  }

  return data as T;
}
