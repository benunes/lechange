"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useAsyncOperation,
  useErrorHandler,
  useFormErrorHandler,
} from "@/lib/hooks/use-error-handler";
import { AppError } from "@/lib/errors";
import { toast } from "sonner";
import {
  AlertCircle,
  AlertTriangle,
  Bug,
  Network,
  Shield,
  Zap,
} from "lucide-react";

export default function ErrorTestPage() {
  const { handleError, error, clearError } = useErrorHandler();
  const { execute, isLoading, data } = useAsyncOperation();
  const { handleFormError, fieldErrors } = useFormErrorHandler();

  // Test des différents types d'erreurs
  const testNetworkError = async () => {
    try {
      // Simuler une erreur réseau
      await fetch("http://nonexistent-server.test/api/test");
    } catch (err) {
      handleError(
        new Error("Network request failed: ECONNREFUSED"),
        "Test erreur réseau",
      );
    }
  };

  const testPermissionError = () => {
    const permissionError = new AppError(
      "403 Forbidden: Access denied",
      "permission",
      403,
    );
    handleError(permissionError, "Test erreur de permission");
  };

  const testValidationError = () => {
    const validationError = new AppError(
      "Le champ 'email' est requis, Le champ 'password' a un format invalide",
      "validation",
      400,
    );
    handleFormError(validationError, "Test erreur de validation");
  };

  const testServerError = () => {
    const serverError = new AppError(
      "Internal server error: Database connection failed",
      "server",
      500,
    );
    handleError(serverError, "Test erreur serveur");
  };

  const testClientError = () => {
    const clientError = new AppError(
      "404 Not found: Resource not found",
      "client",
      404,
    );
    handleError(clientError, "Test erreur client");
  };

  const testUnknownError = () => {
    const unknownError = new Error("Une erreur bizarre et inattendue");
    handleError(unknownError, "Test erreur inconnue");
  };

  const testAsyncOperation = () => {
    execute(
      async () => {
        // Simuler une opération qui échoue
        await new Promise((resolve) => setTimeout(resolve, 1000));
        throw new AppError("Opération async échouée", "server", 500);
      },
      {
        context: "Test opération async",
        showErrorToast: true,
        onError: (errorInfo) => {
          console.log("Erreur capturée par useAsyncOperation:", errorInfo);
        },
      },
    ).catch(() => {
      // L'erreur est déjà gérée par le hook
    });
  };

  const testErrorBoundary = () => {
    // Déclencher une erreur qui sera capturée par ErrorBoundary
    throw new Error("Erreur pour tester ErrorBoundary React");
  };

  const testAPIError = async () => {
    try {
      const response = await fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "test",
          message: "Test API error logging",
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      toast.success("Erreur envoyée à l'API avec succès");
    } catch (err) {
      handleError(err as Error, "Test API error");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Test du Système de Gestion d'Erreur
        </h1>
        <p className="text-muted-foreground">
          Cette page permet de tester tous les types d'erreurs gérés par
          l'application
        </p>
      </div>

      {/* Affichage de l'erreur actuelle */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/10 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Erreur capturée : {error.type}
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              {error.message}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={clearError} variant="outline" size="sm">
              Effacer l'erreur
            </Button>
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              Timestamp: {error.timestamp.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tests des erreurs par catégorie */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Erreur Réseau */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5 text-blue-600" />
              Erreur Réseau
            </CardTitle>
            <CardDescription>
              Test d'une erreur de connexion réseau
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testNetworkError}
              className="w-full"
              variant="outline"
            >
              Tester erreur réseau
            </Button>
          </CardContent>
        </Card>

        {/* Erreur Permission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-600" />
              Erreur Permission
            </CardTitle>
            <CardDescription>
              Test d'une erreur d'accès refusé (403)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testPermissionError}
              className="w-full"
              variant="outline"
            >
              Tester erreur permission
            </Button>
          </CardContent>
        </Card>

        {/* Erreur Validation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Erreur Validation
            </CardTitle>
            <CardDescription>
              Test d'erreurs de validation de formulaire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testValidationError}
              className="w-full"
              variant="outline"
            >
              Tester erreur validation
            </Button>
            {Object.keys(fieldErrors).length > 0 && (
              <div className="mt-2 text-xs text-red-600">
                Erreurs de champs : {Object.keys(fieldErrors).join(", ")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Erreur Serveur */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-red-600" />
              Erreur Serveur
            </CardTitle>
            <CardDescription>
              Test d'une erreur serveur interne (500)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testServerError}
              className="w-full"
              variant="outline"
            >
              Tester erreur serveur
            </Button>
          </CardContent>
        </Card>

        {/* Erreur Client */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-gray-600" />
              Erreur Client
            </CardTitle>
            <CardDescription>
              Test d'une erreur 404 (ressource introuvable)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testClientError}
              className="w-full"
              variant="outline"
            >
              Tester erreur client
            </Button>
          </CardContent>
        </Card>

        {/* Erreur Inconnue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-purple-600" />
              Erreur Inconnue
            </CardTitle>
            <CardDescription>Test d'une erreur non classifiée</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testUnknownError}
              className="w-full"
              variant="outline"
            >
              Tester erreur inconnue
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tests avancés */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Opération Async */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-indigo-600" />
              Test Opération Async
            </CardTitle>
            <CardDescription>
              Test du hook useAsyncOperation avec gestion d'erreur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testAsyncOperation}
              className="w-full"
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? "Chargement..." : "Tester opération async"}
            </Button>
          </CardContent>
        </Card>

        {/* Test ErrorBoundary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-red-600" />
              Test ErrorBoundary
            </CardTitle>
            <CardDescription>
              Déclenche une erreur React capturée par ErrorBoundary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testErrorBoundary}
              className="w-full"
              variant="destructive"
            >
              Déclencher ErrorBoundary
            </Button>
          </CardContent>
        </Card>

        {/* Test API Logging */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5 text-green-600" />
              Test API Error Logging
            </CardTitle>
            <CardDescription>
              Test de l'envoi d'erreurs vers l'API /api/errors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testAPIError} className="w-full" variant="outline">
              Envoyer erreur vers API
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Informations sur le système */}
      <Card>
        <CardHeader>
          <CardTitle>Informations sur le Système d'Erreur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Types d'erreurs supportés :</strong> network, permission,
            validation, server, client, unknown
          </p>
          <p>
            <strong>Fonctionnalités :</strong> Classification automatique,
            logging centralisé, messages utilisateur conviviaux
          </p>
          <p>
            <strong>Composants :</strong> ErrorBoundary React, Hooks
            utilitaires, API error handling
          </p>
          <p>
            <strong>Mode développement :</strong> Détails techniques affichés
            dans les erreurs
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
