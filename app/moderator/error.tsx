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
import { Home, RefreshCw, Settings, ShieldCheck } from "lucide-react";

interface ModeratorErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ModeratorError({ error, reset }: ModeratorErrorProps) {
  useEffect(() => {
    console.error("Moderator Panel Error:", error);
  }, [error]);

  const isPermissionError =
    error.message.includes("403") ||
    error.message.includes("Forbidden") ||
    error.message.includes("Unauthorized");
  const isConnectionError =
    error.message.includes("ECONNREFUSED") || error.message.includes("fetch");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <ShieldCheck className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {isPermissionError
              ? "Accès modérateur requis"
              : isConnectionError
                ? "Problème de connexion"
                : "Erreur de modération"}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {isPermissionError
              ? "Vous devez avoir des privilèges de modérateur pour accéder à cette section."
              : isConnectionError
                ? "Impossible de se connecter au serveur de modération."
                : "Une erreur s'est produite dans le panneau de modération."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Détails de l'erreur :
              </p>
              <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                  ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {!isPermissionError && (
              <Button onClick={reset} className="w-full" variant="default">
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>
            )}

            <Button
              onClick={() => (window.location.href = "/moderator")}
              variant="outline"
              className="w-full"
            >
              <Settings className="mr-2 h-4 w-4" />
              Tableau de bord modérateur
            </Button>

            <Button
              onClick={() => (window.location.href = "/forum")}
              variant="ghost"
              className="w-full"
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Retour au forum
            </Button>

            <Button
              onClick={() => (window.location.href = "/")}
              variant="ghost"
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
