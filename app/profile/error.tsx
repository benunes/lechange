"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home, RefreshCw, Settings, User } from "lucide-react";

interface ProfileErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProfileError({ error, reset }: ProfileErrorProps) {
  useEffect(() => {
    console.error("Profile Error:", error);
  }, [error]);

  const isNotFoundError =
    error.message.includes("404") || error.message.includes("not found");
  const isPermissionError =
    error.message.includes("403") || error.message.includes("Unauthorized");
  const isConnectionError =
    error.message.includes("ECONNREFUSED") || error.message.includes("fetch");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {isNotFoundError
              ? "Profil introuvable"
              : isPermissionError
                ? "Accès non autorisé"
                : isConnectionError
                  ? "Problème de connexion"
                  : "Erreur du profil"}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {isNotFoundError
              ? "Ce profil utilisateur n'existe pas ou a été supprimé."
              : isPermissionError
                ? "Vous n'êtes pas autorisé à voir ce profil."
                : isConnectionError
                  ? "Impossible de charger les informations du profil."
                  : "Une erreur s'est produite lors du chargement du profil."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Détails de l'erreur :
              </p>
              <p className="mt-1 text-xs text-gray-700 dark:text-gray-300 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {!isNotFoundError && !isPermissionError && (
              <Button onClick={reset} className="w-full" variant="default">
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>
            )}

            {isPermissionError && (
              <Button
                onClick={() => (window.location.href = "/login")}
                variant="default"
                className="w-full"
              >
                <Settings className="mr-2 h-4 w-4" />
                Se connecter
              </Button>
            )}

            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
