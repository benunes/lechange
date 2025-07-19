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
import { Home, Inbox, MessageCircle, RefreshCw } from "lucide-react";

interface MessagesErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MessagesError({ error, reset }: MessagesErrorProps) {
  useEffect(() => {
    console.error("Messages Error:", error);
  }, [error]);

  const isNotFoundError =
    error.message.includes("404") || error.message.includes("not found");
  const isConnectionError =
    error.message.includes("ECONNREFUSED") || error.message.includes("fetch");
  const isPermissionError =
    error.message.includes("403") || error.message.includes("Unauthorized");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
            <MessageCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {isNotFoundError
              ? "Conversation introuvable"
              : isConnectionError
                ? "Problème de connexion"
                : isPermissionError
                  ? "Accès non autorisé"
                  : "Erreur de messagerie"}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {isNotFoundError
              ? "Cette conversation n'existe pas ou a été supprimée."
              : isConnectionError
                ? "Impossible de charger vos messages. Vérifiez votre connexion."
                : isPermissionError
                  ? "Vous n'êtes pas autorisé à voir cette conversation."
                  : "Une erreur s'est produite lors du chargement de vos messages."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-4">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Détails de l'erreur :
              </p>
              <p className="mt-1 text-xs text-purple-700 dark:text-purple-300 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">
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

            <Button
              onClick={() => (window.location.href = "/messages")}
              variant="outline"
              className="w-full"
            >
              <Inbox className="mr-2 h-4 w-4" />
              Mes messages
            </Button>

            <Button
              onClick={() => (window.location.href = "/listings")}
              variant="ghost"
              className="w-full"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Voir les annonces
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
