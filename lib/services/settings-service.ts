import { prisma } from "@/lib/db";

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

// Paramètres par défaut
export const DEFAULT_SETTINGS: AppSettings = {
  general: {
    appName: "LeChange",
    appDescription: "Plateforme d'échange pour les jeunes",
    appLogo: "/logo.png",
    contactEmail: "contact@lechange.com",
    maintenanceMode: false,
  },
  moderation: {
    autoModeration: true,
    bannedWords: ["spam", "arnaque", "fake"],
    maxReportsBeforeSuspension: 5,
    requireApprovalForNewUsers: false,
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    messageNotifications: true,
    forumNotifications: true,
    marketingEmails: false,
    digestFrequency: "weekly",
  },
  upload: {
    maxImageSize: 5,
    allowedFormats: ["jpg", "jpeg", "png", "webp"],
    maxImagesPerListing: 8,
    imageQuality: 80,
  },
  security: {
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    sessionTimeout: 24,
    requireEmailVerification: true,
    twoFactorEnabled: false,
  },
  forum: {
    maxQuestionsPerDay: 10,
    maxAnswersPerQuestion: 50,
    pointsSystem: true,
    allowAnonymousQuestions: false,
  },
  listings: {
    maxListingsPerUser: 50,
    autoExpireDays: 30,
    requireApproval: false,
    allowPriceNegotiation: true,
    featuredListingPrice: 5,
  },
};

class SettingsService {
  private cache: AppSettings | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Récupère les paramètres depuis la base de données avec cache
   */
  async getSettings(): Promise<AppSettings> {
    // Vérifier le cache
    if (this.cache && (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cache;
    }

    try {
      const settings = await prisma.appSettings.findFirst({
        where: { id: 'default' },
        orderBy: { updatedAt: 'desc' }
      });

      if (!settings) {
        // Retourner les paramètres par défaut si aucun n'est trouvé
        this.cache = DEFAULT_SETTINGS;
        this.cacheTimestamp = Date.now();
        return DEFAULT_SETTINGS;
      }

      // Parser les données JSON et merger avec les paramètres par défaut
      const settingsData = JSON.parse(settings.data);
      const mergedSettings = this.mergeWithDefaults(settingsData);
      this.cache = mergedSettings;
      this.cacheTimestamp = Date.now();

      return mergedSettings;
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Met à jour les paramètres
   */
  async updateSettings(newSettings: Partial<AppSettings>, userId: string): Promise<AppSettings> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = this.deepMerge(currentSettings, newSettings);

      await prisma.appSettings.upsert({
        where: { id: 'default' },
        create: {
          id: 'default',
          data: JSON.stringify(updatedSettings),
          updatedBy: userId,
        },
        update: {
          data: JSON.stringify(updatedSettings),
          updatedBy: userId,
          updatedAt: new Date(),
        },
      });

      // Invalider le cache
      this.cache = updatedSettings;
      this.cacheTimestamp = Date.now();

      return updatedSettings;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      throw error;
    }
  }

  /**
   * Force le rechargement des paramètres depuis la base de données
   */
  async refreshSettings(): Promise<AppSettings> {
    this.cache = null;
    this.cacheTimestamp = 0;
    return await this.getSettings();
  }

  /**
   * Merge les paramètres avec les valeurs par défaut
   */
  private mergeWithDefaults(settings: any): AppSettings {
    return this.deepMerge(DEFAULT_SETTINGS, settings);
  }

  /**
   * Deep merge de deux objets
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * Récupère un paramètre spécifique
   */
  async getSetting<T>(path: string, defaultValue?: T): Promise<T | undefined> {
    const settings = await this.getSettings();
    return path.split('.').reduce((current: any, key: string) => current?.[key], settings) ?? defaultValue;
  }

  /**
   * Vérifier si le mode maintenance est activé
   */
  async isMaintenanceMode(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.general.maintenanceMode;
  }

  /**
   * Vérifier si la modération automatique est activée
   */
  async isAutoModerationEnabled(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.moderation.autoModeration;
  }

  /**
   * Récupérer les mots bannis
   */
  async getBannedWords(): Promise<string[]> {
    const settings = await this.getSettings();
    return settings.moderation.bannedWords;
  }

  /**
   * Récupérer les limites d'upload
   */
  async getUploadLimits() {
    const settings = await this.getSettings();
    return {
      maxImageSize: settings.upload.maxImageSize,
      allowedFormats: settings.upload.allowedFormats,
      maxImagesPerListing: settings.upload.maxImagesPerListing,
      imageQuality: settings.upload.imageQuality,
    };
  }

  /**
   * Récupérer les limites du forum
   */
  async getForumLimits() {
    const settings = await this.getSettings();
    return {
      maxQuestionsPerDay: settings.forum.maxQuestionsPerDay,
      maxAnswersPerQuestion: settings.forum.maxAnswersPerQuestion,
      pointsSystem: settings.forum.pointsSystem,
      allowAnonymousQuestions: settings.forum.allowAnonymousQuestions,
    };
  }

  /**
   * Récupérer les paramètres de sécurité
   */
  async getSecuritySettings() {
    const settings = await this.getSettings();
    return {
      maxLoginAttempts: settings.security.maxLoginAttempts,
      lockoutDuration: settings.security.lockoutDuration,
      sessionTimeout: settings.security.sessionTimeout,
      requireEmailVerification: settings.security.requireEmailVerification,
      twoFactorEnabled: settings.security.twoFactorEnabled,
    };
  }
}

// Instance singleton
export const settingsService = new SettingsService();
