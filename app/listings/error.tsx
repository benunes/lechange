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
import { Home, Plus, RefreshCw, ShoppingBag } from "lucide-react";

interface ListingsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ListingsError({ error, reset }: ListingsErrorProps) {
  useEffect(() => {
    console.error("Listings Error:", error);
  }, [error]);

  const isNotFoundError =
    error.message.includes("404") || error.message.includes("not found");
  const isConnectionError =
    error.message.includes("ECONNREFUSED") || error.message.includes("fetch");
  const isUploadError =
    error.message.includes("upload") || error.message.includes("image");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <ShoppingBag className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {isNotFoundError
              ? "Annonce introuvable"
              : isConnectionError
                ? "Problème de connexion"
                : isUploadError
                  ? "Erreur de téléchargement"
                  : "Erreur des annonces"}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {isNotFoundError
              ? "L'annonce que vous cherchez n'existe pas ou a été supprimée."
              : isConnectionError
                ? "Impossible de se connecter au serveur. Vérifiez votre connexion."
                : isUploadError
                  ? "Erreur lors du téléchargement des images. Réessayez avec des fichiers plus petits."
                  : "Une erreur s'est produite lors du chargement des annonces."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Détails de l'erreur :
              </p>
              <p className="mt-1 text-xs text-green-700 dark:text-green-300 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
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
              onClick={() => (window.location.href = "/listings/new")}
              variant="outline"
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Créer une annonce
            </Button>

            <Button
              onClick={() => (window.location.href = "/listings")}
              variant="ghost"
              className="w-full"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Voir toutes les annonces
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
