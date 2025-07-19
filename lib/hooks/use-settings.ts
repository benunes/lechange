import { useEffect, useState } from "react";

export interface AppSettings {
  general: {
    appName: string;
    appDescription: string;
    appLogo: string;
    contactEmail: string;
    maintenanceMode: boolean;
  };
  moderation: {
    autoModeration: boolean;
    bannedWords: string[];
    maxReportsBeforeSuspension: number;
    requireApprovalForNewUsers: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    messageNotifications: boolean;
    forumNotifications: boolean;
    marketingEmails: boolean;
    digestFrequency: string;
  };
  upload: {
    maxImageSize: number;
    allowedFormats: string[];
    maxImagesPerListing: number;
    imageQuality: number;
  };
  security: {
    maxLoginAttempts: number;
    lockoutDuration: number;
    sessionTimeout: number;
    requireEmailVerification: boolean;
    twoFactorEnabled: boolean;
  };
  forum: {
    maxQuestionsPerDay: number;
    maxAnswersPerQuestion: number;
    pointsSystem: boolean;
    allowAnonymousQuestions: boolean;
  };
  listings: {
    maxListingsPerUser: number;
    autoExpireDays: number;
    requireApproval: boolean;
    allowPriceNegotiation: boolean;
    featuredListingPrice: number;
  };
}

interface UseSettingsReturn {
  settings: AppSettings | null;
  isLoading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

/**
 * Hook pour accéder aux paramètres de l'application
 */
export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      } else {
        throw new Error(data.error || 'Erreur lors du chargement des paramètres');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des paramètres");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSettings = async () => {
    try {
      setError(null);

      const response = await fetch('/api/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      } else {
        throw new Error(data.error || 'Erreur lors du rechargement des paramètres');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du rechargement des paramètres");
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    isLoading,
    error,
    refreshSettings,
  };
}

/**
 * Fonction pour mettre à jour les paramètres (côté client)
 */
export async function updateSettings(settings: Partial<AppSettings>): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ settings }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      return { success: true };
    } else {
      return { success: false, error: data.error || 'Erreur lors de la mise à jour des paramètres' };
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erreur lors de la mise à jour des paramètres"
    };
  }
}

/**
 * Hook pour un paramètre spécifique
 */
export function useSetting<T = any>(path: string, defaultValue?: T): T | undefined {
  const { settings } = useSettings();

  if (!settings) return defaultValue;

  const result = path.split('.').reduce((current: any, key: string) => {
    return current?.[key];
  }, settings);

  return result !== undefined ? result : defaultValue;
}

/**
 * Hooks spécialisés pour différentes catégories de paramètres
 */
export function useMaintenanceMode(): boolean {
  const isMaintenanceMode = useSetting<boolean>("general.maintenanceMode", false);
  return isMaintenanceMode ?? false;
}

export function useUploadLimits() {
  const { settings } = useSettings();
  return {
    maxImageSize: settings?.upload.maxImageSize ?? 5,
    allowedFormats: settings?.upload.allowedFormats ?? ["jpg", "jpeg", "png", "webp"],
    maxImagesPerListing: settings?.upload.maxImagesPerListing ?? 8,
    imageQuality: settings?.upload.imageQuality ?? 80,
  };
}

export function useForumLimits() {
  const { settings } = useSettings();
  return {
    maxQuestionsPerDay: settings?.forum.maxQuestionsPerDay ?? 10,
    maxAnswersPerQuestion: settings?.forum.maxAnswersPerQuestion ?? 50,
    pointsSystem: settings?.forum.pointsSystem ?? true,
    allowAnonymousQuestions: settings?.forum.allowAnonymousQuestions ?? false,
  };
}

export function useModerationSettings() {
  const { settings } = useSettings();
  return {
    autoModeration: settings?.moderation.autoModeration ?? true,
    bannedWords: settings?.moderation.bannedWords ?? [],
    maxReportsBeforeSuspension: settings?.moderation.maxReportsBeforeSuspension ?? 5,
    requireApprovalForNewUsers: settings?.moderation.requireApprovalForNewUsers ?? false,
  };
}

export function useSecuritySettings() {
  const { settings } = useSettings();
  return {
    maxLoginAttempts: settings?.security.maxLoginAttempts ?? 5,
    lockoutDuration: settings?.security.lockoutDuration ?? 30,
    sessionTimeout: settings?.security.sessionTimeout ?? 24,
    requireEmailVerification: settings?.security.requireEmailVerification ?? true,
    twoFactorEnabled: settings?.security.twoFactorEnabled ?? false,
  };
}

export function useNotificationSettings() {
  const { settings } = useSettings();
  return {
    emailNotifications: settings?.notifications.emailNotifications ?? true,
    pushNotifications: settings?.notifications.pushNotifications ?? true,
    messageNotifications: settings?.notifications.messageNotifications ?? true,
    forumNotifications: settings?.notifications.forumNotifications ?? true,
    marketingEmails: settings?.notifications.marketingEmails ?? false,
    digestFrequency: settings?.notifications.digestFrequency ?? "weekly",
  };
}

export function useListingSettings() {
  const { settings } = useSettings();
  return {
    maxListingsPerUser: settings?.listings.maxListingsPerUser ?? 50,
    autoExpireDays: settings?.listings.autoExpireDays ?? 30,
    requireApproval: settings?.listings.requireApproval ?? false,
    allowPriceNegotiation: settings?.listings.allowPriceNegotiation ?? true,
    featuredListingPrice: settings?.listings.featuredListingPrice ?? 5,
  };
}
