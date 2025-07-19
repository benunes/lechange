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
import { Home, RefreshCw, Settings, Shield } from "lucide-react";

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    console.error("Admin Panel Error:", error);
  }, [error]);

  const isPermissionError =
    error.message.includes("403") ||
    error.message.includes("Forbidden") ||
    error.message.includes("Unauthorized");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {isPermissionError ? "Accès refusé" : "Erreur d'administration"}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {isPermissionError
              ? "Vous n'avez pas les permissions nécessaires pour accéder à cette section."
              : "Une erreur s'est produite dans le panneau d'administration."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 p-4">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Détails de l'erreur :
              </p>
              <p className="mt-1 text-xs text-orange-700 dark:text-orange-300 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
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
              onClick={() => (window.location.href = "/admin")}
              variant="outline"
              className="w-full"
            >
              <Settings className="mr-2 h-4 w-4" />
              Retour au tableau de bord
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
