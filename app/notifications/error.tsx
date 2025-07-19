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
import { Bell, Home, RefreshCw, Settings } from "lucide-react";

interface NotificationsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function NotificationsError({
  error,
  reset,
}: NotificationsErrorProps) {
  useEffect(() => {
    console.error("Notifications Error:", error);
  }, [error]);

  const isConnectionError =
    error.message.includes("ECONNREFUSED") || error.message.includes("fetch");
  const isPermissionError =
    error.message.includes("403") || error.message.includes("Unauthorized");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/20">
            <Bell className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {isConnectionError
              ? "Problème de connexion"
              : isPermissionError
                ? "Accès non autorisé"
                : "Erreur des notifications"}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {isConnectionError
              ? "Impossible de charger vos notifications."
              : isPermissionError
                ? "Vous devez être connecté pour voir vos notifications."
                : "Une erreur s'est produite lors du chargement de vos notifications."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-lg bg-indigo-50 dark:bg-indigo-900/20 p-4">
              <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                Détails de l'erreur :
              </p>
              <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-300 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">
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
