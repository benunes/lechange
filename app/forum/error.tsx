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
import { Home, MessageSquare, Plus, RefreshCw } from "lucide-react";

interface ForumErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ForumError({ error, reset }: ForumErrorProps) {
  useEffect(() => {
    console.error("Forum Error:", error);
  }, [error]);

  const isNotFoundError =
    error.message.includes("404") || error.message.includes("not found");
  const isConnectionError =
    error.message.includes("ECONNREFUSED") || error.message.includes("fetch");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {isNotFoundError
              ? "Question introuvable"
              : isConnectionError
                ? "Problème de connexion"
                : "Erreur du forum"}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {isNotFoundError
              ? "La question que vous cherchez n'existe pas ou a été supprimée."
              : isConnectionError
                ? "Impossible de se connecter au serveur. Vérifiez votre connexion."
                : "Une erreur s'est produite lors du chargement du forum."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Détails de l'erreur :
              </p>
              <p className="mt-1 text-xs text-blue-700 dark:text-blue-300 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {!isNotFoundError && (
              <Button onClick={reset} className="w-full" variant="default">
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>
            )}

            <Button
              onClick={() => (window.location.href = "/forum/new")}
              variant="outline"
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Poser une question
            </Button>

            <Button
              onClick={() => (window.location.href = "/forum")}
              variant="ghost"
              className="w-full"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
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
