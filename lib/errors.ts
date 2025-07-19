// Système de gestion d'erreur centralisé
export interface ErrorInfo {
  type:
    | "network"
    | "permission"
    | "validation"
    | "server"
    | "client"
    | "unknown";
  code?: string | number;
  message: string;
  details?: string;
  digest?: string;
  timestamp: Date;
}

export class AppError extends Error {
  public readonly type: ErrorInfo["type"];
  public readonly code?: string | number;
  public readonly details?: string;
  public readonly digest?: string;
  public readonly timestamp: Date;

  constructor(
    message: string,
    type: ErrorInfo["type"] = "unknown",
    code?: string | number,
    details?: string,
  ) {
    super(message);
    this.name = "AppError";
    this.type = type;
    this.code = code;
    this.details = details;
    this.timestamp = new Date();

    // Génère un digest unique pour l'erreur
    this.digest = this.generateDigest();
  }

  private generateDigest(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  public toJSON(): ErrorInfo {
    return {
      type: this.type,
      code: this.code,
      message: this.message,
      details: this.details,
      digest: this.digest,
      timestamp: this.timestamp,
    };
  }
}

// Analyseur de type d'erreur
export function analyzeError(error: Error): ErrorInfo {
  const message = error.message.toLowerCase();

  // Erreurs de réseau
  if (
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("econnrefused")
  ) {
    return {
      type: "network",
      message: error.message,
      timestamp: new Date(),
      digest: (error as any).digest,
    };
  }

  // Erreurs de permission
  if (
    message.includes("403") ||
    message.includes("401") ||
    message.includes("unauthorized") ||
    message.includes("forbidden")
  ) {
    return {
      type: "permission",
      message: error.message,
      timestamp: new Date(),
      digest: (error as any).digest,
    };
  }

  // Erreurs de validation
  if (
    message.includes("validation") ||
    message.includes("invalid") ||
    message.includes("required")
  ) {
    return {
      type: "validation",
      message: error.message,
      timestamp: new Date(),
      digest: (error as any).digest,
    };
  }

  // Erreurs serveur
  if (
    message.includes("500") ||
    message.includes("server") ||
    message.includes("database")
  ) {
    return {
      type: "server",
      message: error.message,
      timestamp: new Date(),
      digest: (error as any).digest,
    };
  }

  // Erreurs client
  if (message.includes("404") || message.includes("not found")) {
    return {
      type: "client",
      message: error.message,
      timestamp: new Date(),
      digest: (error as any).digest,
    };
  }

  // Erreur inconnue
  return {
    type: "unknown",
    message: error.message,
    timestamp: new Date(),
    digest: (error as any).digest,
  };
}

// Logger d'erreurs
export class ErrorLogger {
  private static instance: ErrorLogger;

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  public log(error: Error, context?: string): void {
    const errorInfo = analyzeError(error);

    // Log en console pour le développement
    if (process.env.NODE_ENV === "development") {
      console.group(`🚨 Error ${errorInfo.type.toUpperCase()}`);
      console.error("Message:", errorInfo.message);
      if (context) console.log("Context:", context);
      if (errorInfo.digest) console.log("Digest:", errorInfo.digest);
      console.log("Timestamp:", errorInfo.timestamp);
      console.trace("Stack trace:");
      console.groupEnd();
    }

    // En production, on pourrait envoyer à un service de monitoring
    if (process.env.NODE_ENV === "production") {
      this.sendToMonitoringService(errorInfo, context);
    }
  }

  private sendToMonitoringService(
    errorInfo: ErrorInfo,
    context?: string,
  ): void {
    // Implémentation du service de monitoring
    try {
      fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...errorInfo, context }),
      }).catch(() => {
        // Ignore les erreurs de logging pour éviter les boucles infinies
      });
    } catch {
      // Ignore silencieusement les erreurs de logging
    }
  }
}
