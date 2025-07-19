"use client";

import React from "react";
import { analyzeError, type ErrorInfo, ErrorLogger } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  AlertTriangle,
  Bug,
  Home,
  Network,
  RefreshCw,
  Shield,
} from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private logger = ErrorLogger.getInstance();

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorInfo: analyzeError(error),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.logger.log(error, `React Error Boundary: ${errorInfo.componentStack}`);
    this.props.onError?.(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return (
          <this.props.fallback
            error={this.state.error}
            reset={this.handleReset}
          />
        );
      }

      return (
        <GlobalErrorDisplay error={this.state.error} reset={this.handleReset} />
      );
    }

    return this.props.children;
  }
}

// Composant d'affichage d'erreur global
interface GlobalErrorDisplayProps {
  error: Error;
  reset: () => void;
  showBackHome?: boolean;
}

export function GlobalErrorDisplay({
  error,
  reset,
  showBackHome = true,
}: GlobalErrorDisplayProps) {
  const errorInfo = analyzeError(error);

  const getErrorIcon = () => {
    switch (errorInfo.type) {
      case "network":
        return Network;
      case "permission":
        return Shield;
      case "validation":
        return AlertCircle;
      case "server":
        return Bug;
      default:
        return AlertTriangle;
    }
  };

  const getErrorTitle = () => {
    switch (errorInfo.type) {
      case "network":
        return "Problème de connexion";
      case "permission":
        return "Accès refusé";
      case "validation":
        return "Données invalides";
      case "server":
        return "Erreur serveur";
      case "client":
        return "Page introuvable";
      default:
        return "Une erreur s'est produite";
    }
  };

  const getErrorDescription = () => {
    switch (errorInfo.type) {
      case "network":
        return "Vérifiez votre connexion internet et réessayez.";
      case "permission":
        return "Vous n'avez pas les permissions nécessaires pour cette action.";
      case "validation":
        return "Les informations saisies ne sont pas valides.";
      case "server":
        return "Un problème technique est survenu. Nos équipes ont été notifiées.";
      case "client":
        return "La page que vous cherchez n'existe pas.";
      default:
        return "Une erreur inattendue s'est produite.";
    }
  };

  const Icon = getErrorIcon();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <Icon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {getErrorTitle()}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {getErrorDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Détails techniques :
              </p>
              <p className="mt-1 text-xs text-red-700 dark:text-red-300 font-mono break-all">
                {error.message}
              </p>
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                Type: {errorInfo.type} | Timestamp:{" "}
                {errorInfo.timestamp.toLocaleString()}
              </p>
              {errorInfo.digest && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  ID: {errorInfo.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {errorInfo.type !== "client" && (
              <Button onClick={reset} className="w-full" variant="default">
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>
            )}

            {showBackHome && (
              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
