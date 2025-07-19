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
import { AlertCircle, Home, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log l'erreur à un service de monitoring (comme Sentry)
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Oups ! Une erreur s'est produite
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Nous sommes désolés, quelque chose s'est mal passé. Veuillez
            réessayer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Détails de l'erreur (développement) :
              </p>
              <p className="mt-1 text-xs text-red-700 dark:text-red-300 font-mono">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  ID d'erreur: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button onClick={reset} className="w-full" variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>

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
