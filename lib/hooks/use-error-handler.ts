"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  analyzeError,
  AppError,
  type ErrorInfo,
  ErrorLogger,
} from "@/lib/errors";

// Hook principal pour la gestion d'erreur côté client
export function useErrorHandler() {
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const logger = ErrorLogger.getInstance();

  const handleError = useCallback(
    (error: Error, context?: string, showToast = true) => {
      const errorInfo = analyzeError(error);
      setError(errorInfo);

      // Log l'erreur
      logger.log(error, context);

      // Afficher un toast d'erreur si demandé
      if (showToast) {
        const toastMessage = getUserFriendlyMessage(errorInfo);
        toast.error(toastMessage);
      }

      return errorInfo;
    },
    [logger],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createAppError = useCallback(
    (
      message: string,
      type: ErrorInfo["type"] = "unknown",
      code?: string | number,
    ) => {
      return new AppError(message, type, code);
    },
    [],
  );

  return {
    error,
    handleError,
    clearError,
    createAppError,
    isLoading,
    setIsLoading,
  };
}

// Hook pour les opérations async avec gestion d'erreur automatique
export function useAsyncOperation<T = any>() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const { handleError } = useErrorHandler();

  const execute = useCallback(
    async (
      operation: () => Promise<T>,
      options?: {
        onSuccess?: (data: T) => void;
        onError?: (error: ErrorInfo) => void;
        showSuccessToast?: boolean;
        successMessage?: string;
        showErrorToast?: boolean;
        context?: string;
      },
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await operation();
        setData(result);

        if (options?.onSuccess) {
          options.onSuccess(result);
        }

        if (options?.showSuccessToast && options?.successMessage) {
          toast.success(options.successMessage);
        }

        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Opération échouée");
        const errorInfo = handleError(
          error,
          options?.context,
          options?.showErrorToast,
        );
        setError(errorInfo);

        if (options?.onError) {
          options.onError(errorInfo);
        }

        throw errorInfo;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    execute,
    data,
    error,
    isLoading,
    reset,
  };
}

// Hook pour la gestion d'erreur des formulaires
export function useFormErrorHandler() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { handleError } = useErrorHandler();

  const setFieldError = useCallback((field: string, message: string) => {
    setFieldErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllFieldErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const handleFormError = useCallback(
    (error: Error, context?: string) => {
      const errorInfo = handleError(error, context, false);

      // Si c'est une erreur de validation, essayer de mapper aux champs
      if (errorInfo.type === "validation" && error.message.includes(",")) {
        const fieldMessages = error.message.split(",");
        const newFieldErrors: Record<string, string> = {};

        fieldMessages.forEach((msg) => {
          const match = msg.match(/Le champ '([^']+)'/);
          if (match) {
            newFieldErrors[match[1]] = msg.trim();
          }
        });

        if (Object.keys(newFieldErrors).length > 0) {
          setFieldErrors(newFieldErrors);
          return;
        }
      }

      // Sinon, afficher l'erreur générale
      toast.error(getUserFriendlyMessage(errorInfo));
    },
    [handleError],
  );

  return {
    fieldErrors,
    setFieldError,
    clearFieldError,
    clearAllFieldErrors,
    handleFormError,
  };
}

// Hook pour retry automatique
export function useRetryableOperation<T>() {
  const { execute, ...rest } = useAsyncOperation<T>();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const executeWithRetry = useCallback(
    async (
      operation: () => Promise<T>,
      options?: Parameters<typeof execute>[1] & {
        maxRetries?: number;
        retryDelay?: number;
      },
    ) => {
      const actualMaxRetries = options?.maxRetries ?? maxRetries;
      const retryDelay = options?.retryDelay ?? 1000;

      for (let attempt = 0; attempt <= actualMaxRetries; attempt++) {
        try {
          const result = await execute(operation, {
            ...options,
            showErrorToast: attempt === actualMaxRetries, // Seulement au dernier essai
          });
          setRetryCount(0); // Reset sur succès
          return result;
        } catch (error: any) {
          setRetryCount(attempt + 1);

          if (attempt === actualMaxRetries) {
            throw error; // Dernier essai, propager l'erreur
          }

          // Attendre avant de réessayer (seulement pour les erreurs réseau)
          if (error.type === "network") {
            await new Promise((resolve) =>
              setTimeout(resolve, retryDelay * (attempt + 1)),
            );
          } else {
            throw error; // Ne pas réessayer pour les autres types d'erreurs
          }
        }
      }
    },
    [execute, maxRetries],
  );

  return {
    executeWithRetry,
    retryCount,
    ...rest,
  };
}

// Fonction utilitaire pour convertir les erreurs techniques en messages utilisateur
function getUserFriendlyMessage(errorInfo: ErrorInfo): string {
  switch (errorInfo.type) {
    case "network":
      return "Problème de connexion. Vérifiez votre connexion internet et réessayez.";
    case "permission":
      if (errorInfo.message.includes("401")) {
        return "Vous devez vous connecter pour effectuer cette action.";
      }
      return "Vous n'avez pas les permissions nécessaires pour cette action.";
    case "validation":
      return errorInfo.message.startsWith("Le champ")
        ? errorInfo.message
        : "Les informations saisies ne sont pas valides.";
    case "client":
      return "La ressource demandée n'existe pas.";
    case "server":
      return "Une erreur technique est survenue. Nos équipes ont été notifiées.";
    default:
      return "Une erreur inattendue s'est produite. Veuillez réessayer.";
  }
}
